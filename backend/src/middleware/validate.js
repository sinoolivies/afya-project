import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    next();
    return;
  }

  res.status(400).json({
    success: false,
    message: result
      .array()
      .map((item) => item.msg)
      .join(', '),
    errors: result.array(),
  });
};
