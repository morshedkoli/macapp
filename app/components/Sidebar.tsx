"use client";

import { useState } from "react";

type SidebarProps = {
  currentView: string;
  onViewChange: (view: string) => void;
  onLock: () => void;
  disabled?: boolean;
};

export default function Sidebar({ currentView, onViewChange, onLock, disabled }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "records", label: "Records", icon: "📋" },
    { id: "add", label: "Add Record", icon: "➕" },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-primary">MAC Dashboard</h2>
          )}
          <button
            className="btn-ghost sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            disabled={disabled}
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            disabled={disabled}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="btn btn-outline w-full"
          onClick={onLock}
          disabled={disabled}
        >
          {!isCollapsed ? "🔒 Lock" : "🔒"}
        </button>
      </div>
    </div>
  );
}
