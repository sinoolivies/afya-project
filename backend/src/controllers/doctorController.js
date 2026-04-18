import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { USER_ROLES } from '../constants/roles.js';
import { getDoctorSlots } from '../services/schedulingService.js';

export const getDoctors = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.hospitalId) {
    filter.hospitalId = req.query.hospitalId;
  }

  if (req.query.specialty) {
    filter.specialty = req.query.specialty;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const doctors = await Doctor.find(filter)
    .populate('userId', 'fullName email phone status')
    .populate('hospitalId', 'name slug');

  res.status(200).json({ success: true, count: doctors.length, data: doctors });
});

export const createDoctor = asyncHandler(async (req, res) => {
  const hospitalId = req.user.hospitalId;

  const user = await User.create({
    hospitalId,
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password || process.env.DEFAULT_ACCOUNT_PASSWORD || 'change-me-before-using',
    phone: req.body.phone,
    role: USER_ROLES.DOCTOR,
  });

  const doctor = await Doctor.create({
    userId: user._id,
    hospitalId,
    specialty: req.body.specialty,
    licenseNumber: req.body.licenseNumber,
    yearsOfExperience: req.body.yearsOfExperience,
    languages: req.body.languages || ['English'],
    consultationModes: req.body.consultationModes || ['in_person'],
  });

  const populatedDoctor = await Doctor.findById(doctor._id)
    .populate('userId', 'fullName email phone status')
    .populate('hospitalId', 'name slug');

  res.status(201).json({ success: true, data: populatedDoctor });
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOneAndUpdate(
    { _id: req.params.id, hospitalId: req.user.hospitalId },
    req.body,
    { new: true, runValidators: true }
  )
    .populate('userId', 'fullName email phone status')
    .populate('hospitalId', 'name slug');

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  res.status(200).json({ success: true, data: doctor });
});

export const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('userId', 'fullName email phone status')
    .populate('hospitalId', 'name slug');

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  res.status(200).json({ success: true, data: doctor });
});

export const getDoctorAvailability = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  const slots = await getDoctorSlots({
    doctorId: doctor._id,
    hospitalId: doctor.hospitalId,
    date: req.query.date,
  });

  res.status(200).json({
    success: true,
    count: slots.length,
    data: {
      doctorId: doctor._id,
      hospitalId: doctor.hospitalId,
      date: req.query.date,
      slots,
    },
  });
});
