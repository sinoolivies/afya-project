import express from 'express';
import {
  createAiAppointment,
  notifyAppointment,
} from '../controllers/appointmentController.js';
import {
  getLeastBusyHospitals,
  getNearestHospitals,
} from '../controllers/hospitalController.js';
import { getDoctorAvailability, getDoctors } from '../controllers/doctorController.js';
import { createMessage, getMessagesBySession } from '../controllers/messageController.js';
import { internalServiceAuth } from '../middleware/auth.js';
import { bookingRateLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { appointmentValidation } from '../validators/appointmentValidators.js';

const router = express.Router();

router.use(internalServiceAuth);

router.get('/hospitals/nearest', getNearestHospitals);
router.get('/hospitals/least-busy', getLeastBusyHospitals);
router.get('/doctors', getDoctors);
router.get('/doctors/:id/slots', getDoctorAvailability);
router.get('/messages/session/:sessionId', getMessagesBySession);
router.post('/messages', createMessage);
router.post('/appointments/ai-create', bookingRateLimiter, appointmentValidation, validate, createAiAppointment);
router.post('/notifications/email', notifyAppointment);

export default router;
