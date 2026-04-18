import asyncHandler from '../utils/asyncHandler.js';
import { upsertPatient } from '../services/patientService.js';

export const upsertPatientProfile = asyncHandler(async (req, res) => {
  const patient = await upsertPatient(req.body);
  res.status(200).json({ success: true, data: patient });
});
