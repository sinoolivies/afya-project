import { body } from 'express-validator';

export const registerAdminValidation = [
  body('hospitalName').trim().isLength({ min: 3 }).withMessage('Hospital name is required'),
  body('hospitalEmail').trim().isEmail().withMessage('A valid hospital email is required'),
  body('hospitalPhone').trim().isLength({ min: 8 }).withMessage('Hospital phone is required'),
  body('address.fullAddress').trim().isLength({ min: 5 }).withMessage('Hospital address is required'),
  body('admin.fullName').trim().isLength({ min: 3 }).withMessage('Admin full name is required'),
  body('admin.email').trim().isEmail().withMessage('A valid admin email is required'),
  body('admin.phone').trim().isLength({ min: 8 }).withMessage('Admin phone is required'),
  body('admin.password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];
