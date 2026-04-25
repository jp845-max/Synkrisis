import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'artist' | 'provider' | 'admin';
  isApproved: boolean;
  needs?: string[];
  skills?: string[];
  portfolio?: string;
  bio?: string;
  avatar?: string;
  rating?: number;
  completedProjects?: number;
  profileCompleted?: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  setTokenAndFetchUser: (token: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const userData = await api.get('/auth/me');
          setUser(userData);
        } catch (error) {
          console.error('Invalid token', error);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response) {
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response);
    }
  };

  const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response) {
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const setTokenAndFetchUser = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const userData = await api.get('/auth/me');
    setUser(userData);
    return userData;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        setTokenAndFetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
