import { AppNotification } from '../types';

const API_BASE_URL = `${((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5000/api'}/notifications`;

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

/**
 * Fetch notifications for current logged-in user
 */
export const fetchNotifications = async (limit: number = 40): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> => {
  try {
    const res = await fetch(`${API_BASE_URL}?limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return {
          notifications: data.data,
          unreadCount: typeof data.unreadCount === 'number' ? data.unreadCount : data.data.filter((n: AppNotification) => !n.isRead).length
        };
      }
    }
  } catch (err) {
    console.warn('[NotificationService] Fetch error:', err);
  }

  return { notifications: [], unreadCount: 0 };
};

/**
 * Fetch unread notification count only
 */
export const fetchUnreadCount = async (): Promise<number> => {
  try {
    const res = await fetch(`${API_BASE_URL}/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.unreadCount === 'number') {
        return data.unreadCount;
      }
    }
  } catch (err) {
    console.warn('[NotificationService] Count error:', err);
  }

  return 0;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err) {
    console.warn('[NotificationService] Mark read error:', err);
  }

  return false;
};

/**
 * Mark all notifications as read for current user
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/mark-all-read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err) {
    console.warn('[NotificationService] Mark all read error:', err);
  }

  return false;
};

/**
 * Global trigger to refresh notifications across components
 */
export const triggerNotificationRefresh = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('healthchain:notification-refresh'));
  }
};

