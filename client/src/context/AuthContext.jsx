import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const { data } = await authAPI.getMe();
          setUser(data.data.user);
          localStorage.setItem('user', JSON.stringify(data.data.user));
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const { user: loggedInUser, accessToken } = data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    const { user: newUser, accessToken } = data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors on logout
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // NEW — Update user (used by Profile page)
  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  // NEW — Clear local state on account delete
  const clearUser = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    clearUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};