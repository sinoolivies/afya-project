import express from 'express';
import { createMessage, getMessagesBySession } from '../controllers/messageController.js';

const router = express.Router();

router.get('/session/:sessionId', getMessagesBySession);
router.post('/', createMessage);

export default router;
