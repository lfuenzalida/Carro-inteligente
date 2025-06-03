import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  userId: number | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored) : null;
  });

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('http://localhost:3000/api/users/login', { email, password });
      localStorage.setItem('userId', res.data.userId);
      setUserId(res.data.userId);
      return true;
    } catch (err) {
      console.error('Login fallido', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
