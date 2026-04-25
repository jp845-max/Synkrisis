import express from 'express';
import {
  acceptApplication,
  rejectApplication,
  getMyApplications
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', protect, authorize('provider'), getMyApplications);
router.put('/:id/accept', protect, authorize('artist'), acceptApplication);
router.put('/:id/reject', protect, authorize('artist'), rejectApplication);

export default router;
