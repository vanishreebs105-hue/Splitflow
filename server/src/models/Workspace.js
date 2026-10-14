import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    type: {
      type: String,
      enum: ['personal', 'team', 'pg', 'household', 'trip', 'event', 'business'],
      default: 'personal',
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      maxlength: 3,
    },
    avatar: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ isArchived: 1 });

const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;