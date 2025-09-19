import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          authService.setToken(storedToken);
          const userData = await authService.getProfile();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token: newToken, user: userData } = response;
      
      localStorage.setItem('token', newToken);
      authService.setToken(newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success('Успешен вход!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Грешка при влизане';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token: newToken, user: newUser } = response;
      
      localStorage.setItem('token', newToken);
      authService.setToken(newToken);
      setToken(newToken);
      setUser(newUser);
      
      toast.success('Регистрацията е успешна!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Грешка при регистрация';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    authService.setToken(null);
    setToken(null);
    setUser(null);
    toast.success('Успешно излизане!');
  };

  const updateProfile = async (profileData) => {
    try {
      await authService.updateProfile(profileData);
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
      toast.success('Профилът е актуализиран!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Грешка при актуализиране';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};