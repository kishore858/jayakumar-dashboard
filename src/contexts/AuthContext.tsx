
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '@/lib/types';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component that wraps the app
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        // In a real app, this would verify the token with the server
        const storedUser = localStorage.getItem('dashboardUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Session error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await api.auth.login(email, password);
      setUser(user);
      // Save user to local storage
      localStorage.setItem('dashboardUser', JSON.stringify(user));
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await api.auth.signup(name, email, password);
      setUser(user);
      // Save user to local storage
      localStorage.setItem('dashboardUser', JSON.stringify(user));
      toast({
        title: "Account created successfully",
        description: `Welcome, ${user.name}!`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    api.auth.logout();
    localStorage.removeItem('dashboardUser');
    setUser(null);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  // Create the value for the context
  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
