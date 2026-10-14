import { body } from 'express-validator';
import { validate } from './authValidator.js';

export const createWorkspaceValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Workspace name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description max 500 chars'),
  body('type')
    .optional()
    .isIn(['personal', 'team', 'pg', 'household', 'trip', 'event', 'business'])
    .withMessage('Invalid workspace type'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3-letter code')
    .isAlpha()
    .withMessage('Currency must be alphabetic'),
  validate,
];

export const updateWorkspaceValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description max 500 chars'),
  body('type')
    .optional()
    .isIn(['personal', 'team', 'pg', 'household', 'trip', 'event', 'business'])
    .withMessage('Invalid workspace type'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3-letter code'),
  validate,
];

export const inviteMemberValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MEMBER', 'VIEWER'])
    .withMessage('Role must be ADMIN, MEMBER, or VIEWER'),
  validate,
];