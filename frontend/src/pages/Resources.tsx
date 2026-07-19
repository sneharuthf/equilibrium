import { useEffect, useState } from "react";
import { api } from "../api/axios";

interface Resource {
  _id: string;
  title: string;
  type: string;
  category: string;
  tags: string[];
}

const TYPES = ["article", "video", "meditation", "yoga", "breathing", "sleep", "stress", "professional"];

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [type, setType] = useState("");

  useEffect(() => {
    api.get("/resources", { params: type ? { type } : {} }).then((res) => setResources(res.data.resources));
  }, [type]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Resource Library</h1>
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setType("")} className={`text-xs px-3 py-1 rounded-full ${!type ? "bg-equilibrium-blue text-white" : "bg-equilibrium-soft text-equilibrium-blue"}`}>All</button>
        {TYPES.map((t) => (
          <button key={t} onClick={() => setType(t)} className={`text-xs px-3 py-1 rounded-full capitalize ${type === t ? "bg-equilibrium-blue text-white" : "bg-equilibrium-soft text-equilibrium-blue"}`}>{t}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {resources.map((r) => (
          <div key={r._id} className="card p-5">
            <span className="text-xs text-equilibrium-purple uppercase">{r.type}</span>
            <h3 className="font-medium mt-1">{r.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{r.category}</p>
          </div>
        ))}
        {resources.length === 0 && <p className="text-gray-400 col-span-2 text-center py-10">No resources found.</p>}
      </div>
    </div>
  );
}
