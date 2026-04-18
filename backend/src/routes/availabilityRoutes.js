import express from 'express';
import {
  createAvailability,
  deleteAvailability,
  getAvailability,
  updateAvailability,
} from '../controllers/availabilityController.js';
import { authorize, protect } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/roles.js';

const router = express.Router();

router.get('/', getAvailability);
router.post('/', protect, authorize(USER_ROLES.HOSPITAL_ADMIN), createAvailability);
router.put('/:id', protect, authorize(USER_ROLES.HOSPITAL_ADMIN), updateAvailability);
router.delete('/:id', protect, authorize(USER_ROLES.HOSPITAL_ADMIN), deleteAvailability);

export default router;
