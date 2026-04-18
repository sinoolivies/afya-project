import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import { APPOINTMENT_STATUS } from '../constants/appointmentStatus.js';
import { upsertPatient } from '../services/patientService.js';
import { getDoctorSlots } from '../services/schedulingService.js';
import { sendAppointmentNotification } from '../services/notificationService.js';
import User from '../models/User.js';

const appointmentPopulation = [
  { path: 'hospitalId', select: 'name slug contact address' },
  {
    path: 'doctorId',
    populate: {
      path: 'userId',
      select: 'fullName email phone',
    },
  },
  { path: 'patientId', select: 'fullName email phone location' },
];

export const getAppointments = asyncHandler(async (req, res) => {
  const filter = { hospitalId: req.user.hospitalId };

  if (req.user.role === 'doctor') {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      throw new AppError('Doctor profile not found', 404);
    }
    filter.doctorId = doctorProfile._id;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.doctorId && req.user.role !== 'doctor') {
    filter.doctorId = req.query.doctorId;
  }

  const appointments = await Appointment.find(filter)
    .populate(appointmentPopulation)
    .sort({ scheduledFor: 1 });

  res.status(200).json({ success: true, count: appointments.length, data: appointments });
});

export const getAppointment = asyncHandler(async (req, res) => {
  const filter = {
    _id: req.params.id,
    hospitalId: req.user.hospitalId,
  };

  if (req.user.role === 'doctor') {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      throw new AppError('Doctor profile not found', 404);
    }
    filter.doctorId = doctorProfile._id;
  }

  const appointment = await Appointment.findOne(filter).populate(appointmentPopulation);

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  res.status(200).json({ success: true, data: appointment });
});

const createPendingAppointment = async ({ payload, source }) => {
  const patient = await upsertPatient(payload.patient);
  const doctor = await Doctor.findById(payload.doctorId);

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  const hospital = await Hospital.findById(payload.hospitalId || doctor.hospitalId);
  if (!hospital || hospital.status !== 'active' || !hospital.acceptingAppointments) {
    throw new AppError('Hospital is not accepting appointments', 400);
  }

  if (String(doctor.hospitalId) !== String(hospital._id)) {
    throw new AppError('Doctor does not belong to the selected hospital', 400);
  }

  const normalizedEmail = payload.patient.email.trim().toLowerCase();

  const duplicateBooking = await Appointment.findOne({
    hospitalId: hospital._id,
    patientEmail: normalizedEmail,
    slotStart: new Date(payload.slotStart),
  });

  if (duplicateBooking) {
    throw new AppError(
      'This patient email already has an appointment at the same hospital and time slot',
      409
    );
  }

  const slots = await getDoctorSlots({
    doctorId: doctor._id,
    hospitalId: hospital._id,
    date: payload.scheduledFor,
  });

  const requestedStart = new Date(payload.slotStart).toISOString();
  const requestedEnd = new Date(payload.slotEnd).toISOString();
  const isSlotAvailable = slots.some((slot) => slot.start === requestedStart && slot.end === requestedEnd);

  if (!isSlotAvailable) {
    throw new AppError('Requested slot is no longer available', 409);
  }

  const appointment = await Appointment.create({
    hospitalId: hospital._id,
    doctorId: doctor._id,
    patientId: patient._id,
    patientEmail: normalizedEmail,
    source,
    reason: payload.reason,
    symptoms: payload.symptoms,
    triage: payload.triage || {},
    scheduledFor: payload.scheduledFor,
    slotStart: payload.slotStart,
    slotEnd: payload.slotEnd,
    status: APPOINTMENT_STATUS.PENDING,
  });

  const populated = await Appointment.findById(appointment._id).populate(appointmentPopulation);
  const adminUser = await User.findOne({
    hospitalId: hospital._id,
    role: 'hospital_admin',
    status: 'active',
  }).lean();

  const notification = await sendAppointmentNotification({
    to: adminUser?.email || hospital.contact?.email,
    subject: `Pending appointment review for ${patient.fullName}`,
    context: {
      type: 'appointment_created',
      patientName: patient.fullName,
      doctorName: populated.doctorId?.userId?.fullName || 'Assigned doctor',
      hospitalName: hospital.name,
      dateLabel: new Date(populated.slotStart).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      reason: payload.reason,
    },
  });

  populated.notification = {
    notifiedAt: notification.sentAt ? new Date(notification.sentAt) : null,
    lastChannel: notification.channel,
    lastStatus: notification.accepted ? 'sent' : 'failed',
  };
  await populated.save();

  return populated;
};

