import { useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.emergencyContact?.name || "");
  const [relationship, setRelationship] = useState(user?.emergencyContact?.relationship || "");
  const [phone, setPhone] = useState(user?.emergencyContact?.phone || "");
  const [email, setEmail] = useState(user?.emergencyContact?.email || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveContact(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.patch("/auth/me", { emergencyContact: { name, relationship, phone, email } });
      await refreshUser();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="card p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-400">Anonymous username</p>
          <p className="font-medium">{user?.anonymousUsername}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Role</p>
          <p className="font-medium capitalize">{user?.role}</p>
        </div>
      </div>

      {user?.role === "user" && (
        <div className="card p-6">
          <h2 className="font-medium mb-1">Trusted emergency contact</h2>
          <p className="text-sm text-gray-500 mb-4">
            Optional. If your mentor believes you're in serious danger, this is who they'd try to reach on
            your behalf. Only your mentor and admins can see this — it's never shown publicly.
          </p>
          <form onSubmit={saveContact} className="space-y-3">
            <input className="input" placeholder="Their name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="Relationship (e.g. mother, sibling, close friend)" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
            <input className="input" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="input" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn-primary w-full" disabled={saving}>{saving ? "Saving..." : "Save emergency contact"}</button>
            {saved && <p className="text-sm text-green-600 text-center">Saved.</p>}
          </form>
        </div>
      )}

      {user?.role === "user" && user?.recommendedTherapist && (
        <div className="card p-6 border-2 border-equilibrium-blue/30">
          <h2 className="font-medium mb-1">Recommended professional</h2>
          <p className="text-sm text-gray-500 mb-3">
            Your mentor thinks it could help to talk to a licensed professional. This is optional — no
            pressure, just an option if you want it.
          </p>
          <p className="font-medium">{user.recommendedTherapist.name}</p>
          {user.recommendedTherapist.clinicName && (
            <p className="text-sm text-gray-500">{user.recommendedTherapist.clinicName}</p>
          )}
          {user.recommendedTherapist.specialization?.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">{user.recommendedTherapist.specialization.join(", ")}</p>
          )}
          <div className="text-sm mt-2 space-y-1">
            {user.recommendedTherapist.contactPhone && <p>📞 {user.recommendedTherapist.contactPhone}</p>}
            {user.recommendedTherapist.contactEmail && <p>✉️ {user.recommendedTherapist.contactEmail}</p>}
          </div>
        </div>
      )}
    </div>
  );
}