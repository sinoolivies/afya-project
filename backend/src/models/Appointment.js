import mongoose from 'mongoose';
import { APPOINTMENT_STATUS_VALUES } from '../constants/appointmentStatus.js';

const appointmentSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    patientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    source: {
      type: String,
      enum: ['ai', 'manual'],
      default: 'manual',
    },
    reason: {
      type: String,
      required: true,
    },
    symptoms: String,
    triage: {
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'emergency'],
        default: 'low',
      },
      notes: String,
    },
    scheduledFor: {
      type: Date,
      required: true,
    },
    slotStart: {
      type: Date,
      required: true,
    },
    slotEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUS_VALUES,
      default: 'pending',
    },
    approval: {
      approvedByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedAt: Date,
      rejectionReason: String,
      notes: String,
    },
    notification: {
      notifiedAt: Date,
      lastChannel: String,
      lastStatus: String,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ hospitalId: 1, status: 1, scheduledFor: 1 });
appointmentSchema.index({ doctorId: 1, slotStart: 1 });
appointmentSchema.index({ patientId: 1, createdAt: -1 });
appointmentSchema.index({ hospitalId: 1, patientEmail: 1, slotStart: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
