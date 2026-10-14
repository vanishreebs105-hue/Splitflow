import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // For 'equal' mode: amount is calculated automatically
    // For 'exact' mode: amount is the exact value user owes
    // For 'percentage' mode: percentage is set, amount calculated
    // For 'shares' mode: shares is set, amount calculated
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    shares: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    category: {
      type: String,
      enum: [
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
      ],
      default: 'other',
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    splitMode: {
      type: String,
      enum: ['equal', 'exact', 'percentage', 'shares'],
      default: 'equal',
    },
    splits: {
      type: [splitSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one split is required',
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    receipt: {
      type: String,
      default: '',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', null],
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
expenseSchema.index({ workspace: 1, date: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ category: 1 });

// Virtual: get total split amount (sanity check)
expenseSchema.methods.getTotalSplitAmount = function () {
  return this.splits.reduce((sum, s) => sum + s.amount, 0);
};

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;