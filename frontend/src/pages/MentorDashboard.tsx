import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

interface Assignment {
  _id: string;
  user: { _id: string; anonymousUsername: string; mentalHealthScore: number; isFlaggedUrgent: boolean };
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface Alert {
  _id: string;
  user: { _id: string; anonymousUsername: string; emergencyContact?: EmergencyContact };
  severity: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const [a, al] = await Promise.all([api.get("/mentor/assigned"), api.get("/mentor/alerts")]);
    setAssignments(a.data.assignments);
    setAlerts(al.data.alerts);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateAlert(id: string, status: string, userId?: string) {
    setError("");
    setUpdatingId(id);
    try {
      const res = await api.patch(`/mentor/alerts/${id}`, { status });
      if (!res.data.alert) {
        setError("That alert isn't assigned to you, so it couldn't be updated.");
        return;
      }
      if (status === "resolved") {
        setAlerts((prev) => prev.filter((a) => a._id !== id));
      } else {
        setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
      }

      if (status === "acknowledged" && userId) {
        const convoRes = await api.post("/mentor/conversations/with-user", { userId });
        navigate("/chat", { state: { conversationId: convoRes.data.conversation._id } });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't update that alert. Try refreshing the page.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Mentor Dashboard</h1>

      {error && <div className="card p-3 mb-4 border border-red-200 text-sm text-red-600">{error}</div>}

      {alerts.length > 0 && (
        <div className="card p-5 mb-6 border-2 border-red-200">
          <h2 className="font-medium text-red-700 mb-3">Active alerts ({alerts.length})</h2>
          <div className="space-y-3">
            {alerts.map((a) => {
              const ec = a.user.emergencyContact;
              const hasContact = ec && (ec.name || ec.phone || ec.email);
              return (
                <div key={a._id} className="border-b border-black/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{a.user.anonymousUsername}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{a.status}</span>
                      <span className="text-xs uppercase text-red-600">{a.severity}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{a.reason}</p>

                  {hasContact ? (
                    <div className="text-xs bg-red-50 border border-red-100 rounded-lg p-2 mt-2">
                      <p className="font-medium text-red-700 mb-0.5">Trusted contact on file — for genuine emergencies only</p>
                      <p>{ec!.name} {ec!.relationship && `(${ec!.relationship})`}</p>
                      {ec!.phone && <p>📞 {ec!.phone}</p>}
                      {ec!.email && <p>✉️ {ec!.email}</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">No emergency contact on file for this user.</p>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateAlert(a._id, "acknowledged", a.user._id)}
                      className="btn-secondary text-xs disabled:opacity-50"
                      disabled={updatingId === a._id}
                    >
                      {updatingId === a._id ? "..." : a.status === "acknowledged" ? "Acknowledged — open chat" : "Acknowledge & chat"}
                    </button>
                    <button
                      onClick={() => updateAlert(a._id, "resolved")}
                      className="btn-secondary text-xs disabled:opacity-50"
                      disabled={updatingId === a._id}
                    >
                      {updatingId === a._id ? "..." : "Resolve"}
                    </button>
                  </div>
                </div>
              );
            })}
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