export const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await createPendingAppointment({
    payload: req.body,
    source: 'manual',
  });

  res.status(201).json({ success: true, data: appointment });
});

export const createAiAppointment = asyncHandler(async (req, res) => {
  const appointment = await createPendingAppointment({
    payload: req.body,
    source: 'ai',
  });

  res.status(201).json({ success: true, data: appointment });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const filter = {
    _id: req.params.id,
    hospitalId: req.user.hospitalId,
  };

  if (req.user.role === 'doctor') {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      throw new AppError('Doctor profile not found', 404);
    }
    filter.doctorId = doctorProfile._id;
  }

  const appointment = await Appointment.findOne(filter);

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  appointment.status = req.body.status;
  appointment.approval = {
    approvedByUserId: req.user._id,
    approvedAt: new Date(),
    rejectionReason: req.body.rejectionReason,
    notes: req.body.notes,
  };

  await appointment.save();

  const populated = await Appointment.findById(appointment._id).populate(appointmentPopulation);
  const patientEmail = populated.patientId?.email || process.env.TEST_PATIENT_EMAIL;

  if (patientEmail) {
    await sendAppointmentNotification({
      to: patientEmail,
      subject: `Your appointment was ${req.body.status}`,
      context: {
        type: 'appointment_status_updated',
        patientName: populated.patientId?.fullName || 'Patient',
        doctorName: populated.doctorId?.userId?.fullName || 'your doctor',
        hospitalName: populated.hospitalId?.name || 'the hospital',
        statusLabel: req.body.status,
        dateLabel: new Date(populated.slotStart).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        notes: req.body.notes || req.body.rejectionReason || '',
      },
    });
  }

  res.status(200).json({ success: true, data: populated });
});

export const getAppointmentStats = asyncHandler(async (req, res) => {
  const hospitalId = req.user.hospitalId;
  let doctorProfile = null;

  if (req.user.role === 'doctor') {
    doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      throw new AppError('Doctor profile not found', 404);
    }
  }

  const statsFilter = doctorProfile ? { hospitalId, doctorId: doctorProfile._id } : { hospitalId };
  const [total, pending, approved, rejected, completed] = await Promise.all([
    Appointment.countDocuments(statsFilter),
    Appointment.countDocuments({ ...statsFilter, status: APPOINTMENT_STATUS.PENDING }),
    Appointment.countDocuments({ ...statsFilter, status: APPOINTMENT_STATUS.APPROVED }),
    Appointment.countDocuments({ ...statsFilter, status: APPOINTMENT_STATUS.REJECTED }),
    Appointment.countDocuments({ ...statsFilter, status: APPOINTMENT_STATUS.COMPLETED }),
  ]);

  res.status(200).json({
    success: true,
    data: { total, pending, approved, rejected, completed },
  });
});

export const notifyAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.body.appointmentId).populate(appointmentPopulation);
  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  const notification = await sendAppointmentNotification({
    to: appointment.hospitalId.contact?.email || req.body.to,
    subject: req.body.subject || `Pending appointment for ${appointment.patientId.fullName}`,
    html:
      req.body.html ||
      `<p>A pending appointment requires review for ${appointment.patientId.fullName}.</p>`,
  });

  appointment.notification = {
    notifiedAt: new Date(notification.sentAt),
    lastChannel: notification.channel,
    lastStatus: notification.accepted ? 'sent' : 'failed',
  };
  await appointment.save();

  res.status(200).json({ success: true, data: notification });
});
