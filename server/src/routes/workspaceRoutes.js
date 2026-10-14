import express from 'express';
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  archiveWorkspace,
  deleteWorkspace,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireWorkspaceRole } from '../middleware/roleMiddleware.js';
import {
  createWorkspaceValidator,
  updateWorkspaceValidator,
  inviteMemberValidator,
} from '../validators/workspaceValidator.js';
import expenseRoutes from './expenseRoutes.js';
import { getMe } from '../controllers/authController.js';
import { getMySummary } from '../controllers/settlementController.js';
import settlementRoutes from './settlementRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
const router = express.Router();

// All routes require authentication
router.use(protect);

// Base workspace routes
router
  .route('/')
  .post(createWorkspaceValidator, createWorkspace)
  .get(getMyWorkspaces);

// Single workspace routes
router
  .route('/:workspaceId')
  .get(requireWorkspaceRole('VIEWER'), getWorkspace)
  .put(requireWorkspaceRole('ADMIN'), updateWorkspaceValidator, updateWorkspace)
  .delete(requireWorkspaceRole('OWNER'), deleteWorkspace);

// Archive
router.patch('/:workspaceId/archive', requireWorkspaceRole('OWNER'), archiveWorkspace);

// Member management
router.post(
  '/:workspaceId/members',
  requireWorkspaceRole('ADMIN'),
  inviteMemberValidator,
  inviteMember
);

router.patch(
  '/:workspaceId/members/:memberId',
  requireWorkspaceRole('ADMIN'),
  updateMemberRole
);

router.delete(
  '/:workspaceId/members/:memberId',
  requireWorkspaceRole('ADMIN'),
  removeMember
);

// Nested expense routes
router.use('/:workspaceId/expenses', expenseRoutes);
router.get('/me/summary', protect, getMySummary);
router.use('/:workspaceId/settlements', settlementRoutes);
// Nested analytics routes
router.use('/:workspaceId/analytics', analyticsRoutes);
export default router;