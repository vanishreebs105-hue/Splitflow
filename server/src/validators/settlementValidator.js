import { body } from 'express-validator';
import { validate } from './authValidator.js';

export const createSettlementValidator = [
  body('from').notEmpty().withMessage('from user is required').isMongoId().withMessage('Invalid from user ID'),
  body('to').notEmpty().withMessage('to user is required').isMongoId().withMessage('Invalid to user ID'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('note').optional().trim().isLength({ max: 200 }).withMessage('Note max 200 chars'),
  validate,
];