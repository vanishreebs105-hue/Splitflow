import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, Calendar, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [nameLoading, setNameLoading] = useState(false);

  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdErrors, setPwdErrors] = useState({});

  const [workspaceCount, setWorkspaceCount] = useState(0);

  // Fetch workspace count (quick)
  useState(() => {
    authAPI.getMySummary().then(({ data }) => {
      setWorkspaceCount(data.data.breakdown?.length || 0);
    });
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown';

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim() || nameForm.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setNameLoading(true);
    try {
      const { data } = await authAPI.updateProfile({ name: nameForm.name });
      updateUser(data.data.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwdForm.currentPassword) errors.currentPassword = 'Current password required';
    if (!pwdForm.newPassword) errors.newPassword = 'New password required';
    else if (pwdForm.newPassword.length < 6)
      errors.newPassword = 'Must be at least 6 characters';
    if (pwdForm.newPassword !== pwdForm.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    setPwdErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPwdLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success('Password changed');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <Layout>
      {/* Back */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-stone-900 tracking-tight mb-1">
          Profile
        </h1>
        <p className="text-sm text-stone-500">
          Manage your account information
        </p>
      </div>

      {/* Profile overview */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-olive-600 rounded-2xl flex items-center justify-center text-white text-xl font-semibold shadow-md">
            {initials || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-stone-900">{user?.name}</h2>
            <p className="text-sm text-stone-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-stone-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Member since</p>
              <p className="text-sm font-medium text-stone-900">{memberSince}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-stone-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Workspaces</p>
              <p className="text-sm font-medium text-stone-900">
                {workspaceCount} {workspaceCount === 1 ? 'workspace' : 'workspaces'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center">
              <User size={16} className="text-stone-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Account type</p>
              <p className="text-sm font-medium text-stone-900 capitalize">
                {user?.role || 'user'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic info */}
        <div className="card p-6">
          <div className="mb-5">
            <h3 className="font-semibold text-stone-900 mb-1">Basic information</h3>
            <p className="text-sm text-stone-500">
              Update your name and email
            </p>
          </div>

          <form onSubmit={handleNameUpdate} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              value={nameForm.name}
              onChange={(e) => setNameForm({ name: e.target.value })}
              icon={User}
            />

            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              icon={Mail}
              disabled
              className="bg-stone-50 cursor-not-allowed"
            />
            <p className="text-xs text-stone-500 -mt-2">
              Email cannot be changed
            </p>

            <Button type="submit" loading={nameLoading} className="w-full">
              Save changes
            </Button>
          </form>
        </div>

        {/* Change password */}
        <div className="card p-6">
          <div className="mb-5">
            <h3 className="font-semibold text-stone-900 mb-1">Change password</h3>
            <p className="text-sm text-stone-500">
              Update your password regularly
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              placeholder="Enter current password"
              icon={Lock}
              value={pwdForm.currentPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, currentPassword: e.target.value })
              }
              error={pwdErrors.currentPassword}
            />
            <Input
              label="New password"
              type="password"
              placeholder="At least 6 characters"
              icon={Lock}
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              error={pwdErrors.newPassword}
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Repeat new password"
              icon={Lock}
              value={pwdForm.confirmPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, confirmPassword: e.target.value })
              }
              error={pwdErrors.confirmPassword}
            />

            <Button type="submit" loading={pwdLoading} className="w-full">
              Change password
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}