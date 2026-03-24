"use client";

import { useState, useEffect, useRef } from "react";

type Appeal = {
  id: number;
  username: string;
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

const steps = [
  { icon: "✍️", title: "Enter Your Details", desc: "Your Roblox username, Gmail, and app password. Takes 30 seconds." },
  { icon: "🤖", title: "We Generate & Submit", desc: "AI writes a unique appeal letter and submits it directly to Roblox Support." },
  { icon: "📬", title: "We Monitor Your Inbox", desc: "We watch for Roblox's reply every 6 hours automatically." },
  { icon: "🔄", title: "Auto-Retry if Rejected", desc: "If rejected, a fresh appeal goes out immediately. No action needed from you." },
];

const testimonials = [
  { user: "xX_Blaze_Xx", text: "Got my account back in 2 days. Thought it was gone forever. BloxAppeal actually works.", avatar: "🔥" },
  { user: "noobmaster99", text: "Tried appealing manually 3 times and got ignored. This auto-retried and I got unbanned.", avatar: "⚡" },
  { user: "SkylerBuilds", text: "The automated retry is insane. Rejected twice then approved on the 3rd attempt automatically.", avatar: "🏗️" },
  { user: "ProGamer2025", text: "Didn't believe it at first but my 7 year old account is back. Genuinely grateful.", avatar: "🎮" },
];

const faqs = [
  { q: "What bans does BloxAppeal handle?", a: "Enforcement bans (subject to change soon)." },
  { q: "What is an enforcement ban?", a: "Enforcement bans are labeled as \"account linking\" or \"ban evasion.\" They happen when Roblox's automated system flags your account as linked to another banned account, even if it isn't. These false positives are extremely common." },
  { q: "How does the appeal process work?", a: "Enter your details and we generate a unique appeal, submit it to Roblox, then monitor your inbox. If rejected, a fresh appeal goes out automatically." },
  { q: "How long does it take?", a: "No guaranteed timeline. Most successful appeals come within a few days. We keep retrying until you get a result." },
  { q: "Is this legal?", a: "Yes. We automate the legitimate appeal process available to every Roblox user. We don't exploit vulnerabilities or access your account." },
  { q: "Do you need access to my emails?", a: "We need a Gmail App Password (not your real password) to monitor for Roblox's reply and auto-retry if rejected. You can revoke it anytime." },
];

function useCountUp(target: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.ceil(target / 50);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, active]);
  return count;
}

function StatCard({ label, value, color, active }: { label: string; value: number; color: string; active: boolean }) {
  const count = useCountUp(value, active);
  return (
    <div className="bg-[#111]/80 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
      <p className={`text-xs font-semibold mb-1 ${color}`}>{label}</p>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(timer);
    }, 12);
    return () => clearInterval(timer);
  }, [text]);
  return <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">{displayed}<span className="animate-pulse">|</span></p>;
}

