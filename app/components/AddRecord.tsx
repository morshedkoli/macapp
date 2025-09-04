"use client";

import { useState } from "react";

type AddRecordProps = {
  unlocked: boolean;
  onToast: (kind: "success" | "error" | "info", message: string) => void;
};

export default function AddRecord({ unlocked, onToast }: AddRecordProps) {
  const [creating, setCreating] = useState({ name: "", mac: "", phone: "" });
  const [creatingErrors, setCreatingErrors] = useState<{ name?: string; mac?: string; phone?: string }>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateMac = (m: string) => /^[a-fA-F0-9]{2}([:\-]?[a-fA-F0-9]{2}){5}$/.test(m.replace(/\s+/g, ""));
  const validatePhone = (p: string) => p.trim().length >= 6 && p.trim().length <= 20;

  const formatMacAddress = (value: string) => {
    // Remove all non-hex characters
    const cleanValue = value.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
    
    // Limit to 12 characters (6 pairs)
    const limitedValue = cleanValue.slice(0, 12);
    
    // Add colons every 2 characters
    const formatted = limitedValue.match(/.{1,2}/g)?.join(':') || limitedValue;
    
    return formatted;
  };

  const onCreate = async () => {
    setBusy(true);
    setError(null);
    
    // Client-side validation
    const errs: typeof creatingErrors = {};
    if (!creating.name.trim()) errs.name = "Name is required";
    if (!validateMac(creating.mac)) errs.mac = "Invalid MAC format";
    if (!validatePhone(creating.phone)) errs.phone = "Invalid phone";
    setCreatingErrors(errs);
    
    if (Object.keys(errs).length > 0) {
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creating),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Create failed");
      
      setCreating({ name: "", mac: "", phone: "" });
      setCreatingErrors({});
      onToast("success", "Record created successfully");
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Create failed";
      setError(errorMessage);
      onToast("error", errorMessage);
    } finally {
      setBusy(false);
    }
  };

  const disabled = busy || !unlocked;

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">Add Record</h1>
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-200 flex items-center gap-3" role="alert">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <section className="add-record-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-purple-700">New Record</h2>
        </div>
        
        <div className="space-y-6">
          <div className="form-group">
            <label className="form-label">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Name
            </label>
            <input
              className="input form-input"
              placeholder="Enter name"
              value={creating.name}
              onChange={(e) => setCreating({ ...creating, name: e.target.value })}
              disabled={disabled}
            />
            {creatingErrors.name && (
              <div className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {creatingErrors.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              MAC Address
            </label>
            <input
              className="input form-input font-mono"
              placeholder="aa:bb:cc:dd:ee:ff"
              value={creating.mac}
              onChange={(e) => {
                const formattedMac = formatMacAddress(e.target.value);
                setCreating({ ...creating, mac: formattedMac });
              }}
              disabled={disabled}
            />
            {creatingErrors.mac && (
              <div className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {creatingErrors.mac}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Phone
            </label>
            <input
              className="input form-input"
              placeholder="Enter phone number"
              value={creating.phone}
              onChange={(e) => setCreating({ ...creating, phone: e.target.value })}
              disabled={disabled}
            />
            {creatingErrors.phone && (
              <div className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {creatingErrors.phone}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button 
            className="btn btn-create" 
            onClick={onCreate} 
            disabled={disabled}
          >
            {busy ? (
              <>
                <div className="w-4 h-4 bg-white rounded-full animate-pulse mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create
              </>
            )}
          </button>
          
          <button
            className="btn btn-clear"
            onClick={() => {
              setCreating({ name: "", mac: "", phone: "" });
              setCreatingErrors({});
              setError(null);
            }}
            disabled={disabled}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        </div>
      </section>

      <section className="tips-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="font-semibold text-yellow-700">Tips</h3>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>MAC addresses support multiple formats</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>All fields are required</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Duplicate MAC addresses not allowed</span>
          </div>
        </div>
      </section>
    </div>
  );
}
