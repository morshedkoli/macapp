"use client";

import { useEffect, useState } from "react";

type RecordItem = {
  _id: string;
  name: string;
  mac: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

type RecordsProps = {
  unlocked: boolean;
  onToast: (kind: "success" | "error" | "info", message: string) => void;
};

export default function Records({ unlocked, onToast }: RecordsProps) {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [query, setQuery] = useState({ name: "", mac: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: "", mac: "", phone: "" });
  const [editErrors, setEditErrors] = useState<{ name?: string; mac?: string; phone?: string }>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (query.name) qs.set("name", query.name);
      if (query.mac) qs.set("mac", query.mac);
      if (query.phone) qs.set("phone", query.phone);
      const res = await fetch(`/api/records?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to load records");
      }
      const j = await res.json();
      setRecords(j.records || []);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to load records";
      setError(errorMessage);
      onToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) {
      load();
    } else {
      setRecords([]);
    }
  }, [unlocked, load]);

  const validateMac = (m: string) => /^[a-fA-F0-9]{2}([:\-]?[a-fA-F0-9]{2}){5}$/.test(m.replace(/\s+/g, ""));
  const validatePhone = (p: string) => p.trim().length >= 6 && p.trim().length <= 20;

  const beginEdit = (r: RecordItem) => {
    setEditId(r._id);
    setEditValues({ name: r.name, mac: r.mac, phone: r.phone });
    setEditErrors({});
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditErrors({});
  };

  const saveEdit = async (_id: string) => {
    setBusy(true);
    setError(null);
    
    const errs: typeof editErrors = {};
    if (!editValues.name.trim()) errs.name = "Name is required";
    if (!validateMac(editValues.mac)) errs.mac = "Invalid MAC format";
    if (!validatePhone(editValues.phone)) errs.phone = "Invalid phone";
    setEditErrors(errs);
    
    if (Object.keys(errs).length > 0) {
      setBusy(false);
      return;
    }

    try {
      const res = await fetch(`/api/records/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Update failed");
      setEditId(null);
      setEditErrors({});
      await load();
      onToast("success", "Record updated");
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Update failed";
      setError(errorMessage);
      onToast("error", errorMessage);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (_id: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/records/${_id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Delete failed");
      }
      await load();
      onToast("success", "Record deleted");
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Delete failed";
      setError(errorMessage);
      onToast("error", errorMessage);
    } finally {
      setBusy(false);
    }
  };

  const fmtMac = (m: string) =>
    m
      .replace(/[^a-fA-F0-9]/g, "")
      .toLowerCase()
      .match(/.{1,2}/g)?.join(":") ?? m;

  const disabled = busy || loading;

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Records</h1>
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-200 flex items-center gap-3" role="alert">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Search Section */}
      <section className="search-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-green-700">Search</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="search-input-group">
            <input
              className="input search-input"
              placeholder="Name"
              value={query.name}
              onChange={(e) => setQuery({ ...query, name: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="search-input-group">
            <input
              className="input search-input"
              placeholder="MAC Address"
              value={query.mac}
              onChange={(e) => setQuery({ ...query, mac: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="search-input-group">
            <input
              className="input search-input"
              placeholder="Phone"
              value={query.phone}
              onChange={(e) => setQuery({ ...query, phone: e.target.value })}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="btn btn-search" onClick={load} disabled={disabled}>
            {loading ? (
              <>
                <div className="w-4 h-4 bg-white rounded-full animate-pulse mr-2"></div>
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
          <button
            className="btn btn-reset"
            onClick={() => {
              setQuery({ name: "", mac: "", phone: "" });
              load();
            }}
            disabled={disabled}
          >
            Reset
          </button>
        </div>
      </section>

      {/* Results Section */}
      <section className="results-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-blue-700">Results</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{records.length}</span>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm table">
            <thead>
              <tr className="text-left border-b border-blue-200">
                <th className="py-3 pr-4 font-semibold text-blue-700">Name</th>
                <th className="py-3 pr-4 font-semibold text-blue-700">MAC</th>
                <th className="py-3 pr-4 font-semibold text-blue-700">Phone</th>
                <th className="py-3 pr-4 font-semibold text-blue-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="py-2 pr-4 align-top">
                    {editId === r._id ? (
                      <input
                        className="input py-1"
                        value={editValues.name}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        disabled={disabled}
                      />
                    ) : (
                      r.name
                    )}
                    {editId === r._id && editErrors.name && (
                      <div className="text-red-500 text-xs mt-1">{editErrors.name}</div>
                    )}
                  </td>
                  <td className="py-2 pr-4 align-top">
                    {editId === r._id ? (
                      <input
                        className="input py-1"
                        value={editValues.mac}
                        onChange={(e) => setEditValues({ ...editValues, mac: e.target.value })}
                        disabled={disabled}
                      />
                    ) : (
                      <span className="font-mono tracking-wider">{fmtMac(r.mac)}</span>
                    )}
                    {editId === r._id && editErrors.mac && (
                      <div className="text-red-500 text-xs mt-1">{editErrors.mac}</div>
                    )}
                  </td>
                  <td className="py-2 pr-4 align-top">
                    {editId === r._id ? (
                      <input
                        className="input py-1"
                        value={editValues.phone}
                        onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                        disabled={disabled}
                      />
                    ) : (
                      r.phone
                    )}
                    {editId === r._id && editErrors.phone && (
                      <div className="text-red-500 text-xs mt-1">{editErrors.phone}</div>
                    )}
                  </td>
                  <td className="py-2 pr-4 align-top">
                    {editId === r._id ? (
                      <div className="flex gap-2">
                        <button className="btn btn-save" onClick={() => saveEdit(r._id)} disabled={disabled}>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save
                        </button>
                        <button className="btn btn-cancel" onClick={cancelEdit} disabled={disabled}>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button className="btn btn-edit-beautiful" onClick={() => beginEdit(r)} disabled={disabled}>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="py-6 text-center opacity-70">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="card w-full max-w-sm">
            <h3 className="text-lg font-medium">Delete record?</h3>
            <p className="text-sm opacity-80 mt-1">This action cannot be undone.</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button className="btn btn-outline" onClick={() => setConfirmDeleteId(null)} disabled={busy}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  const _id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  if (_id) await onDelete(_id);
                }}
                disabled={busy}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
