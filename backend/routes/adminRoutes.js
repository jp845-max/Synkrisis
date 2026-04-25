import express from 'express';
import {
  getDashboardStats,
  getUsers,
  approveProvider,
  getConsultingRequests,
  matchConsultingProvider,
  getAllProjects,
  getAllContracts
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/approve', approveProvider);
router.get('/consulting', getConsultingRequests);
router.put('/consulting/:id/match', matchConsultingProvider);
router.get('/projects', getAllProjects);
router.get('/contracts', getAllContracts);

export default router;
