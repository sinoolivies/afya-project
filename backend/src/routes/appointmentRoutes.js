import express from 'express';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  getAppointmentStats,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createAppointment);

// Protected routes
router.get('/', protect, authorize('admin', 'doctor'), getAppointments);
router.get('/stats/overview', protect, authorize('admin'), getAppointmentStats);
router.get('/:id', protect, authorize('admin', 'doctor'), getAppointment);
router.patch('/:id/status', protect, authorize('admin'), updateAppointmentStatus);
router.put('/:id', protect, authorize('admin'), updateAppointment);
router.delete('/:id', protect, authorize('admin'), deleteAppointment);

export default router;
