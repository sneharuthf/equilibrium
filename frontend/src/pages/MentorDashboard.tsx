import { useEffect, useState } from "react";
import { api } from "../api/axios";

interface Assignment {
  _id: string;
  user: { _id: string; anonymousUsername: string; mentalHealthScore: number; isFlaggedUrgent: boolean };
}

interface Alert {
  _id: string;
  user: { anonymousUsername: string };
  severity: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function MentorDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  async function load() {
    const [a, al] = await Promise.all([api.get("/mentor/assigned"), api.get("/mentor/alerts")]);
    setAssignments(a.data.assignments);
    setAlerts(al.data.alerts);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateAlert(id: string, status: string) {
    await api.patch(`/mentor/alerts/${id}`, { status });
    load();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Mentor Dashboard</h1>

      {alerts.length > 0 && (
        <div className="card p-5 mb-6 border-2 border-red-200">
          <h2 className="font-medium text-red-700 mb-3">Active alerts ({alerts.length})</h2>
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a._id} className="border-b border-black/5 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{a.user.anonymousUsername}</span>
                  <span className="text-xs uppercase text-red-600">{a.severity}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{a.reason}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateAlert(a._id, "acknowledged")} className="btn-secondary text-xs">Acknowledge</button>
                  <button onClick={() => updateAlert(a._id, "resolved")} className="btn-secondary text-xs">Resolve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-medium mb-3">Your assigned users</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {assignments.map((a) => (
            <div key={a._id} className="border border-black/5 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{a.user.anonymousUsername}</p>
                <p className="text-xs text-gray-400">Score: {a.user.mentalHealthScore}</p>
              </div>
              {a.user.isFlaggedUrgent && <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">urgent</span>}
            </div>
          ))}
          {assignments.length === 0 && <p className="text-sm text-gray-400">No users assigned yet.</p>}
        </div>
      </div>
    </div>
  );
}
