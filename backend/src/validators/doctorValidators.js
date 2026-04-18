import { body } from 'express-validator';

export const doctorValidation = [
  body('fullName').trim().isLength({ min: 3 }).withMessage('Doctor full name is required'),
  body('email').trim().isEmail().withMessage('A valid doctor email is required'),
  body('phone').trim().isLength({ min: 8 }).withMessage('Doctor phone is required'),
  body('specialty').trim().isLength({ min: 2 }).withMessage('Doctor specialty is required'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];
