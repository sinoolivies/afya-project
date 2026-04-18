import asyncHandler from '../utils/asyncHandler.js';
import Message from '../models/Message.js';

export const getMessagesBySession = asyncHandler(async (req, res) => {
  const messages = await Message.find({ sessionId: req.params.sessionId }).sort({ createdAt: 1 });
  res.status(200).json({ success: true, count: messages.length, data: messages });
});

export const createMessage = asyncHandler(async (req, res) => {
  const message = await Message.create(req.body);
  res.status(201).json({ success: true, data: message });
});
