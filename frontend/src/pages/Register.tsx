import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SUGGESTIONS = ["SilentSoul45", "MoonWalker", "HiddenMind", "QuietHarbor", "CalmRiver12"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [anonymousUsername, setAnonymousUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, anonymousUsername);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-semibold mb-2 text-center">Join anonymously</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Your email is only used for login — it's never shown publicly.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password (min 8 characters)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input className="input" placeholder="Choose an anonymous username" value={anonymousUsername} onChange={(e) => setAnonymousUsername(e.target.value)} required />
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button type="button" key={s} onClick={() => setAnonymousUsername(s)} className="text-xs px-2 py-1 rounded-full bg-equilibrium-soft text-equilibrium-blue">
                {s}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        </form>
        <div className="text-sm mt-4 text-center text-gray-500">
          Already have an account? <Link to="/login" className="text-equilibrium-blue">Log in</Link>
        </div>
      </div>
    </div>
  );
}
