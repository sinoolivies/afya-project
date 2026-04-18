import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Availability from '../models/Availability.js';

export const getAvailability = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.doctorId) {
    filter.doctorId = req.query.doctorId;
  }

  if (req.query.hospitalId) {
    filter.hospitalId = req.query.hospitalId;
  }

  const schedules = await Availability.find(filter).sort({ doctorId: 1, dayOfWeek: 1 });
  res.status(200).json({ success: true, count: schedules.length, data: schedules });
});

export const createAvailability = asyncHandler(async (req, res) => {
  const schedule = await Availability.create({
    ...req.body,
    hospitalId: req.user.hospitalId,
  });

  res.status(201).json({ success: true, data: schedule });
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const schedule = await Availability.findOneAndUpdate(
    { _id: req.params.id, hospitalId: req.user.hospitalId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!schedule) {
    throw new AppError('Availability not found', 404);
  }

  res.status(200).json({ success: true, data: schedule });
});

export const deleteAvailability = asyncHandler(async (req, res) => {
  const schedule = await Availability.findOneAndDelete({
    _id: req.params.id,
    hospitalId: req.user.hospitalId,
  });

  if (!schedule) {
    throw new AppError('Availability not found', 404);
  }

  res.status(200).json({ success: true, data: {} });
});
