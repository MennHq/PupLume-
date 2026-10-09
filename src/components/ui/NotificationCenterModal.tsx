import React, { useState } from 'react';
import { Bell, CheckCheck, Calendar, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { storage } from '../../lib/storage';
import { NotificationItem } from '../../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (url: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(storage.getNotifications());
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter(n => filter === 'all' || !n.read);

  const handleMarkAllRead = () => {
    storage.markAllNotificationsRead();
    setNotifications(storage.getNotifications());
  };

  const handleItemClick = (n: NotificationItem) => {
    storage.markNotificationRead(n.id);
    setNotifications(storage.getNotifications());
    if (n.actionUrl && onSelectAction) {
      onSelectAction(n.actionUrl);
      onClose();
    }
  };

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'health':
        return <Activity className="w-4 h-4 text-rose-600" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-[#8B5E3C]" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Center"
      subtitle="Reminders, health alerts, and AI insights"
      maxWidth="md"
    >
      <div className="space-y-3">
        {/* Controls */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E8DDD3]">
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filter === 'all' ? 'bg-[#8B5E3C] text-white' : 'bg-[#F3E7DA] text-[#5F3E29]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filter === 'unread' ? 'bg-[#8B5E3C] text-white' : 'bg-[#F3E7DA] text-[#5F3E29]'
              }`}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
          </div>

          <button
            id="mark-all-read-btn"
            onClick={handleMarkAllRead}
            className="text-xs text-[#8B5E3C] hover:text-[#5F3E29] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        {/* List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#766A63]">
              <Bell className="w-8 h-8 text-[#E8DDD3] mx-auto mb-2" />
              All caught up! No notifications.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.read
                    ? 'bg-white border-[#E8DDD3]/80 opacity-75'
                    : 'bg-[#FFF9F2] border-[#8B5E3C]/30 shadow-xs hover:border-[#8B5E3C]'
                }`}
              >
                <div className="p-2 rounded-lg bg-white border border-[#E8DDD3] flex-shrink-0 mt-0.5">
                  {getIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#2C211B] truncate">{item.title}</h4>
                    <span className="text-[10px] text-[#766A63] flex-shrink-0">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#766A63] mt-1 leading-relaxed">{item.message}</p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#8B5E3C] mt-2 flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
