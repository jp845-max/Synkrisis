import express from 'express';
import {
  getContractById,
  createContract,
  acceptContract,
  payContract,
  completeContract,
  getMyContracts
} from '../controllers/contractController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createContract);

router.get('/my', protect, getMyContracts);

router.get('/:id', protect, getContractById);

router.put('/:id/accept', protect, acceptContract);
router.put('/:id/pay', protect, authorize('artist'), payContract);
router.put('/:id/complete', protect, authorize('artist'), completeContract);

export default router;
