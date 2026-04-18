// src/components/admin/NotificationCenter.jsx
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, XCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to new applications
    const subscription = supabase
      .channel('mentorship_applications_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'mentorship_applications' },
        (payload) => {
          addNotification({
            id: payload.new.id,
            type: 'new_application',
            title: 'New Mentorship Application',
            message: `${payload.new.full_name} applied for ${payload.new.service_title}`,
            data: payload.new,
            timestamp: new Date(),
            read: false
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    // Get pending verifications
    const { data: pendingApps } = await supabase
      .from('mentorship_applications')
      .select('*')
      .eq('payment_status', 'awaiting_verification')
      .limit(5);

    // Get new applications
    const { data: newApps } = await supabase
      .from('mentorship_applications')
      .select('*')
      .eq('status', 'new')
      .limit(5);

    const notifs = [];
    
    if (pendingApps) {
      pendingApps.forEach(app => {
        notifs.push({
          id: `pending-${app.id}`,
          type: 'pending_verification',
          title: 'Payment Pending Verification',
          message: `${app.full_name} - $${app.payment_amount}`,
          data: app,
          timestamp: new Date(app.submitted_at),
          read: false
        });
      });
    }
    
    if (newApps) {
      newApps.forEach(app => {
        notifs.push({
          id: `new-${app.id}`,
          type: 'new_application',
          title: 'New Application',
          message: `${app.full_name} - ${app.service_title}`,
          data: app,
          timestamp: new Date(app.submitted_at),
          read: false
        });
      });
    }
    
    setNotifications(notifs.slice(0, 10));
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 20));
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'new_application':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'pending_verification':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition ${!notif.read ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    markAsRead(notif.id);
                    if (notif.type === 'pending_verification') {
                      window.location.href = '/admin';
                    }
                  }}
                >
                  <div className="flex gap-3">
                    {getIcon(notif.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-gray-500">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 border-t">
            <a
              href="/admin"
              className="block text-center text-sm text-blue-600 hover:underline"
            >
              Go to Admin Panel →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;