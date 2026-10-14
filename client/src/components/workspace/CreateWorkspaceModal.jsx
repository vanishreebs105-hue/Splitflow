import { useState } from 'react';
import { X, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { workspaceAPI } from '../../api/endpoints';
import Input from '../ui/Input';
import Button from '../ui/Button';

const workspaceTypes = [
  { value: 'personal', label: 'Personal' },
  { value: 'team', label: 'Team' },
  { value: 'pg', label: 'PG / Hostel' },
  { value: 'household', label: 'Household' },
  { value: 'trip', label: 'Trip' },
  { value: 'event', label: 'Event' },
  { value: 'business', label: 'Business' },
];

export default function CreateWorkspaceModal({ isOpen, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'personal',
    currency: 'INR',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrors({ name: 'Name must be at least 2 characters' });
      return;
    }

    setLoading(true);
    try {
      const { data } = await workspaceAPI.create(formData);
      toast.success('Workspace created');
      onCreated(data.data.workspace);
      setFormData({ name: '', description: '', type: 'personal', currency: 'INR' });
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-olive-100 rounded-xl flex items-center justify-center">
              <Wallet size={18} className="text-olive-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                New workspace
              </h2>
              <p className="text-xs text-stone-500">
                Create a space to track shared expenses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X size={18} className="text-stone-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Input
            label="Workspace name"
            name="name"
            placeholder="e.g., My PG - Koramangala"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            autoFocus
          />

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              name="description"
              rows={2}
              placeholder="What's this workspace for?"
              value={formData.description}
              onChange={handleChange}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {workspaceTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t.value })}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                    formData.type === t.value
                      ? 'bg-olive-600 text-white border-olive-600 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="input"
            >
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}