import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../api/axios";

interface Overview {
  totalUsers: number;
  dailyActiveUsers: number;
  postsToday: number;
  highRiskUsers: number;
  pendingReports: number;
  mentorCount: number;
  averageMoodScore: number | null;
}

interface Report {
  _id: string;
  reporter: { anonymousUsername: string };
  targetType: string;
  reason: string;
}

interface PlatformUser {
  _id: string;
  anonymousUsername: string;
  email: string;
  role: string;
  mentalHealthScore: number;
  isFlaggedUrgent: boolean;
  assignedMentor?: string | null;
}

const COLORS = ["#5B7FDE", "#8B7CF6", "#F59E0B", "#EF4444", "#10B981", "#6B7280"];

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [distribution, setDistribution] = useState<{ _id: string; count: number }[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [mentors, setMentors] = useState<PlatformUser[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Record<string, string>>({});
  const [assignMsg, setAssignMsg] = useState<string>("");

  async function load() {
    const [o, d, r, u, m] = await Promise.all([
      api.get("/admin/overview"),
      api.get("/admin/emotion-distribution"),
      api.get("/admin/reports"),
      api.get("/admin/users", { params: { role: "user" } }),
      api.get("/admin/users", { params: { role: "mentor" } }),
    ]);
    setOverview(o.data);
    setDistribution(d.data.distribution);
    setReports(r.data.reports);
    setUsers(u.data.users);
    setMentors(m.data.users);
  }

  async function assignMentor(userId: string) {
    const mentorId = selectedMentor[userId];
    if (!mentorId) {
      setAssignMsg("Pick a mentor from the dropdown first.");
      return;
    }
    await api.post("/admin/assign-mentor", { userId, mentorId });
    setAssignMsg("Mentor assigned.");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  async function resolveReport(id: string, status: string, removeContent = false) {
    await api.patch(`/admin/reports/${id}`, { status, removeContent });
    load();
  }

  if (!overview) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  const stats = [
    { label: "Total users", value: overview.totalUsers },
    { label: "Daily active users", value: overview.dailyActiveUsers },
    { label: "Posts today", value: overview.postsToday },
    { label: "High-risk users", value: overview.highRiskUsers },
    { label: "Pending reports", value: overview.pendingReports },
    { label: "Mentors", value: overview.mentorCount },
    { label: "Avg mood score", value: overview.averageMoodScore ?? "--" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-xl font-semibold text-equilibrium-blue">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-sm text-gray-400 mb-2">Emotion distribution (30 days)</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distribution} dataKey="count" nameKey="_id" outerRadius={80} label>
                {distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="text-sm text-gray-400 mb-3">Pending reports</p>
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r._id} className="border-b border-black/5 pb-2 last:border-0">
                <p className="text-sm">
                  <strong>{r.reporter.anonymousUsername}</strong> reported a {r.targetType}
                </p>
                <p className="text-xs text-gray-400">{r.reason}</p>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => resolveReport(r._id, "reviewed", true)} className="text-xs text-red-600">
                    {r.targetType === "user" ? "Deactivate account" : "Remove content"}
                  </button>
                  <button onClick={() => resolveReport(r._id, "dismissed")} className="text-xs text-gray-400">Dismiss</button>
                </div>
              </div>
            ))}
            {reports.length === 0 && <p className="text-sm text-gray-400">No pending reports.</p>}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">Users &amp; mentor assignment</p>
          {assignMsg && <span className="text-xs text-green-600">{assignMsg}</span>}
        </div>
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u._id} className="flex flex-wrap items-center gap-3 border-b border-black/5 pb-3 last:border-0">
              <div className="min-w-[200px]">
                <p className="text-sm font-medium">{u.anonymousUsername}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
                <p className="text-xs text-gray-400">Score: {u.mentalHealthScore}</p>
              </div>
              {u.isFlaggedUrgent && <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">urgent</span>}
              <span className="text-xs text-gray-400">
                {u.assignedMentor ? "Mentor assigned" : "No mentor yet"}
              </span>
              <select
                className="input w-auto ml-auto"
                value={selectedMentor[u._id] || ""}
                onChange={(e) => setSelectedMentor((prev) => ({ ...prev, [u._id]: e.target.value }))}
              >
                <option value="">Select mentor...</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>{m.anonymousUsername}</option>
                ))}
              </select>
              <button onClick={() => assignMentor(u._id)} className="btn-secondary text-xs">Assign</button>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm text-gray-400">No users yet.</p>}
        </div>
      </div>
    </div>
  );
}