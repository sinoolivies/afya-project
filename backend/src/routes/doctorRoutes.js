import express from 'express';
import {
  getDoctors,
  getDoctor,
  getDoctorsByHospital,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorStats,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.get('/hospital/:hospital', getDoctorsByHospital);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createDoctor);
router.get('/stats/overview', protect, authorize('admin'), getDoctorStats);
router.put('/:id', protect, authorize('admin'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

export default router;
