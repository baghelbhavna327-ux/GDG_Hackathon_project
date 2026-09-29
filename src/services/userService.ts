import { User, AuditLogEntry, UserRole } from '../types/auth';
import { authService } from './authService';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5000/api';

export const userService = {
  /**
   * Fetch all registered users (Admin only)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
        credentials: 'include'
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch users.');
      }

      return (result.data?.users || []).map((u: any) => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        facility: u.facility,
        phoneNumber: u.phoneNumber,
        dutyStatus: u.dutyStatus,
        createdAt: u.createdAt
      }));
    } catch (err: any) {
      console.error('Error fetching users:', err);
      throw err;
    }
  },

  /**
   * Update user role & details (Admin only)
   */
  async updateUserRole(
    userId: string,
    role: UserRole,
    department?: string,
    facility?: string
  ): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ role, department, facility })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to update user role.');
    }

    return result.data.user;
  },

  /**
   * Delete a user account (Admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
      credentials: 'include'
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to delete user.');
    }
  },

  /**
   * Get system audit logs (Admin only)
   */
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/audit-logs`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
        credentials: 'include'
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch audit logs.');
      }

      return result.data?.logs || [];
    } catch (err: any) {
      console.warn('Error fetching audit logs:', err.message);
      return [];
    }
  }
};
