import { body } from 'express-validator';
import { validate } from './authValidator.js';

export const createExpenseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title max 100 characters'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than 0'),
  body('paidBy')
    .notEmpty()
    .withMessage('paidBy (user ID) is required')
    .isMongoId()
    .withMessage('Invalid paidBy user ID'),
  body('splitMode')
    .isIn(['equal', 'exact', 'percentage', 'shares'])
    .withMessage('Invalid split mode'),
  body('splits')
    .isArray({ min: 1 })
    .withMessage('At least one split is required'),
  body('splits.*.user')
    .isMongoId()
    .withMessage('Each split must have valid user ID'),
  body('category')
    .optional()
    .isIn([
      'food',
      'travel',
      'rent',
      'utilities',
      'entertainment',
      'shopping',
      'health',
      'education',
      'subscription',
      'other',
    ])
    .withMessage('Invalid category'),
  validate,
];

export const updateExpenseValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title max 100 characters'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than 0'),
  validate,
];