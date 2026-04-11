import express from 'express';
import { getConversations, getConversationById, sendMessage } from '../controllers/chatController.js';
import { requireUser } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/conversations
router.get('/conversations', requireUser, getConversations);

// GET /api/users/conversations/:conversationId
router.get('/conversations/:conversationId', requireUser, getConversationById);

// POST /api/users/conversations
router.post('/conversations', requireUser, sendMessage);

export default router;