import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import generateToken from '../utils/generateToken.js';
import slugify from '../utils/slugify.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import { USER_ROLES } from '../constants/roles.js';

export const registerAdmin = asyncHandler(async (req, res) => {
  const { hospitalName, hospitalType, hospitalEmail, hospitalPhone, address, location, admin } = req.body;

  const slug = slugify(hospitalName);
  const existingHospital = await Hospital.findOne({ slug });
  if (existingHospital) {
    throw new AppError('Hospital already exists', 409);
  }

  const existingAdmin = await User.findOne({ email: admin.email.toLowerCase() });
  if (existingAdmin) {
    throw new AppError('A user with that email already exists', 409);
  }

  const hospital = await Hospital.create({
    name: hospitalName,
    slug,
    type: hospitalType || 'hospital',
    contact: {
      email: hospitalEmail,
      phone: hospitalPhone,
    },
    address,
    location,
    supportsEmergency: Boolean(req.body.supportsEmergency),
    departments: req.body.departments || [],
  });

  const user = await User.create({
    hospitalId: hospital._id,
    fullName: admin.fullName,
    email: admin.email,
    password: admin.password,
    phone: admin.phone,
    role: USER_ROLES.HOSPITAL_ADMIN,
  });

  const populatedUser = await User.findById(user._id).select('-password');
  const token = generateToken(populatedUser);

  res.status(201).json({
    success: true,
    data: {
      user: populatedUser,
      hospital,
      token,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const safeUser = await User.findById(user._id).populate('hospitalId');
  const token = generateToken(user);

  res.status(200).json({
    success: true,
    data: {
      user: safeUser,
      token,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('hospitalId').select('-password');
  res.status(200).json({ success: true, data: user });
});
