"use client";

import { useEffect, useState } from "react";

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

export default function Dashboard() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, approved: 0, rejected: 0, appealsSent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(data => {
        setAppeals(data.appeals ?? []);
        setStats(data.stats ?? {});
        setLoading(false);
      });
  }, []);

  const statusColor = (s: string) => {
    if (s === "approved") return "text-green-400 bg-green-400/10 border-green-400/20";
    if (s === "failed" || s === "rejected") return "text-red-400 bg-red-400/10 border-red-400/20";
    if (s === "submitted") return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
  };

  const statCards = [
    { label: "Total Accounts", value: stats.total, sub: "All appeal campaigns", color: "text-blue-400" },
    { label: "Active", value: stats.active, sub: "Currently running", color: "text-yellow-400" },
    { label: "Approved", value: stats.approved, sub: "Appeals approved by Roblox", color: "text-green-400" },
    { label: "Rejected", value: stats.rejected, sub: "Appeals rejected by Roblox", color: "text-red-400" },
    { label: "Appeals Sent", value: stats.appealsSent, sub: "Total appeal submissions", color: "text-purple-400" },
  ];

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <a href="/" className="flex items-center gap-2 mb-4">
            <img src="/logo.svg" width={28} height={28} alt="logo" />
            <span className="font-bold text-lg">Blox<span className="text-blue-500">Appeal</span></span>
          </a>
          <h1 className="text-3xl font-bold">Your Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage all your Roblox appeal campaigns</p>
        </div>
        <a href="/" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          + New Order
        </a>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {statCards.map(({ label, value, sub, color }) => (
          <div key={label} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
            <p className={`text-xs font-semibold mb-2 ${color}`}>{label}</p>
            <p className="text-3xl font-bold">{loading ? "—" : value}</p>
            <p className="text-gray-600 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Accounts Table */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">All Accounts</p>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : appeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-2xl">👤</div>
            <p className="text-white font-semibold">No accounts yet</p>
            <p className="text-gray-500 text-sm">Start your first appeal campaign to get unbanned</p>
            <a href="/" className="mt-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
              + New Order
            </a>
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
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusColor(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{a.attempts}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(a.created_at * 1000).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
