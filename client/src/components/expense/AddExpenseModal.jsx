import { useState, useEffect } from 'react';
import { X, Receipt, User, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseAPI } from '../../api/endpoints';
import Input from '../ui/Input';
import Button from '../ui/Button';

const categories = [
  { value: 'food', label: '🍔 Food' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'rent', label: '🏠 Rent' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'health', label: '💊 Health' },
  { value: 'education', label: '📚 Education' },
  { value: 'subscription', label: '📱 Subscription' },
  { value: 'other', label: '📌 Other' },
];

export default function AddExpenseModal({ isOpen, onClose, workspaceId, members, currentUser, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'food',
    paidBy: currentUser?._id || '',
    splitMode: 'equal',
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize selected members when modal opens
  useEffect(() => {
    if (isOpen && members.length > 0) {
      setSelectedMembers(members.map((m) => m.user._id));
      setFormData((prev) => ({ ...prev, paidBy: prev.paidBy || currentUser?._id }));
    }
  }, [isOpen, members, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCustomChange = (userId, value) => {
    setCustomSplits({ ...customSplits, [userId]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.amount || Number(formData.amount) <= 0)
      newErrors.amount = 'Amount must be greater than 0';
    if (selectedMembers.length === 0) newErrors.splits = 'Select at least one member';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Build splits based on mode
      const splits = selectedMembers.map((userId) => {
        const base = { user: userId };
        if (formData.splitMode === 'exact') base.amount = Number(customSplits[userId] || 0);
        if (formData.splitMode === 'percentage')
          base.percentage = Number(customSplits[userId] || 0);
        if (formData.splitMode === 'shares') base.shares = Number(customSplits[userId] || 1);
        return base;
      });

      const payload = {
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category,
        paidBy: formData.paidBy,
        splitMode: formData.splitMode,
        splits,
      };

      await expenseAPI.create(workspaceId, payload);
      toast.success('Expense added!');
      onCreated();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'food',
      paidBy: currentUser?._id || '',
      splitMode: 'equal',
    });
    setSelectedMembers(members.map((m) => m.user._id));
    setCustomSplits({});
    setErrors({});
    onClose();
  };

  const amount = Number(formData.amount) || 0;
  const perPerson = selectedMembers.length > 0 ? amount / selectedMembers.length : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-slide-up my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Receipt size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Add Expense</h2>
              <p className="text-xs text-slate-500">Track a shared expense</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title + Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title"
              name="title"
              placeholder="e.g., Dinner at Pizza Hut"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              autoFocus
            />
            <Input
              label="Amount (₹)"
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              error={errors.amount}
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: c.value })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    formData.category === c.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="label">Paid by</label>
            <select
              name="paidBy"
              value={formData.paidBy}
              onChange={handleChange}
              className="input"
            >
              {members.map((m) => (
                <option key={m.user._id} value={m.user._id}>
                  {m.user._id === currentUser?._id ? `${m.user.name} (you)` : m.user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Split Mode */}
          <div>
            <label className="label">Split Mode</label>
            <div className="grid grid-cols-4 gap-2">
              {['equal', 'exact', 'percentage', 'shares'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFormData({ ...formData, splitMode: mode })}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border capitalize transition-all ${
                    formData.splitMode === mode
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Members & splits */}
          <div>
            <label className="label">
              Split between ({selectedMembers.length} selected)
            </label>
            <div className="space-y-2">
              {members.map((m) => {
                const isSelected = selectedMembers.includes(m.user._id);
                const displayAmount =
                  formData.splitMode === 'equal'
                    ? perPerson
                    : Number(customSplits[m.user._id] || 0);

                return (
                  <div
                    key={m.user._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-primary-50 border-primary-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMember(m.user._id)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {m.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-700">
                      {m.user.name}
                      {m.user._id === currentUser?._id && (
                        <span className="text-slate-400 ml-1">(you)</span>
                      )}
                    </span>

                    {isSelected && formData.splitMode === 'equal' && (
                      <span className="text-sm font-semibold text-primary-700">
                        ₹{displayAmount.toFixed(2)}
                      </span>
                    )}

                    {isSelected &&
                      formData.splitMode !== 'equal' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step={formData.splitMode === 'percentage' ? '0.01' : '1'}
                            placeholder="0"
                            value={customSplits[m.user._id] || ''}
                            onChange={(e) => handleCustomChange(m.user._id, e.target.value)}
                            className="w-24 px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-xs text-slate-500">
                            {formData.splitMode === 'exact' && '₹'}
                            {formData.splitMode === 'percentage' && '%'}
                            {formData.splitMode === 'shares' && 'shares'}
                          </span>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
            {errors.splits && <p className="mt-2 text-xs text-danger-600">{errors.splits}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Add Expense
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}