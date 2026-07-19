import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="card p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-400">Anonymous username</p>
          <p className="font-medium">{user?.anonymousUsername}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Role</p>
          <p className="font-medium capitalize">{user?.role}</p>
        </div>
        <p className="text-xs text-gray-400 pt-4 border-t border-black/5">
          Full profile editing, notification preferences, and dark mode toggle can be wired up here.
        </p>
      </div>
    </div>
  );
}
