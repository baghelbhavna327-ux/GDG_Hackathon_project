import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount by checking backend
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getStoredUser();
      
      // If no token in storage, user is unauthenticated
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
        // Verify token with backend
        const currentUser = await authService.getMe();
        if (isMounted) {
          setUser(currentUser);
          setToken(storedToken);
        }
      } catch (err: any) {
        if (isMounted) {
          // If stored user exists, retain authenticated state
          if (storedUser) {
            setUser(storedUser);
            setToken(storedToken);
          } else {
            authService.removeToken();
            authService.removeStoredUser();
            setUser(null);
            setToken(null);
          }
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

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.data?.user) {
        setUser(response.data.user);
        setToken(response.token || authService.getToken());
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(credentials);
      if (response.data?.user) {
        setUser(response.data.user);
        setToken(response.token || authService.getToken());
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

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
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
