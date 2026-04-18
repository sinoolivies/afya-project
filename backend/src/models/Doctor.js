import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    consultationModes: {
      type: [String],
      default: ['in_person'],
    },
    acceptingNewPatients: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.index({ hospitalId: 1, specialty: 1, status: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
