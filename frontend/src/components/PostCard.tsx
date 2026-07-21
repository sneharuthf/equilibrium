import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Post } from "../types";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likesCount);
  const [liked, setLiked] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState("");

  const isOwnPost = user?._id === post.author?._id;

  async function toggleLike() {
    const res = await api.post(`/posts/${post._id}/like`);
    setLiked(res.data.liked);
    setLikes((l) => (res.data.liked ? l + 1 : l - 1));
  }

  async function messageAuthor() {
    setError("");
    setMessaging(true);
    try {
      const res = await api.post("/mentor/conversations/peer", { otherUserId: post.author._id });
      navigate("/messages", { state: { conversationId: res.data.conversation._id } });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't start a chat with this person.");
    } finally {
      setMessaging(false);
    }
  }

  async function reportPost() {
    const reason = window.prompt("What's wrong with this post? (a short reason helps moderators)");
    if (reason === null) return;
    await api.post("/posts/report", { targetType: "post", targetId: post._id, reason: reason || "Reported by user" });
    setReported(true);
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-equilibrium-blue">{post.author?.anonymousUsername}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-equilibrium-soft text-equilibrium-blue">{post.category}</span>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
      {post.imageUrl && <img src={post.imageUrl} className="mt-3 rounded-lg max-h-72 object-cover" />}
      <div className="flex gap-2 mt-3 flex-wrap">
        {post.tags?.map((t) => (
          <span key={t} className="text-xs text-gray-400">#{t}</span>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
        <button onClick={toggleLike} className={liked ? "text-equilibrium-purple font-medium" : ""}>
          ♥ {likes}
        </button>
        <span>💬 {post.commentsCount}</span>
        {!isOwnPost && (
          <button onClick={messageAuthor} disabled={messaging} className="text-xs text-equilibrium-blue hover:underline disabled:opacity-50">
            {messaging ? "Starting..." : "Message"}
          </button>
        )}
        {!isOwnPost && !reported && (
          <button onClick={reportPost} className="text-xs text-gray-400 hover:text-red-500">
            Report
          </button>
        )}
        {reported && <span className="text-xs text-gray-400">Reported</span>}
        <span className="ml-auto text-xs">{new Date(post.createdAt).toLocaleString()}</span>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}