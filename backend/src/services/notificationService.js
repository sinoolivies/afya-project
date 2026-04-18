import nodemailer from 'nodemailer';

const getGeminiModel = () => process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const fallbackTemplate = ({ subject, context }) => {
  if (context?.type === 'appointment_created') {
    return {
      subject,
      html: `
        <h2>New pending appointment</h2>
        <p>A new appointment request needs review.</p>
        <p><strong>Patient:</strong> ${context.patientName}</p>
        <p><strong>Doctor:</strong> ${context.doctorName}</p>
        <p><strong>Hospital:</strong> ${context.hospitalName}</p>
        <p><strong>Date:</strong> ${context.dateLabel}</p>
        <p><strong>Reason:</strong> ${context.reason}</p>
      `,
    };
  }

  if (context?.type === 'appointment_status_updated') {
    return {
      subject,
      html: `
        <h2>Appointment ${context.statusLabel}</h2>
        <p>Hello ${context.patientName},</p>
        <p>Your appointment with ${context.doctorName} at ${context.hospitalName} has been ${context.statusLabel.toLowerCase()}.</p>
        <p><strong>Date:</strong> ${context.dateLabel}</p>
        <p><strong>Notes:</strong> ${context.notes || 'No additional notes were provided.'}</p>
      `,
    };
  }

  return {
    subject,
    html: `<p>${subject}</p>`,
  };
};

const composeWithGemini = async ({ subject, context }) => {
  if (!process.env.GOOGLE_API_KEY || !context) {
    return fallbackTemplate({ subject, context });
  }

  const prompt = `
You are composing a concise, professional healthcare notification email.
Return JSON with exactly two keys: "subject" and "html".
Do not add markdown fences.
Use only the factual context below.
${JSON.stringify({ subject, context })}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiModel()}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini returned ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);

    if (!parsed?.subject || !parsed?.html) {
      throw new Error('Invalid Gemini email payload');
    }

    return parsed;
  } catch (error) {
    console.warn('Notification composition fallback:', error.message);
    return fallbackTemplate({ subject, context });
  }
};

export const sendAppointmentNotification = async ({
  to,
  subject,
  html,
  channel = 'email',
  context = null,
}) => {
  const message = html ? { subject, html } : await composeWithGemini({ subject, context });
  const transporter = getTransporter();

  if (!to) {
    return {
      accepted: false,
      channel,
      to: null,
      subject: message.subject,
      preview: message.html.slice(0, 120),
      sentAt: new Date().toISOString(),
      provider: process.env.EMAIL_PROVIDER || 'console',
    };
  }

  if (!transporter) {
    const payload = {
      accepted: true,
      channel,
      to,
      subject: message.subject,
      preview: message.html.slice(0, 120),
      sentAt: new Date().toISOString(),
      provider: process.env.EMAIL_PROVIDER || 'console',
    };

    console.log('Notification queued', payload);
    return payload;
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: message.subject,
    html: message.html,
  });

  return {
    accepted: true,
    channel,
    to,
    subject: message.subject,
    preview: message.html.slice(0, 120),
    sentAt: new Date().toISOString(),
    provider: 'gmail',
    messageId: info.messageId,
  };
};
