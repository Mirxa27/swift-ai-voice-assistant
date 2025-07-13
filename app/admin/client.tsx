"use client";
import { useEffect, useState } from "react";

export default function AdminClient({
  groq,
  cartesia,
}: {
  groq: boolean;
  cartesia: boolean;
}) {
  const [lang, setLang] = useState<string | null>(null);
  const [focus, setFocus] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string>("{}");
  const [providers, setProviders] = useState<string>("{}");
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<string[]>([]);

  useEffect(() => {
    setLang(localStorage.getItem("language"));
    const stored = localStorage.getItem("focusAreas");
    if (stored) setFocus(JSON.parse(stored));
    const saved = sessionStorage.getItem("adminToken");
    if (saved) {
      fetchPrompts(saved);
      fetchProviders(saved);
      fetchReports(saved);
    }
  }, []);

  async function fetchPrompts(pass: string) {
    setError(null);
    const res = await fetch("/api/prompts", {
      headers: { Authorization: `Bearer ${pass}` },
    });
    if (res.ok) {
      setToken(pass);
      sessionStorage.setItem("adminToken", pass);
      setPrompts(JSON.stringify(await res.json(), null, 2));
    } else {
      setError("Invalid secret");
    }
  }

  async function fetchProviders(pass: string) {
    const res = await fetch("/api/providers", {
      headers: { Authorization: `Bearer ${pass}` },
    });
    if (res.ok) setProviders(JSON.stringify(await res.json(), null, 2));
  }

  async function fetchReports(pass: string) {
    const res = await fetch("/api/crisis", {
      headers: { Authorization: `Bearer ${pass}` },
    });
    if (res.ok) setReports(await res.json());
  }

  async function clearReports() {
    if (!token) return;
    await fetch("/api/crisis", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setReports([]);
  }

  async function save() {
    if (!token) return;
    const res = await fetch("/api/prompts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: prompts,
    });
    if (!res.ok) setError("Failed to save prompts");
    const res2 = await fetch("/api/providers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: providers,
    });
    if (!res2.ok) setError("Failed to save providers");
  }

  if (!token) {
    return (
      <div className="space-y-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const pass = (form.elements.namedItem("secret") as HTMLInputElement)
              .value;
            fetchPrompts(pass);
            fetchProviders(pass);
            fetchReports(pass);
          }}
          className="space-y-2"
        >
          <input
            type="password"
            name="secret"
            placeholder="Admin secret"
            className="w-full p-2 border rounded"
            required
          />
          {error && <p className="text-red-600">{error}</p>}
          <button className="w-full p-2 bg-black text-white rounded">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Admin Settings</h1>
      <div className="space-y-1">
        <p>GROQ_API_KEY configured: {groq ? "Yes" : "No"}</p>
        <p>CARTESIA_API_KEY configured: {cartesia ? "Yes" : "No"}</p>
      </div>
      <div className="space-y-1">
        <p>Saved language: {lang || "None"}</p>
        <p>Focus areas: {focus.length > 0 ? focus.join(", ") : "None"}</p>
      </div>
      <div className="space-y-2">
        <h2 className="font-semibold">Prompts JSON</h2>
        <textarea
          value={prompts}
          onChange={(e) => setPrompts(e.target.value)}
          className="w-full h-64 border p-2 font-mono"
        />
        {error && <p className="text-red-600">{error}</p>}
        <button onClick={save} className="p-2 bg-black text-white rounded">
          Save
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Provider Config JSON</h2>
        <textarea
          value={providers}
          onChange={(e) => setProviders(e.target.value)}
          className="w-full h-40 border p-2 font-mono"
        />
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Crisis Reports</h2>
        {reports.length === 0 ? (
          <p>No reports</p>
        ) : (
          <ul className="list-disc pl-4 space-y-1">
            {reports.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}
        <button
          onClick={clearReports}
          className="p-2 bg-black text-white rounded"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
