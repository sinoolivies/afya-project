import express from 'express';
import {
  getHospital,
  getHospitals,
  getLeastBusyHospitals,
  getNearestHospitals,
  updateHospital,
} from '../controllers/hospitalController.js';
import { authorize, protect } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/roles.js';

const router = express.Router();

router.get('/', getHospitals);
router.get('/nearest/search', getNearestHospitals);
router.get('/least-busy/search', getLeastBusyHospitals);
router.get('/:id', getHospital);
router.put('/:id', protect, authorize(USER_ROLES.HOSPITAL_ADMIN), updateHospital);

export default router;
