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
  recommendedTherapist?: string | null;
}

interface Mentor {
  _id: string;
  anonymousUsername: string;
  email?: string;
  isActive?: boolean;
  mentorProfile?: { bio: string; specialties: string[] };
}

interface Therapist {
  _id: string;
  name: string;
  clinicName: string;
  specialization: string[];
  contactEmail: string;
  contactPhone: string;
}

const COLORS = ["#5B7FDE", "#8B7CF6", "#F59E0B", "#EF4444", "#10B981", "#6B7280"];

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [distribution, setDistribution] = useState<{ _id: string; count: number }[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Record<string, string>>({});
  const [selectedTherapist, setSelectedTherapist] = useState<Record<string, string>>({});
  const [assignMsg, setAssignMsg] = useState<string>("");

  const [newMentor, setNewMentor] = useState({
    email: "",
    anonymousUsername: "",
    password: "",
    bio: "",
    specialties: "",
  });
  const [savingMentor, setSavingMentor] = useState(false);
  const [mentorError, setMentorError] = useState("");

  const [newTherapist, setNewTherapist] = useState({
    name: "",
    clinicName: "",
    specialization: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [savingTherapist, setSavingTherapist] = useState(false);

  async function load() {
    const [o, d, r, u, m, t] = await Promise.all([
      api.get("/admin/overview"),
      api.get("/admin/emotion-distribution"),
      api.get("/admin/reports"),
      api.get("/admin/users", { params: { role: "user" } }),
      api.get("/admin/users", { params: { role: "mentor" } }),
      api.get("/admin/therapists"),
    ]);
    setOverview(o.data);
    setDistribution(d.data.distribution);
    setReports(r.data.reports);
    setUsers(u.data.users);
    setMentors(m.data.users);
    setTherapists(t.data.therapists);
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

  async function recommendTherapist(userId: string) {
    const therapistId = selectedTherapist[userId];
    if (!therapistId) {
      setAssignMsg("Pick a therapist from the dropdown first.");
      return;
    }
    await api.post("/admin/recommend-therapist", { userId, therapistId });
    setAssignMsg("Therapist recommended.");
    load();
  }

  async function addTherapist(e: React.FormEvent) {
    e.preventDefault();
    if (!newTherapist.name.trim()) return;
    setSavingTherapist(true);
    try {
      await api.post("/admin/therapists", {
        name: newTherapist.name,
        clinicName: newTherapist.clinicName,
        specialization: newTherapist.specialization
          ? newTherapist.specialization.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        contactEmail: newTherapist.contactEmail,
        contactPhone: newTherapist.contactPhone,
      });
      setNewTherapist({ name: "", clinicName: "", specialization: "", contactEmail: "", contactPhone: "" });
      load();
    } finally {
      setSavingTherapist(false);
    }
  }

  async function addMentor(e: React.FormEvent) {
    e.preventDefault();
    setMentorError("");
    if (!newMentor.email.trim() || !newMentor.anonymousUsername.trim() || !newMentor.password.trim()) {
      setMentorError("Email, username, and password are all required.");
      return;
    }
    setSavingMentor(true);
    try {
      await api.post("/admin/mentors", {
        email: newMentor.email,
        anonymousUsername: newMentor.anonymousUsername,
        password: newMentor.password,
        bio: newMentor.bio,
        specialties: newMentor.specialties
          ? newMentor.specialties.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      });
      setNewMentor({ email: "", anonymousUsername: "", password: "", bio: "", specialties: "" });
      load();
    } catch (err: any) {
      setMentorError(err?.response?.data?.message || "Couldn't add that mentor.");
    } finally {
      setSavingMentor(false);
    }
  }

  async function toggleMentorActive(id: string, isActive: boolean) {
    await api.patch(`/admin/users/${id}/active`, { isActive: !isActive });
    load();
  }

  async function removeTherapist(id: string) {
    await api.delete(`/admin/therapists/${id}`);
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

      {assignMsg && <div className="card p-3 mb-4 text-sm text-green-600">{assignMsg}</div>}

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

      <div className="card p-5 mb-6">
        <p className="text-sm text-gray-400 mb-3">Users, mentor assignment &amp; therapist referral</p>
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u._id} className="flex flex-wrap items-center gap-3 border-b border-black/5 pb-3 last:border-0">
              <div className="min-w-[200px]">
                <p className="text-sm font-medium">{u.anonymousUsername}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
                <p className="text-xs text-gray-400">Score: {u.mentalHealthScore}</p>
              </div>
              {u.isFlaggedUrgent && <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">urgent</span>}

              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">{u.assignedMentor ? "Mentor assigned" : "No mentor yet"}</span>
                <div className="flex gap-2">
                  <select
                    className="input w-auto text-xs"
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
              </div>

              <div className="flex flex-col gap-1 ml-auto">
                <span className="text-xs text-gray-400">{u.recommendedTherapist ? "Therapist recommended" : "No referral yet"}</span>
                <div className="flex gap-2">
                  <select
                    className="input w-auto text-xs"
                    value={selectedTherapist[u._id] || ""}
                    onChange={(e) => setSelectedTherapist((prev) => ({ ...prev, [u._id]: e.target.value }))}
                  >
                    <option value="">Select therapist...</option>
                    {therapists.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  <button onClick={() => recommendTherapist(u._id)} className="btn-secondary text-xs">Recommend</button>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm text-gray-400">No users yet.</p>}
        </div>
      </div>

      <div className="card p-5 mb-6">
        <p className="text-sm text-gray-400 mb-3">Mentor directory</p>

        <form onSubmit={addMentor} className="grid md:grid-cols-2 gap-2 mb-4 border-b border-black/5 pb-4">
          <input className="input" placeholder="Email" value={newMentor.email} onChange={(e) => setNewMentor((p) => ({ ...p, email: e.target.value }))} />
          <input className="input" placeholder="Anonymous username" value={newMentor.anonymousUsername} onChange={(e) => setNewMentor((p) => ({ ...p, anonymousUsername: e.target.value }))} />
          <input className="input" type="password" placeholder="Temporary password" value={newMentor.password} onChange={(e) => setNewMentor((p) => ({ ...p, password: e.target.value }))} />
          <input className="input" placeholder="Specialties (comma-separated)" value={newMentor.specialties} onChange={(e) => setNewMentor((p) => ({ ...p, specialties: e.target.value }))} />
          <input className="input md:col-span-2" placeholder="Short bio" value={newMentor.bio} onChange={(e) => setNewMentor((p) => ({ ...p, bio: e.target.value }))} />
          {mentorError && <p className="text-xs text-red-500 md:col-span-2">{mentorError}</p>}
          <button className="btn-primary md:col-span-2" disabled={savingMentor}>{savingMentor ? "Adding..." : "Add mentor"}</button>
        </form>

        <div className="space-y-2">
          {mentors.map((m) => (
            <div key={m._id} className="flex justify-between items-center border-b border-black/5 pb-2 last:border-0">
              <div>
                <p className="text-sm font-medium">
                  {m.anonymousUsername}
                  {m.isActive === false && <span className="text-xs text-gray-400 ml-2">(deactivated)</span>}
                </p>
                <p className="text-xs text-gray-400">{m.email}</p>
                {m.mentorProfile?.bio && <p className="text-xs text-gray-400 mt-0.5">{m.mentorProfile.bio}</p>}
                {m.mentorProfile?.specialties && m.mentorProfile.specialties.length > 0 && (
                  <p className="text-xs text-gray-400">{m.mentorProfile.specialties.join(", ")}</p>
                )}
              </div>
              <button onClick={() => toggleMentorActive(m._id, m.isActive !== false)} className="text-xs text-red-500">
                {m.isActive === false ? "Reactivate" : "Deactivate"}
              </button>
            </div>
          ))}
          {mentors.length === 0 && <p className="text-sm text-gray-400">No mentors added yet.</p>}
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm text-gray-400 mb-3">Therapist / professional directory</p>

        <form onSubmit={addTherapist} className="grid md:grid-cols-2 gap-2 mb-4 border-b border-black/5 pb-4">
          <input className="input" placeholder="Name" value={newTherapist.name} onChange={(e) => setNewTherapist((p) => ({ ...p, name: e.target.value }))} />
          <input className="input" placeholder="Clinic name" value={newTherapist.clinicName} onChange={(e) => setNewTherapist((p) => ({ ...p, clinicName: e.target.value }))} />
          <input className="input" placeholder="Specialization (comma-separated)" value={newTherapist.specialization} onChange={(e) => setNewTherapist((p) => ({ ...p, specialization: e.target.value }))} />
          <input className="input" placeholder="Contact email" value={newTherapist.contactEmail} onChange={(e) => setNewTherapist((p) => ({ ...p, contactEmail: e.target.value }))} />
          <input className="input" placeholder="Contact phone" value={newTherapist.contactPhone} onChange={(e) => setNewTherapist((p) => ({ ...p, contactPhone: e.target.value }))} />
          <button className="btn-primary" disabled={savingTherapist}>{savingTherapist ? "Adding..." : "Add to directory"}</button>
        </form>

        <div className="space-y-2">
          {therapists.map((t) => (
            <div key={t._id} className="flex justify-between items-center border-b border-black/5 pb-2 last:border-0">
              <div>
                <p className="text-sm font-medium">{t.name} {t.clinicName && <span className="text-xs text-gray-400">— {t.clinicName}</span>}</p>
                <p className="text-xs text-gray-400">
                  {t.specialization?.join(", ")} {t.contactEmail && `· ${t.contactEmail}`} {t.contactPhone && `· ${t.contactPhone}`}
                </p>
              </div>
              <button onClick={() => removeTherapist(t._id)} className="text-xs text-red-500">Remove</button>
            </div>
          ))}
          {therapists.length === 0 && <p className="text-sm text-gray-400">No therapists added yet.</p>}
        </div>
      </div>
    </div>
  );
}