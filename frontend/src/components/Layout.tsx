import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SOSButton from "./SOSButton";

const linksByRole: Record<string, { to: string; label: string }[]> = {
  user: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/feed", label: "Community" },
    { to: "/mood", label: "Mood Tracker" },
    { to: "/journal", label: "Journal" },
    { to: "/chat", label: "Mentor Chat" },
    { to: "/resources", label: "Resources" },
    { to: "/settings", label: "Settings" },
  ],
  mentor: [
    { to: "/mentor", label: "Mentor Dashboard" },
    { to: "/chat", label: "Conversations" },
    { to: "/resources", label: "Resources" },
  ],
  admin: [{ to: "/admin", label: "Admin Dashboard" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user ? linksByRole[user.role] || [] : [];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-black/5 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg bg-gradient-to-r from-equilibrium-blue to-equilibrium-purple bg-clip-text text-transparent">
            Equilibrium
          </Link>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-equilibrium-blue transition">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-500 hidden sm:inline">{user.anonymousUsername}</span>
                <button
                  className="btn-secondary text-sm"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Log in</Link>
                <Link to="/register" className="btn-primary text-sm">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SOSButton />
      <footer className="border-t border-black/5 py-6 text-center text-xs text-gray-400">
        <div className="flex justify-center gap-4 mb-2">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/contact">Contact</Link>
        </div>
        Equilibrium is a peer-support demo platform and does not replace professional mental health care.
      </footer>
    </div>
  );
}
