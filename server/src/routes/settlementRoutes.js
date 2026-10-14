import express from 'express';
import {
  getBalances,
  getSettlementSuggestions,
  createSettlement,
  getSettlements,
  deleteSettlement,
} from '../controllers/settlementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireWorkspaceRole } from '../middleware/roleMiddleware.js';
import { createSettlementValidator } from '../validators/settlementValidator.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

// Balances
router.get('/balances', requireWorkspaceRole('VIEWER'), getBalances);

// Suggestions (the star feature)
router.get('/suggestions', requireWorkspaceRole('VIEWER'), getSettlementSuggestions);

// Settlement history + create
router
  .route('/')
  .get(requireWorkspaceRole('VIEWER'), getSettlements)
  .post(requireWorkspaceRole('MEMBER'), createSettlementValidator, createSettlement);

// Delete
router.delete('/:settlementId', requireWorkspaceRole('MEMBER'), deleteSettlement);

export default router;