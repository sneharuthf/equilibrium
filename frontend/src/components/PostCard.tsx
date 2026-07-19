import { useState } from "react";
import { Post } from "../types";
import { api } from "../api/axios";

export default function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likesCount);
  const [liked, setLiked] = useState(false);

  async function toggleLike() {
    const res = await api.post(`/posts/${post._id}/like`);
    setLiked(res.data.liked);
    setLikes((l) => (res.data.liked ? l + 1 : l - 1));
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
        <span className="ml-auto text-xs">{new Date(post.createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
}
