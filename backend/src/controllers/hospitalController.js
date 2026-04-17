import Hospital from '../models/Hospital.js';

// @desc    Get all hospitals
// @route   GET /api/v1/hospitals
// @access  Public
export const getHospitals = async (req, res, next) => {
  try {
    let query = {};

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by verified status
    if (req.query.verified !== undefined) {
      query.verified = req.query.verified === 'true';
    }

    const hospitals = await Hospital.find(query).sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hospital
// @route   GET /api/v1/hospitals/:id
// @access  Public
export const getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hospital
// @route   POST /api/v1/hospitals
// @access  Private (Admin)
export const createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);

    res.status(201).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital
// @route   PUT /api/v1/hospitals/:id
// @access  Private (Admin)
export const updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hospital
// @route   DELETE /api/v1/hospitals/:id
// @access  Private (Admin)
export const deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    await hospital.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hospitals within radius
// @route   GET /api/v1/hospitals/radius/:zipcode/:distance
// @access  Public
export const getHospitalsInRadius = async (req, res, next) => {
  try {
    const { zipcode, distance } = req.params;

    // For demo purposes, return all hospitals
    // In production, you would use geospatial queries
    const hospitals = await Hospital.find({}).limit(10);

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};
