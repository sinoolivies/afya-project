import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
import { parseTimeToMinutes } from '../utils/time.js';

const overlaps = (slot, breaks) =>
  breaks.some((entry) => {
    const start = parseTimeToMinutes(entry.startTime);
    const end = parseTimeToMinutes(entry.endTime);
    return slot.startMinutes < end && slot.endMinutes > start;
  });

export const getDoctorSlots = async ({ doctorId, hospitalId, date }) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const dayOfWeek = targetDate.getDay();
  const availability = await Availability.find({
    doctorId,
    hospitalId,
    dayOfWeek,
    isActive: true,
  }).lean();

  if (!availability.length) {
    return [];
  }

  const dayStart = new Date(targetDate);
  const dayEnd = new Date(targetDate);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const existingAppointments = await Appointment.find({
    doctorId,
    hospitalId,
    status: { $in: ['pending', 'approved'] },
    slotStart: { $gte: dayStart, $lt: dayEnd },
  }).lean();

  const bookedWindows = existingAppointments.map((appointment) => ({
    start: new Date(appointment.slotStart).getTime(),
    end: new Date(appointment.slotEnd).getTime(),
  }));

  const openSlots = [];

  availability.forEach((window) => {
    const startMinutes = parseTimeToMinutes(window.startTime);
    const endMinutes = parseTimeToMinutes(window.endTime);
    const step = window.slotDurationMinutes;

    for (let cursor = startMinutes; cursor + step <= endMinutes; cursor += step) {
      const slot = {
        startMinutes: cursor,
        endMinutes: cursor + step,
      };

      if (overlaps(slot, window.breaks || [])) {
        continue;
      }

      const slotStart = new Date(targetDate);
      slotStart.setHours(0, cursor, 0, 0);

      const slotEnd = new Date(targetDate);
      slotEnd.setHours(0, cursor + step, 0, 0);

      const isBooked = bookedWindows.some(
        (booked) => slotStart.getTime() < booked.end && slotEnd.getTime() > booked.start
      );

      if (!isBooked) {
        openSlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          slotDurationMinutes: step,
        });
      }
    }
  });

  return openSlots;
};
