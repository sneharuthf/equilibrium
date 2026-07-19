import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Conversation {
  _id: string;
  user: { _id: string; anonymousUsername: string };
  mentor: { _id: string; anonymousUsername: string };
}

interface Message {
  _id: string;
  conversation: string;
  sender: string;
  content: string;
  createdAt: string;
}

export default function MentorChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/mentor/conversations").then((res) => setConversations(res.data.conversations));

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token: localStorage.getItem("equilibrium_token") },
    });
    socketRef.current = socket;

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => (msg.conversation === activeId ? [...prev, msg] : prev));
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return;
    api.get(`/mentor/conversations/${activeId}/messages`).then((res) => setMessages(res.data.messages));
    socketRef.current?.emit("join_conversation", activeId);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    socketRef.current?.emit("send_message", { conversationId: activeId, content: draft });
    setDraft("");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-4" style={{ minHeight: "70vh" }}>
      <div className="card p-4 md:col-span-1">
        <h2 className="font-medium mb-3">Conversations</h2>
        <div className="space-y-2">
          {conversations.map((c) => {
            const label = user?.role === "mentor" ? c.user.anonymousUsername : c.mentor.anonymousUsername;
            return (
              <button
                key={c._id}
                onClick={() => setActiveId(c._id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeId === c._id ? "bg-equilibrium-soft text-equilibrium-blue" : "hover:bg-black/5"}`}
              >
                {label}
              </button>
            );
          })}
          {conversations.length === 0 && <p className="text-sm text-gray-400">No conversations yet.</p>}
        </div>
      </div>

      <div className="card p-4 md:col-span-2 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 mb-3" style={{ maxHeight: "50vh" }}>
          {messages.map((m) => (
            <div key={m._id} className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.sender === user?._id ? "bg-equilibrium-blue text-white ml-auto" : "bg-black/5"}`}>
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        {activeId ? (
          <form onSubmit={send} className="flex gap-2">
            <input className="input" placeholder="Type a message..." value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="btn-primary">Send</button>
          </form>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">Select a conversation to start chatting.</p>
        )}
      </div>
    </div>
  );
}
