import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'urgent-care'],
      default: 'hospital',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      fullAddress: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    distance: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },
    phone: {
      type: String,
    },
    emergency: {
      type: Boolean,
      default: false,
    },
    departments: [
      {
        type: String,
      },
    ],
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    services: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ type: 1, verified: 1 });

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
