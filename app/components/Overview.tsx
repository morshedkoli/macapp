"use client";

import { useEffect, useState } from "react";

type OverviewProps = {
  unlocked: boolean;
  onNavigate?: (view: "overview" | "records" | "add") => void;
};

type Stats = {
  total: number;
  recent: number;
  unique: number;
};

export default function Overview({ unlocked, onNavigate }: OverviewProps) {
  const [stats, setStats] = useState<Stats>({ total: 0, recent: 0, unique: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (unlocked) {
      loadStats();
    }
  }, [unlocked]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/records", { cache: "no-store" });
      const j = await res.json();
      if (res.ok && j.records) {
        const records = j.records;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        setStats({
          total: records.length,
          recent: records.filter((r: { createdAt: string }) => new Date(r.createdAt) > oneDayAgo).length,
          unique: new Set(records.map((r: { mac: string }) => r.mac)).size,
        });
      }
    } catch (e: unknown) {
      console.error("Failed to load stats:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="stat-card-colorful stat-card-blue">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-500">Records</div>
            </div>
          </div>
        </div>
        
        <div className="stat-card-colorful stat-card-green">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{stats.recent}</div>
              <div className="text-sm text-green-500">Recent</div>
            </div>
          </div>
        </div>
        
        <div className="stat-card-colorful stat-card-purple">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{stats.unique}</div>
              <div className="text-sm text-purple-500">Unique</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="action-card action-card-blue"
          role="button"
          tabIndex={0}
          onClick={() => onNavigate && onNavigate("records")}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && onNavigate) {
              e.preventDefault();
              onNavigate("records");
            }
          }}
          aria-label="Go to Records to search and manage entries"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-blue-700">Search Records</div>
              <div className="text-xs text-blue-500">Find & manage entries</div>
            </div>
          </div>
        </div>
        
        <div
          className="action-card action-card-green"
          role="button"
          tabIndex={0}
          onClick={() => onNavigate && onNavigate("add")}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && onNavigate) {
              e.preventDefault();
              onNavigate("add");
            }
          }}
          aria-label="Go to Add Record to create a new entry"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-green-700">Add Record</div>
              <div className="text-xs text-green-500">Create new entry</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
