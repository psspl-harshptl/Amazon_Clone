import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = sessionStorage.getItem('amazon_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(res => {
        if (res.data.success && res.data.data) {
          setUser(res.data.data);
          sessionStorage.setItem('amazon_user', JSON.stringify(res.data.data));
        } else {
          sessionStorage.removeItem('amazon_token');
          sessionStorage.removeItem('amazon_user');
        }
      })
      .catch(() => {
        // 401 interceptor in axios.js handles token removal & redirect
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('amazon_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('amazon_user');
    sessionStorage.removeItem('amazon_token');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
