import { useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CrisisResourcesCard from "./CrisisResourcesCard";

export default function SOSButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  if (!user || user.role !== "user") return null;

  async function confirmSOS() {
    setSending(true);
    try {
      await api.post("/sos", { note });
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  function close() {
    setOpen(false);
    setSent(false);
    setNote("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full w-16 h-16 shadow-lg flex items-center justify-center text-sm"
        title="Get immediate help"
      >
        SOS
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl2 max-w-md w-full p-6">
            {!sent ? (
              <>
                <h2 className="text-lg font-semibold text-red-700 mb-2">Need help right now?</h2>
                <p className="text-sm text-gray-600 mb-3">
                  Pressing confirm will immediately alert your mentor (or an available mentor if you
                  don't have one yet) that you need urgent support.
                </p>
                <textarea
                  className="input mb-3"
                  placeholder="Optional: say a little about what's happening"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <button className="btn-secondary flex-1" onClick={close}>Cancel</button>
                  <button
                    className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-2 disabled:opacity-50"
                    onClick={confirmSOS}
                    disabled={sending}
                  >
                    {sending ? "Sending..." : "Confirm — alert a mentor now"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-green-700 mb-3">A mentor has been notified</h2>
                <CrisisResourcesCard />
                <button className="btn-secondary w-full mt-4" onClick={close}>Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}