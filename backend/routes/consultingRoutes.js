import express from 'express';
import {
  submitConsultingRequest,
  getMyConsultingRequests,
  getConsultingRequestById,
  scheduleCall
} from '../controllers/consultingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('artist'), submitConsultingRequest);

router.get('/my', protect, getMyConsultingRequests);

router.route('/:id')
  .get(protect, getConsultingRequestById);

router.post('/:id/schedule-call', protect, authorize('artist'), scheduleCall);

export default router;
