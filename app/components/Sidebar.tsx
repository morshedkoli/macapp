"use client";

import { useState } from "react";

type SidebarProps = {
  currentView: string;
  onViewChange: (view: string) => void;
  onLock: () => void;
  disabled?: boolean;
  mobileOpen?: boolean;
  onToggleMobile?: (open: boolean) => void;
};

export default function Sidebar({ currentView, onViewChange, onLock, disabled, mobileOpen, onToggleMobile }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "records", label: "Records", icon: "📋" },
    { id: "add", label: "Add Record", icon: "➕" },
  ];

  const sidebarClasses = `sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`;

  return (
    <div className={sidebarClasses}>
      <div className="sidebar-header">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-primary">MAC Dashboard</h2>
          )}
          {/* Collapse toggle (desktop/tablet only) */}
          <button
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="btn-ghost sidebar-toggle hidden sm:block"
            onClick={() => setIsCollapsed(!isCollapsed)}
            disabled={disabled}
          >
            {isCollapsed ? "→" : "←"}
          </button>
          {/* Mobile close button */}
          <button
            aria-label="Close menu"
            className="btn-ghost sidebar-toggle sm:hidden"
            onClick={() => onToggleMobile && onToggleMobile(false)}
            disabled={disabled}
          >
            ✕
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => {
              onViewChange(item.id);
              if (onToggleMobile) onToggleMobile(false);
            }}
            disabled={disabled}
            aria-current={currentView === item.id ? 'page' : undefined}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="btn btn-outline w-full"
          onClick={() => {
            if (onToggleMobile) onToggleMobile(false);
            onLock();
          }}
          disabled={disabled}
        >
          {!isCollapsed ? "🔒 Lock" : "🔒"}
        </button>
      </div>
    </div>
  );
}
