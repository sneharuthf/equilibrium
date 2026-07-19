import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MoodLog } from "../types";
import CrisisResourcesCard from "../components/CrisisResourcesCard";

export default function Dashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<MoodLog[]>([]);

  useEffect(() => {
    api.get("/mood/history?days=14").then((res) => setLogs(res.data.logs));
  }, []);

  const chartData = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    mood: l.mood,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">Welcome back, {user?.anonymousUsername}</h1>
      <p className="text-gray-500 mb-6">Here's how things have been looking.</p>

      {user?.isFlaggedUrgent && (
        <div className="mb-6">
          <CrisisResourcesCard />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-sm text-gray-400">Mental health score</p>
          <p className="text-3xl font-semibold text-equilibrium-blue">{user?.mentalHealthScore ?? "--"}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-400">Check-in streak</p>
          <p className="text-3xl font-semibold text-equilibrium-purple">{user?.streakDays ?? 0} days</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-400">Assigned mentor</p>
          <p className="text-lg font-medium mt-2">{user?.assignedMentor ? "Assigned" : "Not yet assigned"}</p>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <p className="text-sm text-gray-400 mb-2">Mood — last 14 days</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" fontSize={12} />
            <YAxis domain={[1, 5]} fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="mood" stroke="#8B7CF6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/mood" className="card p-5 hover:shadow-md transition">
          <h3 className="font-medium mb-1">Log today's mood</h3>
          <p className="text-sm text-gray-400">Mood, sleep, stress, energy — takes under a minute.</p>
        </Link>
        <Link to="/feed" className="card p-5 hover:shadow-md transition">
          <h3 className="font-medium mb-1">Share how you're feeling</h3>
          <p className="text-sm text-gray-400">Post anonymously to the community.</p>
        </Link>
        <Link to="/journal" className="card p-5 hover:shadow-md transition">
          <h3 className="font-medium mb-1">Private journal</h3>
          <p className="text-sm text-gray-400">Only visible to you.</p>
        </Link>
        <Link to="/resources" className="card p-5 hover:shadow-md transition">
          <h3 className="font-medium mb-1">Resource library</h3>
          <p className="text-sm text-gray-400">Breathing, grounding, sleep, and more.</p>
        </Link>
      </div>
    </div>
  );
}
