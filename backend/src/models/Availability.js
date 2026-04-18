import mongoose from 'mongoose';

const breakSchema = new mongoose.Schema(
  {
    startTime: String,
    endTime: String,
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
    },
    breaks: {
      type: [breakSchema],
      default: [],
    },
    timezone: {
      type: String,
      default: 'Africa/Kigali',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

availabilitySchema.index({ doctorId: 1, dayOfWeek: 1, isActive: 1 });
availabilitySchema.index({ hospitalId: 1, isActive: 1 });

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;
