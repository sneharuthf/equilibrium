import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedConversation?: string | null;
  relatedPost?: string | null;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  function load() {
    api.get("/notifications").then((res) => {
      setItems(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    });
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    await api.patch("/notifications/read-all");
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  async function handleClickItem(n: NotificationItem) {
    if (!n.read) {
      await api.patch(`/notifications/${n._id}/read`);
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.type === "new_message" && n.relatedConversation) {
      navigate("/messages", { state: { conversationId: n.relatedConversation } });
    } else if (n.type === "post_like") {
      navigate("/feed");
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <button onClick={() => setOpen((o) => !o)} className="relative text-gray-500 hover:text-equilibrium-blue" title="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lg border border-black/5 z-50">
          <div className="flex items-center justify-between p-3 border-b border-black/5">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-equilibrium-blue hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 && <p className="text-sm text-gray-400 p-4 text-center">No notifications yet.</p>}
          {items.map((n) => (
            <button
              key={n._id}
              onClick={() => handleClickItem(n)}
              className={`w-full text-left px-3 py-2 border-b border-black/5 last:border-0 hover:bg-black/5 ${!n.read ? "bg-equilibrium-soft/50" : ""}`}
            >
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}