import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5000/api';

const TOKEN_KEY = 'healthchain_auth_token';
const USER_KEY = 'healthchain_auth_user';

export const authService = {
  // Token management helpers
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setStoredUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeStoredUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  // Helper for auth headers
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result: AuthResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Registration failed. Please verify your details.');
      }

      if (result.token) {
        this.setToken(result.token);
      }
      if (result.data?.user) {
        this.setStoredUser(result.data.user);
      }

      return result;
    } catch (err: any) {
      throw new Error(err.message || 'Network error occurred during registration.');
    }
  },

  /**
   * Helper for recognized demo user accounts
   */
  getDemoUser(email: string, password?: string): User | null {
    const normalizedEmail = email.toLowerCase().trim();

    // Demo Admin
    if (
      normalizedEmail === 'admin@healthchain.gov.in' ||
      normalizedEmail === 'admin@healthchain.ai' ||
      normalizedEmail === 'admin@healthchain.com'
    ) {
      if (!password || password === 'Admin@123456' || password.toLowerCase() === 'admin' || password.toLowerCase() === 'demo') {
        return {
          id: 'usr-admin-01',
          name: 'Dr. Rachel Vance',
          email: 'admin@healthchain.gov.in',
          role: 'admin',
          department: 'Regional Healthcare Crisis Directorate',
          facility: 'National Command Center',
          phoneNumber: '+91 98111 22334',
          dutyStatus: 'on_duty',
          createdAt: new Date().toISOString()
        };
      }
    }

    // Demo Clinician
    if (
      normalizedEmail === 'worker@healthchain.gov.in' ||
      normalizedEmail === 'clinician@healthchain.gov.in' ||
      normalizedEmail === 'doctor@healthchain.gov.in' ||
      normalizedEmail === 'worker@healthchain.ai'
    ) {
      if (!password || password === 'Worker@123456' || password === 'Clinician@123456' || password.toLowerCase() === 'worker' || password.toLowerCase() === 'demo') {
        return {
          id: 'usr-worker-02',
          name: 'Dr. Priya Sharma',
          email: 'worker@healthchain.gov.in',
          role: 'health_worker',
          department: 'Primary Healthcare Operations',
          facility: 'PHC Sehore North',
          phoneNumber: '+91 98222 33445',
          dutyStatus: 'on_duty',
          createdAt: new Date().toISOString()
        };
      }
    }

    // Demo Viewer
    if (
      normalizedEmail === 'viewer@healthchain.gov.in' ||
      normalizedEmail === 'viewer@healthchain.ai' ||
      normalizedEmail === 'demo@healthchain.com' ||
      normalizedEmail === 'public@healthchain.gov.in'
    ) {
      if (!password || password === 'Viewer@123456' || password.toLowerCase() === 'viewer' || password.toLowerCase() === 'demo') {
        return {
          id: 'usr-viewer-03',
          name: 'Rajesh Gupta',
          email: 'viewer@healthchain.gov.in',
          role: 'viewer',
          department: 'Public Health Telemetry & Oversight',
          facility: 'State Health Mission Registry',
          phoneNumber: '+91 98333 44556',
          dutyStatus: 'on_duty',
          createdAt: new Date().toISOString()
        };
      }
    }

    return null;
  },

  /**
   * Login existing user
   */
  async login(data: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = data;

    // 1. First attempt to authenticate via live backend API
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result: AuthResponse = await response.json();
        if (result.success && result.data?.user) {
          if (result.token) {
            this.setToken(result.token);
          }
          this.setStoredUser(result.data.user);
          return result;
        }
      }
    } catch (networkError) {
      // Backend unavailable; proceed to safe demo credentials validation
    }

    // 2. Fallback: Authenticate recognized demo role credentials
    const demoUser = this.getDemoUser(email, password);
    if (demoUser) {
      const demoToken = `demo_jwt_${demoUser.role}_${Date.now()}`;
      this.setToken(demoToken);
      this.setStoredUser(demoUser);

      return {
        success: true,
        message: 'Demo session established successfully.',
        token: demoToken,
        data: {
          user: demoUser
        }
      };
    }

    throw new Error('Invalid email or password. Please use demo credentials or verify your account.');
  },

  /**
   * Fetch current authenticated user
   */
  async getMe(): Promise<User> {
    // 1. Check if we have a stored user first
    const storedUser = this.getStoredUser();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.user) {
          const user = result.data.user;
          this.setStoredUser(user);
          return user;
        }
      }
    } catch (networkError) {
      // If backend is offline but user is in stored session, retain session
      if (storedUser) {
        return storedUser;
      }
    }

    // If stored user exists (e.g. demo session), retain it
    if (storedUser) {
      return storedUser;
    }

    this.removeToken();
    this.removeStoredUser();
    throw new Error('Session expired. Please log in.');
  },

  /**
   * Update profile information
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update profile.');
      }

      const updatedUser = result.data.user;
      this.setStoredUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      throw new Error(err.message || 'Network error updating profile.');
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });
    } catch (err) {
      console.warn('Logout API call notification error:', err);
    } finally {
      this.removeToken();
      this.removeStoredUser();
    }
  }
};
