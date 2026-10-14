import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Settings, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Logo from '../ui/Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    navigate('/settings');
  };

  const handleHelp = () => {
    setDropdownOpen(false);
    toast('Help center coming soon', { icon: '💬' });
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
          <Logo size="md" />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setDropdownOpen(false);
              }}
              className="relative p-2.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all active:scale-95"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full pulse-dot" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 py-2 dropdown-enter">
                <div className="px-4 py-2 border-b border-stone-100">
                  <p className="text-sm font-semibold text-stone-900">Notifications</p>
                </div>
                <div className="px-4 py-8 text-center">
                  <Bell size={24} className="mx-auto text-stone-300 mb-2" />
                  <p className="text-sm text-stone-500">No new notifications</p>
                  <p className="text-xs text-stone-400 mt-1">You're all caught up</p>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-all active:scale-[0.98]"
            >
              <div className="w-8 h-8 bg-olive-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                {initials || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-stone-800">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown
                size={14}
                className={`text-stone-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden dropdown-enter">
                {/* User header */}
                <div className="px-4 py-3.5 bg-gradient-to-br from-olive-50 to-stone-50 border-b border-stone-100">
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <User size={15} className="text-stone-400" />
                    Profile
                  </button>
                  <button
                    onClick={handleSettings}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <Settings size={15} className="text-stone-400" />
                    Settings
                  </button>
                  <button
                    onClick={handleHelp}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <HelpCircle size={15} className="text-stone-400" />
                    Help & support
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-stone-100 py-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}