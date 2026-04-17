import express from 'express';
import {
  getHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitalsInRadius,
} from '../controllers/hospitalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getHospitals);
router.get('/:id', getHospital);
router.get('/radius/:zipcode/:distance', getHospitalsInRadius);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createHospital);
router.put('/:id', protect, authorize('admin'), updateHospital);
router.delete('/:id', protect, authorize('admin'), deleteHospital);

export default router;
