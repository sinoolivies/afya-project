import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['hospital', 'clinic'],
      default: 'hospital',
    },
    contact: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phone: String,
    },
    address: {
      street: String,
      city: String,
      district: String,
      country: {
        type: String,
        default: 'Rwanda',
      },
      fullAddress: String,
    },
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
    departments: {
      type: [String],
      default: [],
    },
    supportsEmergency: {
      type: Boolean,
      default: false,
    },
    acceptingAppointments: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    metadata: {
      description: String,
      timezone: {
        type: String,
        default: 'Africa/Kigali',
      },
      averageRating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5,
      },
    },
  },
  {
    timestamps: true,
  }
);

hospitalSchema.index({ slug: 1 }, { unique: true });
hospitalSchema.index({ status: 1, type: 1 });
hospitalSchema.index({ location: '2dsphere' });

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
