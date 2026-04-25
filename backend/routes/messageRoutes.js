import express from 'express';
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Mount related to contracts in server.js, but unread count is global to user
// GET /api/messages/unread-count
router.get('/unread-count', protect, getUnreadCount);

// The following routes will be mounted in server.js under /api/contracts
// but it's cleaner to define them here and mount them properly
router.get('/:contractId/messages', protect, getMessages);
router.post('/:contractId/messages', protect, sendMessage);
router.put('/:contractId/messages/read', protect, markMessagesAsRead);

export default router;
