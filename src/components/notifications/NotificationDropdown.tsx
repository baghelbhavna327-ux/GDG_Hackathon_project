import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Truck,
  PackagePlus,
  PackageCheck,
  ArrowRightLeft,
  ShieldAlert,
  Clock,
  Check,
  Loader2,
  RefreshCw,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { AppNotification, NotificationType } from '../../types';
import { useTranslation } from '../../i18n';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../services/notificationService';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange
}) => {
  const { t, formatNotificationMessage, isHindi } = useTranslation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load notifications from backend
  const loadData = useCallback(async (showLoadingSpinner: boolean = false) => {
    if (showLoadingSpinner) setIsLoading(true);
    setError(null);

    try {
      const result = await fetchNotifications(40);
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      if (onUnreadCountChange) {
        onUnreadCountChange(result.unreadCount);
      }
    } catch (err: any) {
      console.warn('Error loading notifications:', err);
      setError('Unable to load notifications.');
    } finally {
      if (showLoadingSpinner) setIsLoading(false);
    }
  }, [onUnreadCountChange]);

  // Initial load and periodic polling (every 25 seconds)
  useEffect(() => {
    loadData(true);

    const interval = setInterval(() => {
      loadData(false);
    }, 25000);

    const handleCustomRefresh = () => {
      loadData(false);
    };

    window.addEventListener('healthchain:notification-refresh', handleCustomRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('healthchain:notification-refresh', handleCustomRefresh);
    };
  }, [loadData]);

  // Reload when opened
  useEffect(() => {
    if (isOpen) {
      loadData(false);
    }
  }, [isOpen, loadData]);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Mark single notification as read & navigate
  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      if (onUnreadCountChange) onUnreadCountChange(newCount);

      await markNotificationAsRead(notif._id);
    }

    onClose();

    // Route navigation based on actionUrl or type
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    } else {
      switch (notif.type) {
        case 'SUPPLY_REQUEST':
          navigate('/admin/dashboard');
          break;
        case 'SUPPLY_APPROVED':
        case 'SUPPLY_REJECTED':
        case 'SUPPLY_FULFILLED':
          navigate('/clinician');
          break;
        case 'CRITICAL_STOCK':
        case 'HIGH_STOCK_RISK':
          navigate('/inventory');
          break;
        case 'EMERGENCY':
          navigate('/emergency');
          break;
        case 'REDISTRIBUTION':
          navigate('/redistribution');
          break;
        default:
          navigate('/dashboard');
      }
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);

    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    if (onUnreadCountChange) onUnreadCountChange(0);

    try {
      await markAllNotificationsAsRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Time formatter
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSecs < 60) return t('notifications.justNow');
      if (diffSecs < 3600) return t('notifications.minAgo', { min: Math.floor(diffSecs / 60) });
      if (diffSecs < 86400) return t('notifications.hoursAgo', { hours: Math.floor(diffSecs / 3600) });
      if (diffSecs < 172800) return t('notifications.yesterday');
      return date.toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' });
    } catch {
      return t('notifications.justNow');
    }
  };

  // Icon & Style Mapping by Notification Type
  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'SUPPLY_REQUEST':
        return {
          icon: <PackagePlus className="h-4 w-4 text-amber-500" />,
          bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60'
        };
      case 'SUPPLY_APPROVED':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
          bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60'
        };
      case 'SUPPLY_REJECTED':
        return {
          icon: <AlertOctagon className="h-4 w-4 text-rose-500" />,
          bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60'
        };
      case 'SUPPLY_FULFILLED':
        return {
          icon: <Truck className="h-4 w-4 text-teal-500" />,
          bg: 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/60'
        };
      case 'CRITICAL_STOCK':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
          bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-900'
        };
      case 'HIGH_STOCK_RISK':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
          bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
        };
      case 'EMERGENCY':
        return {
          icon: <ShieldAlert className="h-4 w-4 text-rose-600 animate-pulse" />,
          bg: 'bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800'
        };
      case 'REDISTRIBUTION':
        return {
          icon: <ArrowRightLeft className="h-4 w-4 text-cyan-500" />,
          bg: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800/60'
        };
      default:
        return {
          icon: <Bell className="h-4 w-4 text-teal-500" />,
          bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        };
    }
  };

  const getLocalizedNotificationText = (notif: AppNotification) => {
    // If backend notification contains structured template type, format accordingly
    if (isHindi) {
      if (notif.type === 'SUPPLY_REQUEST') {
        const match = notif.message.match(/(.+) requested (\d+) units of (.+)\./i);
        if (match) {
          return {
            title: 'नई दवा आपूर्ति का अनुरोध',
            message: `${match[1]} ने ${match[3]} की ${match[2]} इकाइयों की मांग की है।`
          };
        }
      }
      if (notif.type === 'SUPPLY_APPROVED') {
        return {
          title: 'आपूर्ति अनुरोध स्वीकृत',
          message: notif.message.replace(/Supply request for (\d+) units of (.+) at (.+) was approved\./i, '$3 के लिए $2 की $1 इकाइयों का अनुरोध स्वीकृत किया गया।')
        };
      }
      if (notif.type === 'SUPPLY_REJECTED') {
        return {
          title: 'आपूर्ति अनुरोध अस्वीकृत',
          message: notif.message.replace(/Supply request for (\d+) units of (.+) at (.+) was rejected\./i, '$3 के लिए $2 की $1 इकाइयों का अनुरोध अस्वीकृत कर दिया गया।')
        };
      }
      if (notif.type === 'CRITICAL_STOCK') {
        return {
          title: 'गंभीर दवा कमी चेतावनी',
          message: notif.message.replace(/Critical stock deficit detected at (.+) for (.+)\./i, '$1 में $2 की गंभीर कमी पाई गई।')
        };
      }
      if (notif.type === 'EMERGENCY') {
        return {
          title: 'आपातकालीन मांग वृद्धि अलर्ट',
          message: notif.message.replace(/EMERGENCY SURGE:/i, 'आपातकालीन वृद्धि:')
        };
      }
      if (notif.type === 'REDISTRIBUTION') {
        return {
          title: 'संसाधन पुनर्वितरण ट्रांसफर',
          message: notif.message.replace(/Inter-facility transfer dispatched/i, 'अंतर-केंद्र ट्रांसफर रवाना किया गया')
        };
      }
    }
    return { title: notif.title, message: notif.message };
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2.5 w-[320px] sm:w-[390px] max-w-[calc(100vw-24px)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-slate-900 dark:text-slate-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
              {t('notifications.title')}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {t('notifications.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80">
              {t('notifications.unreadCount', { count: unreadCount })}
            </span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title={t('notifications.markAllRead')}
            >
              {isMarkingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              <span>{t('notifications.markAllRead')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications Body */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {isLoading && notifications.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-medium">{t('common.loading')}</span>
          </div>
        ) : error ? (
          <div className="py-8 px-4 text-center">
            <AlertTriangle className="h-6 w-6 text-rose-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('common.unableToLoad')}</p>
            <button
              onClick={() => loadData(true)}
              className="mt-2 text-xs font-extrabold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>{t('common.retry')}</span>
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <CheckCircle2 className="h-5 w-5 text-teal-500" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('notifications.noNew')}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {t('notifications.allClear')}
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const badge = getTypeBadge(notif.type);
            const localized = getLocalizedNotificationText(notif);
            return (
              <div
                key={notif._id || notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3.5 transition-all duration-150 flex items-start gap-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:translate-x-0.5 relative ${
                  !notif.isRead
                    ? 'bg-teal-50/50 dark:bg-teal-950/30 border-l-2 border-teal-500'
                    : 'bg-white dark:bg-slate-900'
                }`}
              >
                {/* Icon Container */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border shrink-0 mt-0.5 ${badge.bg}`}
                >
                  {badge.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs truncate ${
                        !notif.isRead
                          ? 'font-extrabold text-slate-900 dark:text-slate-50'
                          : 'font-semibold text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {localized.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-medium flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {localized.message}
                  </p>

                  <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-teal-600 dark:text-teal-400">
                    <span>{t('notifications.viewDetails')}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </div>
                </div>

                {/* Unread Pulse Indicator */}
                {!notif.isRead && (
                  <span className="absolute right-3 top-4 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-teal-200 dark:ring-teal-900" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 text-center">
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3 text-teal-500" />
          <span>{t('notifications.automatedSystem')}</span>
        </span>
      </div>
    </div>
  );
};
