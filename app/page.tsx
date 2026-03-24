"use client";

import { useState, useEffect } from "react";

type Appeal = {
  id: number;
  username: string;
  email: string;
  status: string;
  attempts: number;
  created_at: number;
};

type Stats = {
  total: number;
  active: number;
  approved: number;
  rejected: number;
  appealsSent: number;
};

const faqs = [
  { q: "What bans does BloxAppeal handle?", a: "Enforcement bans (subject to change soon)." },
  { q: "What is an enforcement ban?", a: 'Enforcement bans are labeled as "account linking" or "ban evasion." They happen when Roblox\'s automated system flags your account as linked to another banned account, even if it isn\'t. These false positives are extremely common.' },
  { q: "How does the appeal process work?", a: "Enter your details and we generate a unique appeal, submit it to Roblox, then monitor your inbox. If rejected, a fresh appeal goes out automatically." },
  { q: "How long does it take?", a: "No guaranteed timeline. Most successful appeals come within a few days. We keep retrying until you get a result." },
  { q: "Is this legal?", a: "Yes. We automate the legitimate appeal process available to every Roblox user. We don't exploit vulnerabilities or access your account." },
  { q: "Do you need access to my emails?", a: "We need a Gmail App Password (not your real password) to monitor for Roblox's reply and auto-retry if rejected. You can revoke it anytime." },
];

