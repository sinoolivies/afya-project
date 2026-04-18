import express from 'express';
import { upsertPatientProfile } from '../controllers/patientController.js';

const router = express.Router();

router.post('/upsert', upsertPatientProfile);

export default router;
