import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireWorkspaceRole } from '../middleware/roleMiddleware.js';
import {
  createExpenseValidator,
  updateExpenseValidator,
} from '../validators/expenseValidator.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .post(requireWorkspaceRole('MEMBER'), createExpenseValidator, createExpense)
  .get(requireWorkspaceRole('VIEWER'), getExpenses);

router
  .route('/:expenseId')
  .get(requireWorkspaceRole('VIEWER'), getExpense)
  .put(requireWorkspaceRole('MEMBER'), updateExpenseValidator, updateExpense)
  .delete(requireWorkspaceRole('MEMBER'), deleteExpense);

export default router;