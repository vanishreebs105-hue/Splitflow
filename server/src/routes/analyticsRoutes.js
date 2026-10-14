import express from 'express';
import {
  getWorkspaceAnalytics,
  getActivityFeed,
  exportExpensesCSV,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireWorkspaceRole } from '../middleware/roleMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/overview', requireWorkspaceRole('VIEWER'), getWorkspaceAnalytics);
router.get('/activity', requireWorkspaceRole('VIEWER'), getActivityFeed);
router.get('/export', requireWorkspaceRole('VIEWER'), exportExpensesCSV);

export default router;