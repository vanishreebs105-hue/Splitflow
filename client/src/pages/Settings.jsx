import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Bell, Palette, Globe, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    currency: 'INR',
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleToggle = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    toast.success('Preference updated');
  };

  const handleCurrencyChange = (e) => {
    setPrefs({ ...prefs, currency: e.target.value });
    toast.success(`Currency set to ${e.target.value}`);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }
    setDeleting(true);
    try {
      await authAPI.deleteAccount({ password: deletePassword });
      toast.success('Account deleted');
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-stone-900 tracking-tight mb-1">
          Settings
        </h1>
        <p className="text-sm text-stone-500">
          Manage your preferences and account
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Notifications */}
        <div className="card p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 bg-olive-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell size={18} className="text-olive-700" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Notifications</h3>
              <p className="text-sm text-stone-500">
                Control how we reach out to you
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <ToggleRow
              label="Email notifications"
              description="Get notified about new expenses and settlements"
              value={prefs.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
            <ToggleRow
              label="Push notifications"
              description="Receive real-time alerts in your browser"
              value={prefs.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />
            <ToggleRow
              label="Weekly digest"
              description="Summary of your activity every Monday"
              value={prefs.weeklyDigest}
              onChange={() => handleToggle('weeklyDigest')}
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 bg-olive-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe size={18} className="text-olive-700" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Preferences</h3>
              <p className="text-sm text-stone-500">
                Customize how the app works for you
              </p>
            </div>
          </div>

          <div>
            <label className="label">Default currency</label>
            <select
              value={prefs.currency}
              onChange={handleCurrencyChange}
              className="input max-w-xs"
            >
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
            <p className="text-xs text-stone-500 mt-1.5">
              Used for new workspaces by default
            </p>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card p-6 border-rose-200 bg-rose-50/30">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-rose-900">Danger zone</h3>
              <p className="text-sm text-rose-700/80">
                Irreversible actions — proceed with caution
              </p>
            </div>
          </div>

          {!deleteOpen ? (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-rose-200">
              <div>
                <p className="font-medium text-stone-900 text-sm">Delete account</p>
                <p className="text-xs text-stone-500">
                  Permanently remove your account and all data
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setDeleteOpen(true)}
                className="!text-rose-600 !border-rose-200 hover:!bg-rose-50"
              >
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-white rounded-lg border border-rose-300 space-y-3">
              <p className="text-sm text-stone-700">
                Type your password to confirm account deletion:
              </p>
              <Input
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeletePassword('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete permanently'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-stone-900">{label}</p>
        <p className="text-xs text-stone-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          value ? 'bg-olive-600' : 'bg-stone-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}