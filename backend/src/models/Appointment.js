import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      name: {
        type: String,
        required: [true, 'Patient name is required'],
      },
      email: {
        type: String,
        required: [true, 'Patient email is required'],
      },
      phone: {
        type: String,
        required: [true, 'Patient phone is required'],
      },
      avatar: {
        type: String,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    doctor: {
      type: String,
      required: [true, 'Doctor name is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    symptoms: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
appointmentSchema.index({ status: 1, date: 1 });
appointmentSchema.index({ 'patient.email': 1 });
appointmentSchema.index({ doctorId: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
