
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types/auth';

const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string) ||
  'http://localhost:5000/api';

const TOKEN_KEY = 'healthchain_auth_token';
const USER_KEY = 'healthchain_auth_user';

const isDevelopment =
  Boolean((import.meta as any).env?.DEV) ||
  (typeof window !== 'undefined' &&
    window.location.hostname === 'localhost');

export const authService = {
  // ------------------------------------------------------------
  // TOKEN MANAGEMENT
  // ------------------------------------------------------------

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  // ------------------------------------------------------------
  // USER MANAGEMENT
  // ------------------------------------------------------------

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setStoredUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeStoredUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  // ------------------------------------------------------------
  // AUTH HEADERS
  // ------------------------------------------------------------

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },

  // ------------------------------------------------------------
  // REGISTER
  // ------------------------------------------------------------

  async register(
    data: RegisterCredentials
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      const result: AuthResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            result.message ||
            'Registration failed. Please verify your details.'
        );
      }

      if (result.token) {
        this.setToken(result.token);
      }

      if (result.data?.user) {
        this.setStoredUser(result.data.user);
      }

      return result;
    } catch (err: any) {
      throw new Error(
        err?.message ||
          'Network error occurred during registration.'
      );
    }
  },

  // ------------------------------------------------------------
  // LOCAL DEMO USERS
  //
  // These are used ONLY during local development.
  // They are NOT used by the production deployment.
  // ------------------------------------------------------------

  getDemoUser(
    email: string,
    password?: string
  ): User | null {
    const normalizedEmail = email
      .toLowerCase()
      .trim();

    // Demo Admin
    if (
      normalizedEmail === 'admin@healthchain.gov.in' ||
      normalizedEmail === 'admin@healthchain.ai' ||
      normalizedEmail === 'admin@healthchain.com'
    ) {
      if (
        !password ||
        password === 'Admin@123456' ||
        password.toLowerCase() === 'admin' ||
        password.toLowerCase() === 'demo'
      ) {
        return {
          id: 'usr-admin-01',
          name: 'Dr. Rachel Vance',
          email: 'admin@healthchain.gov.in',
          role: 'admin',
          department:
            'Regional Healthcare Crisis Directorate',
          facility: 'National Command Center',
          phoneNumber: '+91 98111 22334',
          dutyStatus: 'on_duty',
          createdAt: new Date().toISOString(),
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
      if (
        !password ||
        password === 'Worker@123456' ||
        password === 'Clinician@123456' ||
        password.toLowerCase() === 'worker' ||
        password.toLowerCase() === 'demo'
      ) {
        return {
          id: 'usr-worker-02',
          name: 'Dr. Priya Sharma',
          email: 'worker@healthchain.gov.in',
          role: 'health_worker',
          department:
            'Primary Healthcare Operations',
          facility: 'PHC Sehore North',
          phoneNumber: '+91 98222 33445',
          dutyStatus: 'on_duty',
          createdAt: new Date().toISOString(),
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
      if (
        !password ||
        password === 'Viewer@123456' ||
        password.toLowerCase() === 'viewer' ||
        password.toLowerCase() === 'demo'
      ) {
        return {
          id: 'usr-viewer-03',
          name: 'Rajesh Gupta',
          email: 'viewer@healthchain.gov.in',
          role: 'viewer',
          department:
            'Public Health Telemetry & Oversight',
          facility: 'State Health Mission Registry',
          phoneNumber: '+91 98333 44556',
          dutyStatus: 'on_duty',
          createdAt: new Date().toISOString(),
        };
      }
    }

    return null;
  },

  // ------------------------------------------------------------
  // LOGIN
  // ------------------------------------------------------------

  async login(
    data: LoginCredentials
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      let result: AuthResponse | null = null;

      try {
        result = (await response.json()) as AuthResponse;
      } catch {
        result = null;
      }

      // Real backend authentication succeeded.
      if (
        response.ok &&
        result?.success &&
        result?.data?.user
      ) {
        // Remove any stale fake/old token before saving the
        // current production token.
        this.removeToken();
        this.removeStoredUser();

        if (result.token) {
          this.setToken(result.token);
        }

        this.setStoredUser(result.data.user);

        return result;
      }

      // If the backend responded with a real error,
      // do NOT silently turn it into a fake production session.
      const backendMessage =
        result?.error ||
        result?.message ||
        `Login failed with status ${response.status}.`;

      // Local-only demo fallback.
      if (isDevelopment) {
        const demoUser = this.getDemoUser(
          data.email,
          data.password
        );

        if (demoUser) {
          const demoToken =
            `demo_jwt_${demoUser.role}_${Date.now()}`;

          this.setToken(demoToken);
          this.setStoredUser(demoUser);

          return {
            success: true,
            message:
              'Local development demo session established.',
            token: demoToken,
            data: {
              user: demoUser,
            },
          };
        }
      }

      throw new Error(backendMessage);
    } catch (err: any) {
      // Local-only fallback when backend is unavailable.
      if (isDevelopment) {
        const demoUser = this.getDemoUser(
          data.email,
          data.password
        );

        if (demoUser) {
          const demoToken =
            `demo_jwt_${demoUser.role}_${Date.now()}`;

          this.setToken(demoToken);
          this.setStoredUser(demoUser);

          return {
            success: true,
            message:
              'Local development demo session established.',
            token: demoToken,
            data: {
              user: demoUser,
            },
          };
        }
      }

      // Production must never manufacture a fake JWT.
      this.removeToken();
      this.removeStoredUser();

      throw new Error(
        err?.message ||
          'Unable to sign in. Please verify your credentials.'
      );
    }
  },

  // ------------------------------------------------------------
  // CURRENT USER / SESSION VALIDATION
  // ------------------------------------------------------------

  async getMe(): Promise<User> {
    const token = this.getToken();

    if (!token) {
      this.removeStoredUser();
      throw new Error(
        'No authentication token found. Please log in.'
      );
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/me`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
          credentials: 'include',
        }
      );

      let result: any = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      // Backend confirmed the token.
      if (
        response.ok &&
        result?.success &&
        result?.data?.user
      ) {
        const user = result.data.user;

        this.setStoredUser(user);

        return user;
      }

      // 401/403 means the stored token is not valid anymore.
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        this.removeToken();
        this.removeStoredUser();

        throw new Error(
          'Your session has expired. Please log in again.'
        );
      }

      throw new Error(
        result?.error ||
          result?.message ||
          `Unable to verify session (${response.status}).`
      );
    } catch (err: any) {
      // Never keep a rejected production token alive.
      this.removeToken();
      this.removeStoredUser();

      throw new Error(
        err?.message ||
          'Unable to verify your session. Please log in again.'
      );
    }
  },

  // ------------------------------------------------------------
  // UPDATE PROFILE
  // ------------------------------------------------------------

  async updateProfile(
    profileData: Partial<User>
  ): Promise<User> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/profile`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(profileData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          this.removeToken();
          this.removeStoredUser();
        }

        throw new Error(
          result.error ||
            result.message ||
            'Failed to update profile.'
        );
      }

      const updatedUser = result.data?.user;

      if (!updatedUser) {
        throw new Error(
          'Profile update succeeded but no user data was returned.'
        );
      }

      this.setStoredUser(updatedUser);

      return updatedUser;
    } catch (err: any) {
      throw new Error(
        err?.message ||
          'Network error updating profile.'
      );
    }
  },

  // ------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------

  async logout(): Promise<void> {
    try {
      const token = this.getToken();

      if (token) {
        await fetch(
          `${API_BASE_URL}/auth/logout`,
          {
            method: 'POST',
            headers: this.getAuthHeaders(),
            credentials: 'include',
          }
        );
      }
    } catch (err) {
      console.warn(
        'Logout network notice:',
        err
      );
    } finally {
      this.removeToken();
      this.removeStoredUser();
    }
  },
};