import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  completeProfile,
  getUserById,
  getProviders,
  uploadUserAvatar
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

router.get('/providers', getProviders);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.put('/complete-profile', protect, completeProfile);
router.post('/avatar', protect, uploadAvatar.single('avatar'), uploadUserAvatar);

router.get('/:id', getUserById);

export default router;
