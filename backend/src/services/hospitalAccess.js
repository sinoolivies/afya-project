import { USER_ROLES } from '../constants/roles.js';

export const ensureHospitalAccess = (req, hospitalId) => {
  if (req.user.role === USER_ROLES.HOSPITAL_ADMIN || req.user.role === USER_ROLES.DOCTOR) {
    return String(req.user.hospitalId) === String(hospitalId);
  }

  return false;
};

export const scopedHospitalFilter = (req) => ({ hospitalId: req.user.hospitalId });