function StatusTimeline({ status, attempts }: { status: string; attempts: number }) {
  const stagesAll = ["pending", "submitted", "retrying", "approved"];
  const stageLabels: Record<string, string> = {
    pending: "Pending",
    submitted: "Submitted",
    retrying: `Retrying (${attempts}x)`,
    approved: "Approved",
  };
  const currentIndex = status === "failed" ? 2 : stagesAll.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3 flex-wrap">
      {stagesAll.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              active ? "bg-blue-600/20 border-blue-500/50 text-blue-300" :
              done ? "bg-green-600/10 border-green-500/20 text-green-400" :
              "bg-white/5 border-white/10 text-gray-600"
            }`}>
              {done && <span>✓</span>}
              {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />}
              {stageLabels[s]}
            </div>
            {i < stagesAll.length - 1 && <span className="text-gray-700 text-xs">→</span>}
          </div>
        );
      })}
    </div>
  );
}

const onboardingSteps = [
  {
    title: "Welcome to BloxAppeal",
    desc: "We automatically generate and submit Roblox ban appeals on your behalf — and keep retrying if rejected. Let's get you set up in 2 minutes.",
    icon: "👋",
  },
  {
    title: "You'll need a Gmail App Password",
    desc: "This is NOT your real Gmail password. It's a special 16-character code that lets us monitor your inbox for Roblox's reply. You can revoke it anytime.",
    icon: "🔑",
    link: { label: "Get your App Password here →", url: "https://myaccount.google.com/apppasswords" },
    steps: ["Go to myaccount.google.com/apppasswords", "Sign in if prompted", "Click 'Create' and name it 'BloxAppeal'", "Copy the 16-character code shown"],
  },
  {
    title: "What happens after you submit",
    desc: "Once you submit, we handle everything automatically.",
    icon: "🤖",
    bullets: ["Your appeal is generated by AI and sent to Roblox", "We check your inbox every 6 hours for a reply", "If rejected, a new appeal is sent automatically", "You get an email notification when there's an update"],
  },
  {
    title: "You're ready to go",
    desc: "Fill in your Roblox username, Gmail, and App Password below. We'll take it from there.",
    icon: "🚀",
  },
];

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = onboardingSteps[step];
  const isLast = step === onboardingSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-blue-900/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-1.5">
            {onboardingSteps.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-blue-500" : i < step ? "w-4 bg-blue-500/40" : "w-4 bg-white/10"}`} />
            ))}
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-sm transition">Skip</button>
        </div>

        <div className="text-4xl mb-4">{current.icon}</div>
        <h2 className="text-xl font-bold mb-2">{current.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{current.desc}</p>

        {"steps" in current && current.steps && (
          <ol className="flex flex-col gap-2 mb-4">
            {current.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-blue-500 font-bold mt-0.5">{i + 1}.</span> {s}
              </li>
            ))}
          </ol>
        )}

        {"bullets" in current && current.bullets && (
          <ul className="flex flex-col gap-2 mb-4">
            {current.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-blue-500 mt-0.5">✓</span> {b}
              </li>
            ))}
          </ul>
        )}

        {"link" in current && current.link && (
          <a href={current.link.url} target="_blank" rel="noopener noreferrer"
            className="inline-block mb-4 text-blue-400 hover:text-blue-300 text-sm underline underline-offset-2">
            {current.link.label}
          </a>
        )}

        <button onClick={() => isLast ? onClose() : setStep(s => s + 1)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]">
          {isLast ? "Get Started" : "Next →"}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [extraInfo, setExtraInfo] = useState("");

  // Preview step
  const [preview, setPreview] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [editedPreview, setEditedPreview] = useState("");

  const [result, setResult] = useState<{ appealText: string; message: string; success: boolean; appealId: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const [checkId, setCheckId] = useState("");
  const [checkPass, setCheckPass] = useState("");
  const [checkResult, setCheckResult] = useState<{ status: string; message: string; appealText?: string } | null>(null);
  const [checking, setChecking] = useState(false);

  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, approved: 0, rejected: 0, appealsSent: 0 });
  const [dashEmail, setDashEmail] = useState("");
  const [dashUnlocked, setDashUnlocked] = useState(false);
  const [dashLoading, setDashLoading] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [globalStats, setGlobalStats] = useState({ total: 0, today: 0 });
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => setGlobalStats(d)).catch(() => {});
    // Show onboarding only on first visit
    if (!localStorage.getItem("bloxappeal_onboarded")) {
      setShowOnboarding(true);
    }
  }, []);

  function closeOnboarding() {
    localStorage.setItem("bloxappeal_onboarded", "1");
    setShowOnboarding(false);
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    setPreviewing(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, extraInfo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPreview(data.appealText);
      setEditedPreview(data.appealText);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, appPassword, extraInfo, appealText: editedPreview }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setPreview(null);
      showToast(data.success ? "Appeal submitted!" : "Generated — submit manually.", data.success ? "success" : "error");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      showToast(msg, "error");
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

  async function loadDashboard(e: React.FormEvent) {
    e.preventDefault();
    setDashLoading(true);
    const res = await fetch("/api/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: dashEmail }),
    });
    const data = await res.json();
    setAppeals(data.appeals ?? []);
    setStats(data.stats ?? {});
    setDashUnlocked(true);
    setDashLoading(false);
  }

  useEffect(() => {
    if (dashUnlocked) {
      fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: dashEmail }),
      }).then(r => r.json()).then(data => {
        setAppeals(data.appeals ?? []);
        setStats(data.stats ?? {});
      });
    }
  }, [dashUnlocked, result, dashEmail]);

  const statusColor = (s: string) =>
    s === "approved" ? "text-green-400" : s === "rejected" || s === "error" ? "text-red-400" : "text-yellow-400";

  const inputCls = "bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition";

  return (
    <main className="min-h-screen bg-[#080810] text-white flex flex-col items-center px-4 py-0 relative overflow-x-hidden">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-800/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Onboarding modal */}
      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === "success" ? "bg-blue-600" : "bg-red-500/90"}`}>
          {toast.msg}
        </div>
      )}

      {/* Sticky header */}
      <header className="sticky top-0 z-40 w-full flex justify-center py-4 px-4">
        <div className="w-full max-w-4xl flex items-center justify-between bg-[#0f0f1a]/80 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="BloxAppeal logo" width={32} height={32} />
            <span className="font-bold text-lg">Blox<span className="text-blue-500">Appeal</span></span>
          </div>
          <nav className="flex gap-5 text-sm text-gray-400">
            <a href="#appeal" className="hover:text-white transition">Appeal</a>
            <a href="#how" className="hover:text-white transition">How it works</a>
            <a href="#dashboard" className="hover:text-white transition">Dashboard</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>
        </div>
      </header>

      <div className="relative z-10 w-full flex flex-col items-center pt-12 pb-16">

        {/* Hero */}
        <div className="text-center mb-14" id="appeal">
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
              <img src="/logo.svg" alt="BloxAppeal logo" width={72} height={72} className="relative" />
            </div>
          </div>
          <h1 className="text-6xl font-extrabold mb-4 tracking-tight">Blox<span className="text-blue-500">Appeal</span></h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">Got an enforcement ban? We'll appeal it automatically — and keep retrying until it works.</p>
        </div>

        {/* Live counters */}
        <div className="w-full max-w-3xl mb-10 grid grid-cols-2 gap-4">
          {[
            { label: "Appeals Submitted", value: globalStats.total, suffix: "+", color: "text-blue-400" },
            { label: "Submitted Today", value: globalStats.today, suffix: "", color: "text-purple-400" },
          ].map(({ label, value, suffix, color }) => (
            <div key={label} className="bg-[#111]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center">
              <p className={`text-3xl font-extrabold ${color}`}>{value}{suffix}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="w-full max-w-3xl mb-14">
          <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-5">What people are saying</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map(({ user, text, avatar }) => (
              <div key={user} className="bg-[#111]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-lg">{avatar}</div>
                  <p className="text-sm font-semibold text-white">{user}</p>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">"{text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="w-full max-w-3xl mb-14" id="how">
          <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-8">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map(({ icon, title, desc }, i) => (
              <div key={title} className="relative bg-[#111]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-colors duration-200">
                <div className="text-2xl mb-3">{icon}</div>
                <div className="absolute top-4 right-4 text-xs text-gray-700 font-bold">0{i + 1}</div>
                <p className="text-white font-semibold text-sm mb-1">{title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Form — Step 1: fill details + preview */}
        {!preview ? (
          <form onSubmit={handlePreview} className="w-full max-w-xl bg-[#111]/80 backdrop-blur-sm rounded-2xl p-8 flex flex-col gap-5 border border-white/10 shadow-xl shadow-blue-900/10">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Step 1 — Your Details</p>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Roblox Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. coolplayer123" required className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Gmail Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@gmail.com" required className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Gmail App Password <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">(get one here)</a></label>
              <input type="password" value={appPassword} onChange={e => setAppPassword(e.target.value)} placeholder="xxxx xxxx xxxx xxxx" required className={inputCls} />
              <p className="text-gray-600 text-xs">Not your real password. Used only to monitor Roblox reply emails.</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Additional Info <span className="text-gray-600">(optional)</span></label>
              <textarea value={extraInfo} onChange={e => setExtraInfo(e.target.value)} placeholder="Any extra context about your ban..." rows={3} className={`${inputCls} resize-none`} />
            </div>
            <button type="submit" disabled={previewing}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]">
              {previewing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  Generating Appeal...
                </span>
              ) : "Generate Appeal Letter →"}
            </button>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </form>
        ) : (
          /* Step 2: Preview & edit before submitting */
          <div className="w-full max-w-xl bg-[#111]/80 backdrop-blur-sm rounded-2xl p-8 flex flex-col gap-5 border border-white/10 shadow-xl shadow-blue-900/10">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Step 2 — Review & Submit</p>
              <button onClick={() => setPreview(null)} className="text-xs text-gray-500 hover:text-white transition">← Back</button>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Appeal Letter <span className="text-gray-600">(you can edit this)</span></label>
              <textarea value={editedPreview} onChange={e => setEditedPreview(e.target.value)} rows={10}
                className={`${inputCls} resize-none font-mono text-xs leading-relaxed`} />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  Submitting...
                </span>
              ) : "Submit Appeal to Roblox"}
            </button>
            <button onClick={() => { setPreviewing(true); fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, extraInfo }) }).then(r => r.json()).then(d => { setEditedPreview(d.appealText); setPreview(d.appealText); }).finally(() => setPreviewing(false)); }}
              disabled={previewing} className="text-sm text-gray-500 hover:text-white transition text-center">
              {previewing ? "Regenerating..." : "↺ Regenerate letter"}
            </button>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="w-full max-w-xl mt-8 bg-[#111]/80 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl shadow-blue-900/10">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${result.success ? "bg-green-500" : "bg-yellow-500"}`} />
              <p className="text-sm text-gray-300">{result.message}</p>
            </div>
            <p className="text-gray-500 text-xs mb-4">Appeal ID: <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{result.appealId}</span> — save this.</p>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Appeal Letter</h2>
              <button onClick={() => { navigator.clipboard.writeText(result.appealText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className={`text-sm border px-3 py-1 rounded-lg transition-all duration-200 ${copied ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-gray-400 hover:text-white border-white/10"}`}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <TypewriterText text={result.appealText} />
          </div>
        )}

        {/* Status Checker */}
        <div className="w-full max-w-xl mt-10 bg-[#111]/80 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl shadow-blue-900/10">
          <h2 className="text-lg font-semibold mb-5">Check Appeal Status</h2>
          <form onSubmit={handleCheck} className="flex flex-col gap-4">
            <input type="number" value={checkId} onChange={e => setCheckId(e.target.value)} placeholder="Appeal ID" required className={inputCls} />
            <input type="password" value={checkPass} onChange={e => setCheckPass(e.target.value)} placeholder="Gmail App Password" required className={inputCls} />
            <button type="submit" disabled={checking}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
              {checking ? "Checking..." : "Check Status"}
            </button>
          </form>
          {checkResult && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className={`font-semibold ${statusColor(checkResult.status)}`}>{checkResult.status.toUpperCase()}</p>
              <p className="text-gray-400 text-sm mt-1">{checkResult.message}</p>
              {checkResult.appealText && <p className="text-gray-300 text-sm mt-3 whitespace-pre-wrap">{checkResult.appealText}</p>}
            </div>
          )}
        </div>

        {/* Dashboard */}
        <div className="w-full max-w-4xl mt-14" id="dashboard">
          <h2 className="text-xl font-bold mb-6">Your Accounts</h2>
          {!dashUnlocked ? (
            <form onSubmit={loadDashboard} className="bg-[#111]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex flex-col gap-4 max-w-md shadow-xl shadow-blue-900/10">
              <p className="text-gray-400 text-sm">Enter your email to view your appeal history.</p>
              <input type="email" value={dashEmail} onChange={e => setDashEmail(e.target.value)} placeholder="your@gmail.com" required className={inputCls} />
              <button type="submit" disabled={dashLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]">
                {dashLoading ? "Loading..." : "View My Appeals"}
              </button>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {[
                  { label: "Total Accounts", value: stats.total, color: "text-blue-400" },
                  { label: "Active", value: stats.active, color: "text-yellow-400" },
                  { label: "Approved", value: stats.approved, color: "text-green-400" },
                  { label: "Rejected", value: stats.rejected, color: "text-red-400" },
                  { label: "Appeals Sent", value: stats.appealsSent, color: "text-purple-400" },
                ].map(({ label, value, color }) => (
                  <StatCard key={label} label={label} value={value} color={color} active={dashUnlocked} />
                ))}
              </div>
              <div className="bg-[#111]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl shadow-blue-900/10">
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
                            <td className="py-3 pr-4">
                              <div>
                                <span className={`text-xs px-2 py-1 rounded-full border ${
                                  a.status === "approved" ? "text-green-400 bg-green-400/10 border-green-400/20" :
                                  a.status === "failed" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                                  a.status === "submitted" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" :
                                  "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                                }`}>{a.status}</span>
                                <StatusTimeline status={a.status} attempts={a.attempts} />
                              </div>
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
            </>
          )}
        </div>

        {/* FAQ */}
        <div className="w-full max-w-xl mt-14" id="faq">
          <h2 className="text-xl font-bold mb-6">FAQ</h2>
          <div className="flex flex-col gap-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-[#111]/80 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-blue-500/30 transition-colors duration-200">
                <p className="text-white font-semibold mb-1">{q}</p>
                <p className="text-gray-400 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-16 text-gray-600 text-sm text-center">
          <p>BloxAppeal is not affiliated with Roblox Corporation.</p>
          <p className="mt-1">
            <a href="/privacy" className="hover:text-gray-400 transition">Privacy Policy</a>
            {" · "}
            <a href="/terms" className="hover:text-gray-400 transition">Terms of Service</a>
          </p>
        </footer>

      </div>
    </main>
  );
}
