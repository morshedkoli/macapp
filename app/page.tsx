"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Records from "./components/Records";
import AddRecord from "./components/AddRecord";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [currentView, setCurrentView] = useState("overview");

  // Toasts
  type Toast = { id: number; kind: "success" | "error" | "info"; message: string };
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (kind: Toast["kind"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        const j = await res.json();
        setUnlocked(!!j.unlocked);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onUnlock = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Unlock failed");
      setUnlocked(true);
      setPin("");
      addToast("success", "Unlocked");
    } catch (e: any) {
      setError(e.message || "Unlock failed");
      addToast("error", e.message || "Unlock failed");
    } finally {
      setBusy(false);
    }
  };

  const onLock = async () => {
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/lock", { method: "POST" });
      setUnlocked(false);
      addToast("info", "Locked");
    } finally {
      setBusy(false);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "overview":
        return <Overview unlocked={unlocked} />;
      case "records":
        return <Records unlocked={unlocked} onToast={addToast} />;
      case "add":
        return <AddRecord unlocked={unlocked} onToast={addToast} />;
      default:
        return <Overview unlocked={unlocked} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm opacity-70">Loading…</div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="w-full max-w-sm">
          {/* Lock Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-1">MAC Dashboard</h1>
            <p className="text-sm text-muted-foreground">Enter your PIN to access</p>
          </div>
          
          {/* Card */}
          <div className="card space-y-4">
            {error && (
              <div className="text-red-500 text-sm p-4 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3" role="alert">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">PIN Code</label>
              <div className="relative">
                <input
                  type="password"
                  className="input pin-input"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••"
                  onKeyDown={(e) => e.key === 'Enter' && !busy && pin && onUnlock()}
                  autoFocus
                />
                <div className="absolute inset-0 rounded-xl pointer-events-none pin-highlight"></div>
              </div>
            </div>
            
            <button
              className="btn btn-unlock w-full text-lg font-semibold"
              onClick={onUnlock}
              disabled={busy || !pin}
            >
              {busy ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Unlocking...
                </>
              ) : (
                "Unlock Dashboard"
              )}
            </button>
          </div>
        </div>
        {/* Toasts */}
        <div className="fixed top-6 right-6 space-y-3 z-50">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`card py-3 px-4 min-w-72 shadow-lg transform transition-all duration-300 ${
                t.kind === "success"
                  ? "border-green-500/40 bg-green-50"
                  : t.kind === "error"
                  ? "border-red-500/40 bg-red-50"
                  : "border-foreground/20"
              }`}
            >
              <div className="text-sm font-medium flex items-center gap-2">
                {t.kind === "success" ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : t.kind === "error" ? (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
                {t.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLock={onLock}
        disabled={busy}
      />
      <main className="main-content">
        {renderCurrentView()}
      </main>
      
      {/* Toasts */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`card py-2 px-3 min-w-64 shadow ${
              t.kind === "success"
                ? "border-green-500/40"
                : t.kind === "error"
                ? "border-red-500/40"
                : "border-foreground/20"
            }`}
          >
            <div className="text-sm">
              {t.kind === "success" ? "✅ " : t.kind === "error" ? "❌ " : "ℹ️ "}
              {t.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
