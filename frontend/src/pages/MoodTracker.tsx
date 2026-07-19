import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../api/axios";
import { MoodLog } from "../types";

const MOODS = [
  { value: 1, emoji: "😞", label: "Very low" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

export default function MoodTracker() {
  const [mood, setMood] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [sleepHours, setSleepHours] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [logs, setLogs] = useState<MoodLog[]>([]);

  async function load() {
    const res = await api.get("/mood/history?days=30");
    setLogs(res.data.logs);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/mood", { mood, stressLevel, sleepHours, energy, exerciseMinutes, note });
    setSaved(true);
    load();
  }

  const chartData = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    stress: l.stressLevel,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Mood Tracker</h1>

      <form onSubmit={submit} className="card p-6 mb-6 space-y-5">
        <div>
          <p className="text-sm text-gray-500 mb-2">How are you feeling today?</p>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                type="button"
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex-1 py-3 rounded-xl text-2xl border ${mood === m.value ? "border-equilibrium-blue bg-equilibrium-soft" : "border-black/5"}`}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        <SliderField label="Stress level" value={stressLevel} onChange={setStressLevel} />
        <SliderField label="Energy" value={energy} onChange={setEnergy} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Sleep (hours)</label>
            <input type="number" min={0} max={24} className="input mt-1" value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm text-gray-500">Exercise (minutes)</label>
            <input type="number" min={0} className="input mt-1" value={exerciseMinutes} onChange={(e) => setExerciseMinutes(Number(e.target.value))} />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500">Anything you want to note?</label>
          <textarea className="input mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <button className="btn-primary w-full">Save today's check-in</button>
        {saved && <p className="text-sm text-green-600 text-center">Saved — thanks for checking in today.</p>}
      </form>

      <div className="card p-5">
        <p className="text-sm text-gray-400 mb-2">Stress level — last 30 days</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" fontSize={11} />
            <YAxis domain={[1, 5]} fontSize={12} />
            <Tooltip />
            <Bar dataKey="stress" fill="#5B7FDE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SliderField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>{label}</span>
        <span>{value}/5</span>
      </div>
      <input type="range" min={1} max={5} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}
