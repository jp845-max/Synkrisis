import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  getMyProjects,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { applyToProject, getProjectApplications } from '../controllers/applicationController.js';
import { getContractByProjectId } from '../controllers/contractController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, authorize('artist'), createProject);

router.get('/my', protect, getMyProjects);
router.get('/:id/contract', protect, getContractByProjectId);
router.post('/:id/apply', protect, authorize('provider'), applyToProject);
router.get('/:id/applications', protect, authorize('artist'), getProjectApplications);

router.route('/:id')
  .get(getProjectById)
  .put(protect, authorize('artist'), updateProject)
  .delete(protect, authorize('artist'), deleteProject);

export default router;
