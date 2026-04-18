import express from 'express';
import {
  createDoctor,
  getDoctor,
  getDoctorAvailability,
  getDoctors,
  updateDoctor,
} from '../controllers/doctorController.js';
import { authorize, protect } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/roles.js';
import { validate } from '../middleware/validate.js';
import { doctorValidation } from '../validators/doctorValidators.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.get('/:id/slots', getDoctorAvailability);
router.post('/', protect, authorize(USER_ROLES.HOSPITAL_ADMIN), doctorValidation, validate, createDoctor);
router.put('/:id', protect, authorize(USER_ROLES.HOSPITAL_ADMIN), doctorValidation, validate, updateDoctor);

export default router;
