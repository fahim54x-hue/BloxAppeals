"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type StatusData = {
  status: string;
  username: string;
  attempts: number;
  created_at: number;
  last_attempt: number;
};

const statusConfig: Record<string, { label: string; color: string; icon: string; desc: string }> = {
  pending:   { label: "Pending",   color: "text-yellow-400", icon: "⏳", desc: "Your appeal is queued and will be submitted shortly." },
  submitted: { label: "Submitted", color: "text-blue-400",   icon: "📨", desc: "Appeal sent to Roblox. Monitoring inbox for a reply." },
  approved:  { label: "Approved",  color: "text-green-400",  icon: "🎉", desc: "Your account has been unbanned!" },
  failed:    { label: "Retrying",  color: "text-orange-400", icon: "🔄", desc: "Last attempt failed. A new appeal will be sent automatically." },
  cancelled: { label: "Cancelled", color: "text-gray-400",   icon: "✖",  desc: "This appeal was cancelled." },
};

export default function AppealStatusPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/status/${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError("Failed to load appeal status."))
      .finally(() => setLoading(false));
  }, [id]);

  const cfg = data ? (statusConfig[data.status] ?? statusConfig.pending) : null;

  return (
    <main className="min-h-screen bg-[#080810] text-white flex flex-col items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <a href="/" className="flex items-center gap-2 mb-8 text-gray-500 hover:text-white transition text-sm">
          <img src="/logo.svg" width={24} height={24} alt="logo" />
          <span>Blox<span className="text-blue-500">Appeal</span></span>
        </a>

        {loading && (
          <div className="bg-[#111]/80 border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
              <div className="absolute inset-2 flex items-center justify-center">
                <img src="/logo.svg" width={28} height={28} alt="loading" className="animate-pulse" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">Loading appeal status...</p>
          </div>
        )}

        {error && (
          <div className="bg-[#111]/80 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-red-400 font-semibold mb-2">Appeal not found</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <a href="/" className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm underline">← Back to BloxAppeal</a>
          </div>
        )}

        {data && cfg && (
          <div className="bg-[#111]/80 border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cfg.icon}</span>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Appeal #{id}</p>
                <p className="text-white font-bold text-xl">{data.username}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4`}>
              <div className={`w-2.5 h-2.5 rounded-full ${data.status === "approved" ? "bg-green-400" : data.status === "submitted" ? "bg-blue-400 animate-pulse" : "bg-yellow-400"}`} />
              <div>
                <p className={`font-semibold ${cfg.color}`}>{cfg.label}</p>
                <p className="text-gray-400 text-sm mt-0.5">{cfg.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">Attempts</p>
                <p className="text-white font-semibold">{data.attempts}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">Submitted</p>
                <p className="text-white font-semibold">{new Date(Number(data.created_at) * 1000).toLocaleDateString()}</p>
              </div>
            </div>

            {data.last_attempt && (
              <p className="text-gray-600 text-xs text-center">Last attempt: {new Date(Number(data.last_attempt)).toLocaleString()}</p>
            )}

            <a href="/" className="text-center text-blue-400 hover:text-blue-300 text-sm transition">← Back to BloxAppeal</a>
          </div>
        )}
      </div>
    </main>
  );
}
