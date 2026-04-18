import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: Date,
    gender: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [30.0619, -1.9441],
      },
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 }, { unique: true });
patientSchema.index({ location: '2dsphere' });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
