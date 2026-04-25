import React from "react";
import { Clock, TrendingUp, FileText, AlertTriangle, Sparkles, Bell, Check, RefreshCw, Calendar } from "lucide-react";
import { markNotificationsRead } from "../api";
import { SectionTitle } from "../components/ui";

const TYPE_CONFIG = {
  deadline:      { icon: Clock,         color: "var(--danger)" },
  score:         { icon: TrendingUp,    color: "var(--accent)" },
  doc:           { icon: FileText,      color: "var(--warn)"   },
  eligibility:   { icon: AlertTriangle, color: "var(--warn)"   },
  ai:            { icon: Sparkles,      color: "var(--accent)" },
  doc_expiry:    { icon: Calendar,      color: "var(--danger)" },
  status_update: { icon: RefreshCw,     color: "var(--accent)" },
};

const Notifications = ({ notifications, setNotifications }) => {
  const unreadCount = notifications.filter((n) => n.unread ?? !n.is_read).length;

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, unread: false, is_read: true } : n)
    );
    try { await markNotificationsRead([id]); } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false, is_read: true })));
    try { await markNotificationsRead(); } catch (e) { console.error(e); }
  };

  return (
    <div className="px-8 py-8 fade-up max-w-3xl">
      <SectionTitle kicker={`${notifications.length} alerts · ${unreadCount} unread`} title="Notifications">
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
            <Check size={13} /> Mark all as read
          </button>
        )}
      </SectionTitle>

      <div className="card">
        {notifications.map((n, i) => {
          const { icon: Icon, color } = TYPE_CONFIG[n.type] ?? { icon: Bell, color: "var(--ink-3)" };
          const isUnread = n.unread ?? !n.is_read;
          const isLast   = i === notifications.length - 1;

          return (
            <div key={n.id}
              className={`px-5 py-4 flex gap-4 items-start transition ${!isLast ? "hairline-b" : ""}`}
              style={{ background: isUnread ? "var(--surface)" : "transparent", opacity: isUnread ? 1 : 0.55 }}>
              <div className="pt-1.5 shrink-0">
                {isUnread
                  ? <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                  : <div className="w-2 h-2" />}
              </div>
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "var(--surface-2)" }}>
                <Icon size={14} style={{ color }} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] text-ink">{n.message}</div>
                <div className="mono text-[10.5px] text-ink-4 uppercase tracking-widest mt-1">
                  {n.time ?? n.created_at}
                </div>
              </div>
              {isUnread && (
                <button className="btn btn-ghost btn-sm shrink-0 text-[11.5px]"
                  onClick={() => handleMarkRead(n.id)}>
                  <Check size={11} /> Read
                </button>
              )}
            </div>
          );
        })}
        {notifications.every((n) => !(n.unread ?? !n.is_read)) && (
          <div className="text-center py-8 text-ink-3 text-[13px] italic">
            All caught up — no unread notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;