export default function Home() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [result, setResult] = useState<{ appealText: string; message: string; success: boolean; appealId: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Status checker
  const [checkId, setCheckId] = useState("");
  const [checkPass, setCheckPass] = useState("");
  const [checkResult, setCheckResult] = useState<{ status: string; message: string; appealText?: string } | null>(null);
  const [checking, setChecking] = useState(false);

  // Dashboard
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, approved: 0, rejected: 0, appealsSent: 0 });

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(data => {
      setAppeals(data.appeals ?? []);
      setStats(data.stats ?? {});
    });
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, appPassword, extraInfo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appealId: Number(checkId), appPassword: checkPass }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCheckResult(data);
    } catch (err: unknown) {
      setCheckResult({ status: "error", message: err instanceof Error ? err.message : "Error" });
    } finally {
      setChecking(false);
    }
  }

  const statusColor = (s: string) =>
    s === "approved" ? "text-green-400" : s === "rejected" || s === "error" ? "text-blue-400" : "text-yellow-400";

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <img src="/logo.svg" alt="BloxAppeal logo" width={64} height={64} />
        </div>
        <h1 className="text-5xl font-bold mb-3">Blox<span className="text-blue-500">Appeal</span></h1>
        <p className="text-gray-400 text-lg">Got an enforcement ban? We'll appeal it automatically.</p>
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-[#1a1a1a] rounded-2xl p-8 flex flex-col gap-5 border border-white/10">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Roblox Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. coolplayer123" required
            className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Gmail Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@gmail.com" required
            className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">
            Gmail App Password{" "}
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">
              (get one here)
            </a>
          </label>
          <input type="password" value={appPassword} onChange={e => setAppPassword(e.target.value)} placeholder="xxxx xxxx xxxx xxxx" required
            className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" />
          <p className="text-gray-600 text-xs">Not your real password. Used only to monitor Roblox reply emails.</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Additional Info <span className="text-gray-600">(optional)</span></label>
          <textarea value={extraInfo} onChange={e => setExtraInfo(e.target.value)} placeholder="Any extra context about your ban..." rows={4}
            className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition resize-none" />
        </div>

        <button type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition">
          {loading ? "Submitting Appeal..." : "Submit Appeal"}
        </button>

        {error && <p className="text-blue-400 text-sm text-center">{error}</p>}
      </form>

      {/* Result */}
      {result && (
        <div className="w-full max-w-xl mt-8 bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <span className={`w-2 h-2 rounded-full ${result.success ? "bg-green-500" : "bg-yellow-500"}`} />
            <p className="text-sm text-gray-300">{result.message}</p>
          </div>
          <p className="text-gray-500 text-xs mb-4">Your Appeal ID: <span className="text-white font-mono">{result.appealId}</span> — save this to check status later.</p>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Appeal Letter</h2>
            <button onClick={() => { navigator.clipboard.writeText(result.appealText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="text-sm text-gray-400 hover:text-white border border-white/10 px-3 py-1 rounded-lg transition">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm min-h-[200px]">{result.appealText}</p>
        </div>
      )}

      {/* Status Checker */}
      <div className="w-full max-w-xl mt-10 bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
        <h2 className="text-lg font-semibold mb-5">Check Appeal Status</h2>
        <form onSubmit={handleCheck} className="flex flex-col gap-4">
          <input type="number" value={checkId} onChange={e => setCheckId(e.target.value)} placeholder="Appeal ID" required
            className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" />
          <input type="password" value={checkPass} onChange={e => setCheckPass(e.target.value)} placeholder="Gmail App Password" required
            className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" />
          <button type="submit" disabled={checking}
            className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
            {checking ? "Checking..." : "Check Status"}
          </button>
        </form>
        {checkResult && (
          <div className="mt-4">
            <p className={`font-semibold ${statusColor(checkResult.status)}`}>{checkResult.status.toUpperCase()}</p>
            <p className="text-gray-400 text-sm mt-1">{checkResult.message}</p>
            {checkResult.appealText && (
              <p className="text-gray-300 text-sm mt-3 whitespace-pre-wrap">{checkResult.appealText}</p>
            )}
          </div>
        )}
      </div>

      {/* Dashboard */}
      <div className="w-full max-w-4xl mt-12">
        <h2 className="text-xl font-bold mb-6">Your Accounts</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total Accounts", value: stats.total, color: "text-blue-400" },
            { label: "Active", value: stats.active, color: "text-yellow-400" },
            { label: "Approved", value: stats.approved, color: "text-green-400" },
            { label: "Rejected", value: stats.rejected, color: "text-red-400" },
            { label: "Appeals Sent", value: stats.appealsSent, color: "text-purple-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
              <p className={`text-xs font-semibold mb-1 ${color}`}>{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">All Accounts</p>
          {appeals.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2 text-center">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-xl">👤</div>
              <p className="text-white font-semibold">No accounts yet</p>
              <p className="text-gray-500 text-sm">Submit your first appeal above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-white/10">
                    <th className="text-left pb-3 pr-4">ID</th>
                    <th className="text-left pb-3 pr-4">Username</th>
                    <th className="text-left pb-3 pr-4">Email</th>
                    <th className="text-left pb-3 pr-4">Status</th>
                    <th className="text-left pb-3 pr-4">Attempts</th>
                    <th className="text-left pb-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {appeals.map(a => (
                    <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 pr-4 text-gray-500">#{a.id}</td>
                      <td className="py-3 pr-4 font-medium">{a.username}</td>
                      <td className="py-3 pr-4 text-gray-400">{a.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          a.status === "approved" ? "text-green-400 bg-green-400/10 border-green-400/20" :
                          a.status === "failed" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                          a.status === "submitted" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" :
                          "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                        }`}>{a.status}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{a.attempts}</td>
                      <td className="py-3 text-gray-500">{new Date(Number(a.created_at) * 1000).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="w-full max-w-xl mt-12">
        <h2 className="text-xl font-bold mb-6">FAQ</h2>
        <div className="flex flex-col gap-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10">
              <p className="text-white font-semibold mb-1">{q}</p>
              <p className="text-gray-400 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-gray-600 text-sm text-center">
        <p>BloxAppeal is not affiliated with Roblox Corporation.</p>
        <p className="mt-1">
          <a href="/privacy" className="hover:text-gray-400 transition">Privacy Policy</a>
          {" · "}
          <a href="/terms" className="hover:text-gray-400 transition">Terms of Service</a>
        </p>
      </footer>
    </main>
  );
}
