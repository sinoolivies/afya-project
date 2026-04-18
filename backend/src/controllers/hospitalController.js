import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Hospital from '../models/Hospital.js';

export const getHospitals = asyncHandler(async (req, res) => {
  const query = {
    status: req.query.status || 'active',
  };

  if (req.query.type) {
    query.type = req.query.type;
  }

  if (req.query.department) {
    query.departments = req.query.department;
  }

  const hospitals = await Hospital.find(query).sort({ name: 1 });
  res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
});

export const getHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    throw new AppError('Hospital not found', 404);
  }
  res.status(200).json({ success: true, data: hospital });
});

export const updateHospital = asyncHandler(async (req, res) => {
  if (String(req.params.id) !== String(req.user.hospitalId)) {
    throw new AppError('Hospital not found', 404);
  }

  const hospital = await Hospital.findByIdAndUpdate(req.user.hospitalId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!hospital) {
    throw new AppError('Hospital not found', 404);
  }

  res.status(200).json({ success: true, data: hospital });
});

export const getNearestHospitals = asyncHandler(async (req, res) => {
  const { latitude, longitude, specialty } = req.query;

  if (!latitude || !longitude) {
    throw new AppError('latitude and longitude are required', 400);
  }

  const hospitals = await Hospital.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)],
        },
        distanceField: 'distanceMeters',
        spherical: true,
        query: {
          status: 'active',
          acceptingAppointments: true,
          ...(specialty ? { departments: specialty } : {}),
        },
      },
    },
    { $limit: Number(req.query.limit || 5) },
  ]);

  res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
});

export const getLeastBusyHospitals = asyncHandler(async (req, res) => {
  const days = Number(req.query.days || 7);
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);

  const hospitals = await Hospital.aggregate([
    {
      $match: {
        status: 'active',
        acceptingAppointments: true,
      },
    },
    {
      $lookup: {
        from: 'appointments',
        let: { hospitalId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$hospitalId', '$$hospitalId'] },
              scheduledFor: { $gte: start, $lte: end },
              status: { $in: ['pending', 'approved'] },
            },
          },
          {
            $count: 'activeLoad',
          },
        ],
        as: 'load',
      },
    },
    {
      $addFields: {
        activeLoad: {
          $ifNull: [{ $arrayElemAt: ['$load.activeLoad', 0] }, 0],
        },
      },
    },
    { $sort: { activeLoad: 1, name: 1 } },
    { $limit: Number(req.query.limit || 5) },
    {
      $project: {
        load: 0,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: hospitals.length,
    data: hospitals,
  });
});
