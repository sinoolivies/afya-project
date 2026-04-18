import express from 'express';
import {
  createAppointment,
  getAppointment,
  getAppointments,
  getAppointmentStats,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { authorize, protect } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/roles.js';
import { bookingRateLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import {
  appointmentStatusValidation,
  appointmentValidation,
} from '../validators/appointmentValidators.js';

const router = express.Router();

router.post('/', bookingRateLimiter, appointmentValidation, validate, createAppointment);
router.get('/', protect, authorize(USER_ROLES.HOSPITAL_ADMIN, USER_ROLES.DOCTOR), getAppointments);
router.get('/stats/overview', protect, authorize(USER_ROLES.HOSPITAL_ADMIN, USER_ROLES.DOCTOR), getAppointmentStats);
router.get('/:id', protect, authorize(USER_ROLES.HOSPITAL_ADMIN, USER_ROLES.DOCTOR), getAppointment);
router.patch(
  '/:id/status',
  protect,
  authorize(USER_ROLES.HOSPITAL_ADMIN, USER_ROLES.DOCTOR),
  appointmentStatusValidation,
  validate,
  updateAppointmentStatus
);

export default router;
