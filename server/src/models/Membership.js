import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'],
      default: 'MEMBER',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Prevent duplicate membership (same user in same workspace twice)
membershipSchema.index({ user: 1, workspace: 1 }, { unique: true });
membershipSchema.index({ workspace: 1 });
membershipSchema.index({ user: 1 });

// Role hierarchy — higher number = more permissions
export const ROLE_LEVELS = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
};

const Membership = mongoose.model('Membership', membershipSchema);

export default Membership;