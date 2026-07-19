import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Post, AIAnalysis } from "../types";
import PostCard from "../components/PostCard";
import RiskBadge from "../components/RiskBadge";
import CrisisResourcesCard from "../components/CrisisResourcesCard";

const CATEGORIES = [
  "Stress", "Anxiety", "Depression", "Relationships", "Family", "Career",
  "Loneliness", "Overthinking", "Self-esteem", "Academic pressure", "Burnout", "Other",
];

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Stress");
  const [posting, setPosting] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysis | null>(null);
  const [filter, setFilter] = useState("");

  async function loadFeed() {
    const res = await api.get("/posts", { params: filter ? { category: filter } : {} });
    setPosts(res.data.posts);
  }

  useEffect(() => {
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setLastAnalysis(null);
    try {
      const res = await api.post("/posts", { content, category });
      setLastAnalysis(res.data.analysis);
      setContent("");
      loadFeed();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Community</h1>

      <form onSubmit={submitPost} className="card p-5 mb-4">
        <textarea
          className="input min-h-[100px]"
          placeholder="What's on your mind? This is a safe, anonymous space."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between mt-3">
          <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button className="btn-primary" disabled={posting}>{posting ? "Posting..." : "Post anonymously"}</button>
        </div>
      </form>

      {lastAnalysis && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">AI insight on your last post</p>
            <RiskBadge level={lastAnalysis.riskLevel} />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Detected emotion: <strong>{lastAnalysis.emotion}</strong> ({lastAnalysis.confidence}% confidence)
          </p>
          <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
            {lastAnalysis.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          {(lastAnalysis.riskLevel === "high" || lastAnalysis.riskLevel === "critical") && (
            <div className="mt-4">
              <CrisisResourcesCard />
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={() => setFilter("")} className={`text-xs px-3 py-1 rounded-full ${!filter ? "bg-equilibrium-blue text-white" : "bg-equilibrium-soft text-equilibrium-blue"}`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`text-xs px-3 py-1 rounded-full ${filter === c ? "bg-equilibrium-blue text-white" : "bg-equilibrium-soft text-equilibrium-blue"}`}>{c}</button>
        ))}
      </div>

      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p._id} post={p} />
        ))}
        {posts.length === 0 && <p className="text-center text-gray-400 py-10">No posts yet — be the first to share.</p>}
      </div>
    </div>
  );
}
