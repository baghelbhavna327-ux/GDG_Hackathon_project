export type UserRole = 'admin' | 'health_worker' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  facility?: string;
  phoneNumber?: string;
  dutyStatus?: 'on_duty' | 'off_duty';
  createdAt?: string;
}

export interface AuditLogEntry {
  _id: string;
  action: string;
  performedBy?: string;
  performedByName: string;
  performedByEmail: string;
  performedByRole: string;
  targetResource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  data?: {
    user: User;
  };
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: UserRole;
  department?: string;
  facility?: string;
  phoneNumber?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}
