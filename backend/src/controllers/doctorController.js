import User from '../models/User.js';

// @desc    Get all doctors
// @route   GET /api/v1/doctors
// @access  Private (Admin)
export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/v1/doctors/:id
// @access  Public
export const getDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctors by hospital
// @route   GET /api/v1/doctors/hospital/:hospital
// @access  Public
export const getDoctorsByHospital = async (req, res, next) => {
  try {
    const doctors = await User.find({
      role: 'doctor',
      hospital: req.params.hospital,
      status: 'active',
    }).select('-password');

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new doctor
// @route   POST /api/v1/doctors
// @access  Private (Admin)
export const createDoctor = async (req, res, next) => {
  try {
    const doctorData = {
      ...req.body,
      role: 'doctor',
    };

    const doctor = await User.create(doctorData);

    res.status(201).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor
// @route   PUT /api/v1/doctors/:id
// @access  Private (Admin)
export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor
// @route   DELETE /api/v1/doctors/:id
// @access  Private (Admin)
export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.id);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    await doctor.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor statistics
// @route   GET /api/v1/doctors/stats/overview
// @access  Private (Admin)
export const getDoctorStats = async (req, res, next) => {
  try {
    const total = await User.countDocuments({ role: 'doctor' });
    const active = await User.countDocuments({ role: 'doctor', status: 'active' });
    const onLeave = await User.countDocuments({ role: 'doctor', status: 'on-leave' });
    const inactive = await User.countDocuments({ role: 'doctor', status: 'inactive' });

    // Get total patients across all doctors
    const doctors = await User.find({ role: 'doctor' });
    const totalPatients = doctors.reduce((sum, doc) => sum + (doc.patients || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        onLeave,
        inactive,
        totalPatients,
      },
    });
  } catch (error) {
    next(error);
  }
};
