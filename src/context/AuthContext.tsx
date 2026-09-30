
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and verify the existing session when the app starts.
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getStoredUser();

      // No stored session -> remain logged out.
      if (!storedToken || !storedUser) {
        if (isMounted) {
          authService.removeToken();
          authService.removeStoredUser();
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Verify the stored token with the production backend.
        const currentUser = await authService.getMe();

        if (isMounted) {
          setUser(currentUser);
          setToken(storedToken);
          setError(null);
        }
      } catch (err) {
        // The stored token is invalid/expired/rejected by the backend.
        // Clear the stale session instead of treating the user as authenticated.
        if (isMounted) {
          authService.removeToken();
          authService.removeStoredUser();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login
  const login = async (
    credentials: LoginCredentials
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      if (response.data?.user) {
        setUser(response.data.user);
        setToken(response.token || authService.getToken());
        setError(null);
        return true;
      }

      setError('Login failed. No user data was returned.');
      return false;
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (
    credentials: RegisterCredentials
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(credentials);

      if (response.data?.user) {
        setUser(response.data.user);
        setToken(response.token || authService.getToken());
        setError(null);
        return true;
      }

      setError('Registration failed. No user data was returned.');
      return false;
    } catch (err: any) {
      setError(
        err?.message || 'Registration failed. Please check your inputs.'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout network notice:', err);
    } finally {
      authService.removeToken();
      authService.removeStoredUser();

      setUser(null);
      setToken(null);
      setError(null);
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (
    profileData: Partial<User>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await authService.updateProfile(profileData);

      setUser(updatedUser);
      setError(null);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};