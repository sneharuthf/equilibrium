import { useState } from "react";
import { api } from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await api.post("/auth/forgot-password", { email });
    setMessage(res.data.message);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Reset your password</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn-primary w-full">Send reset link</button>
        </form>
        {message && <p className="text-sm text-gray-500 mt-4">{message}</p>}
      </div>
    </div>
  );
}
