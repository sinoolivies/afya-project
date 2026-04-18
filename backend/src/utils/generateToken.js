import jwt from 'jsonwebtoken';

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      hospitalId: user.hospitalId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );

export default generateToken;
