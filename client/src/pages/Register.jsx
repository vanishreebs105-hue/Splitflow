import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  // Smooth panel swap every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSwapped((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name is too short';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Account created');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${swapped ? 'auth-swapped' : ''}`}>
      {/* ============ LEFT PANEL — Brand ============ */}
      <div className="hidden lg:flex lg:w-1/2 auth-panel-left relative overflow-hidden">
        <div className="flex flex-col justify-between p-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 auth-text-on-dark">
            <div
              className="auth-logo-box w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: swapped ? '#e11d48' : '#ffffff' }}
            >
              <span
                className="auth-logo-box text-base font-semibold"
                style={{ color: swapped ? '#ffffff' : '#e11d48' }}
              >
                S
              </span>
            </div>
            <span className="text-lg font-semibold tracking-tight">SplitFlow</span>
          </div>

          {/* Headline */}
          <div className="max-w-md">
            <h1 className="text-4xl font-semibold leading-[1.1] mb-5 tracking-tight auth-text-on-dark">
              Start splitting.
              <br />
              Stay even.
            </h1>
            <p className="text-base leading-relaxed auth-text-muted">
              Join thousands managing shared expenses the simple way — no spreadsheets, no awkward reminders.
            </p>
          </div>

          {/* Footer meta */}
          <div className="flex gap-8 text-xs font-medium auth-text-muted">
            <span>Free forever</span>
            <span>No card needed</span>
            <span>Setup in seconds</span>
          </div>
        </div>
      </div>

      {/* ============ RIGHT PANEL — Form ============ */}
      <div className="flex-1 flex items-center justify-center p-6 auth-panel-right">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">S</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-stone-900">
              SplitFlow
            </span>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-stone-900 mb-2 tracking-tight">
              Create your account
            </h2>
            <p className="text-sm text-stone-500">
              Takes less than a minute
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full name"
              type="text"
              name="name"
              placeholder="Your name"
              icon={User}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <p className="text-center text-sm text-stone-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-stone-900 hover:text-brand-600 font-medium transition-colors underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}