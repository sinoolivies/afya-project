import { body } from 'express-validator';

export const appointmentValidation = [
  body('hospitalId').isMongoId().withMessage('A valid hospital is required'),
  body('doctorId').isMongoId().withMessage('A valid doctor is required'),
  body('patient.fullName').trim().isLength({ min: 3 }).withMessage('Patient full name is required'),
  body('patient.email').trim().isEmail().withMessage('A valid patient email is required'),
  body('patient.phone').trim().isLength({ min: 8 }).withMessage('Patient phone is required'),
  body('reason').trim().isLength({ min: 3 }).withMessage('Reason is required'),
  body('scheduledFor').isISO8601().withMessage('A valid appointment date is required'),
  body('slotStart').isISO8601().withMessage('A valid slot start time is required'),
  body('slotEnd').isISO8601().withMessage('A valid slot end time is required'),
];

export const appointmentStatusValidation = [
  body('status')
    .isIn(['approved', 'rejected', 'completed', 'cancelled'])
    .withMessage('A valid appointment status is required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes are too long'),
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason is too long'),
];
