import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/authController.js';
import { getMySummary } from '../controllers/settlementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

// Specific routes first
router.get('/me/summary', protect, getMySummary);
router.put('/me/password', protect, changePassword);

// Generic /me routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.delete('/me', protect, deleteAccount);

export default router;