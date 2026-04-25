import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createOrder,
  verifyPayment,
  releasePayment,
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/release', protect, releasePayment);

export default router;
