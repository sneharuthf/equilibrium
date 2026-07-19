import { useEffect, useState } from "react";
import { api } from "../api/axios";

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  emotionTags: string[];
  createdAt: string;
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    const res = await api.get("/journal", { params: search ? { q: search } : {} });
    setEntries(res.data.entries);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await api.post("/journal", { title, content });
    setTitle("");
    setContent("");
    load();
  }

  async function remove(id: string) {
    await api.delete(`/journal/${id}`);
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">Journal</h1>
      <p className="text-gray-500 mb-6">Private. Only you can see this.</p>

      <form onSubmit={submit} className="card p-5 mb-6 space-y-3">
        <input className="input" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input min-h-[120px]" placeholder="Write freely..." value={content} onChange={(e) => setContent(e.target.value)} />
        <button className="btn-primary">Save entry</button>
      </form>

      <input className="input mb-4" placeholder="Search your journal..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="space-y-4">
        {entries.map((e) => (
          <div key={e._id} className="card p-5">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{e.title || "Untitled"}</h3>
              <button onClick={() => remove(e._id)} className="text-xs text-gray-400 hover:text-red-500">Delete</button>
            </div>
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{e.content}</p>
            <p className="text-xs text-gray-400 mt-3">{new Date(e.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {entries.length === 0 && <p className="text-center text-gray-400 py-10">No entries yet.</p>}
      </div>
    </div>
  );
}
