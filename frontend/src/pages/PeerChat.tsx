import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Participant {
  _id: string;
  anonymousUsername: string;
  role: string;
}

interface Conversation {
  _id: string;
  type: "mentor" | "peer";
  participants: Participant[];
}

interface Message {
  _id: string;
  conversation: string;
  sender: string;
  content: string;
  createdAt: string;
}

export default function PeerChat() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [chatError, setChatError] = useState("");
  const [reported, setReported] = useState<Set<string>>(new Set());
  const activeIdRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c._id === activeId) || null;

  function otherParticipant(c: Conversation | null): Participant | undefined {
    if (!c) return undefined;
    return c.participants.find((p) => p._id !== user?._id);
  }

  function loadConversations() {
    return api.get("/mentor/conversations").then((res) => {
      const peerOnly = res.data.conversations.filter((c: Conversation) => c.type === "peer");
      setConversations(peerOnly);
    });
  }

  function loadBlocked() {
    return api.get("/users/blocked").then((res) => setBlockedIds(new Set(res.data.blocked.map((u: any) => u._id))));
  }

  async function toggleBlock() {
    const other = otherParticipant(activeConversation);
    if (!other) return;
    if (blockedIds.has(other._id)) {
      await api.post(`/users/${other._id}/unblock`);
    } else {
      await api.post(`/users/${other._id}/block`);
    }
    loadBlocked();
  }

  async function reportUser() {
    const other = otherParticipant(activeConversation);
    if (!other) return;
    const reason = window.prompt("What's happening in this conversation? A short reason helps moderators.");
    if (reason === null) return;
    await api.post("/posts/report", { targetType: "user", targetId: other._id, reason: reason || "Reported from chat" });
    setReported((prev) => new Set(prev).add(other._id));
  }

  useEffect(() => {
    activeIdRef.current = activeId;
    setChatError("");
  }, [activeId]);

  useEffect(() => {
    loadConversations().then(() => {
      const incomingId = (location.state as any)?.conversationId;
      if (incomingId) setActiveId(incomingId);
    });
    loadBlocked();

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token: localStorage.getItem("equilibrium_token") },
    });
    socketRef.current = socket;

    socket.on("new_message", (msg: Message) => {
      if (msg.conversation === activeIdRef.current) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("chat_error", (payload: { message: string }) => {
      setChatError(payload.message);
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
    setChatError("");
    socketRef.current?.emit("send_message", { conversationId: activeId, content: draft });
    setDraft("");
  }

  const otherInActive = otherParticipant(activeConversation);
  const iBlockedThem = otherInActive ? blockedIds.has(otherInActive._id) : false;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-4" style={{ minHeight: "70vh" }}>
      <div className="card p-4 md:col-span-1">
        <h2 className="font-medium mb-3">Messages</h2>
        <div className="space-y-2">
          {conversations.map((c) => {
            const other = otherParticipant(c);
            return (
              <button
                key={c._id}
                onClick={() => setActiveId(c._id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeId === c._id ? "bg-equilibrium-soft text-equilibrium-blue" : "hover:bg-black/5"}`}
              >
                {other?.anonymousUsername || "Unknown"}
              </button>
            );
          })}
          {conversations.length === 0 && (
            <p className="text-sm text-gray-400">
              No conversations yet — click "Message" on someone's post in the Community feed to start one.
            </p>
          )}
        </div>
      </div>

      <div className="card p-4 md:col-span-2 flex flex-col">
        {otherInActive && (
          <div className="flex items-center justify-between border-b border-black/5 pb-2 mb-2">
            <span className="text-sm font-medium">{otherInActive.anonymousUsername}</span>
            <div className="flex gap-2">
              <button onClick={toggleBlock} className="text-xs text-gray-500 hover:text-red-600">
                {iBlockedThem ? "Unblock" : "Block"}
              </button>
              <button
                onClick={reportUser}
                disabled={reported.has(otherInActive._id)}
                className="text-xs text-gray-500 hover:text-red-600 disabled:opacity-50"
              >
                {reported.has(otherInActive._id) ? "Reported" : "Report"}
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 mb-3" style={{ maxHeight: "50vh" }}>
          {messages.map((m) => (
            <div key={m._id} className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.sender === user?._id ? "bg-equilibrium-blue text-white ml-auto" : "bg-black/5"}`}>
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {chatError && <p className="text-xs text-red-500 mb-2">{chatError}</p>}

        {activeId ? (
          iBlockedThem ? (
            <p className="text-sm text-gray-400 text-center py-4">
              You've blocked this person. Unblock them above to send messages again.
            </p>
          ) : (
            <form onSubmit={send} className="flex gap-2">
              <input className="input" placeholder="Type a message..." value={draft} onChange={(e) => setDraft(e.target.value)} />
              <button className="btn-primary">Send</button>
            </form>
          )
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">Select a conversation to start chatting.</p>
        )}
      </div>
    </div>
  );
}