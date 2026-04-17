import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Private (Admin/Doctor)
export const getAppointments = async (req, res, next) => {
  try {
    let query;

    // If user is a doctor, only show their appointments
    if (req.user.role === 'doctor') {
      query = { doctorId: req.user._id };
    } else {
      // Admin can see all appointments
      query = {};
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'fullName specialty')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/v1/appointments/:id
// @access  Private
export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      'doctorId',
      'fullName specialty phone'
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization
    if (
      req.user.role === 'doctor' &&
      appointment.doctorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new appointment
// @route   POST /api/v1/appointments
// @access  Public
export const createAppointment = async (req, res, next) => {
  try {
    const { patient, doctor, doctorId, hospital, date, time, symptoms, aiGenerated } = req.body;

    // Create appointment
    const appointment = await Appointment.create({
      patient,
      doctor,
      doctorId,
      hospital,
      date,
      time,
      symptoms,
      aiGenerated: aiGenerated || false,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PATCH /api/v1/appointments/:id/status
// @access  Private (Admin)
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    appointment.status = status;
    
    if (rejectionReason) {
      appointment.rejectionReason = rejectionReason;
    }
    
    if (notes) {
      appointment.notes = notes;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment
// @route   PUT /api/v1/appointments/:id
// @access  Private (Admin)
export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private (Admin)
export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment statistics
// @route   GET /api/v1/appointments/stats/overview
// @access  Private (Admin)
export const getAppointmentStats = async (req, res, next) => {
  try {
    const total = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const approved = await Appointment.countDocuments({ status: 'approved' });
    const rejected = await Appointment.countDocuments({ status: 'rejected' });
    const completed = await Appointment.countDocuments({ status: 'completed' });

    // Get today's approved appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const approvedToday = await Appointment.countDocuments({
      status: 'approved',
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        completed,
        approvedToday,
      },
    });
  } catch (error) {
    next(error);
  }
};
