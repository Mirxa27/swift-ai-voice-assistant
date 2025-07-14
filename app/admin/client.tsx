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
  const [promptCount, setPromptCount] = useState(0);
  const [providers, setProviders] = useState<string>("{}");
  const [providerCount, setProviderCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    setLang(localStorage.getItem("language"));
    const storedFocus = localStorage.getItem("focusAreas");
    if (storedFocus) setFocus(JSON.parse(storedFocus));
    const storedProg = localStorage.getItem("progress");
    if (storedProg) setProgress(JSON.parse(storedProg));
    const savedToken = sessionStorage.getItem("adminToken");
    if (savedToken) {
      fetchPrompts(savedToken);
      fetchProviders(savedToken);
      fetchReports(savedToken);
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
      const data = await res.json();
      setPrompts(JSON.stringify(data, null, 2));
      const questions = Array.isArray(data.shadowSelf?.questions)
        ? data.shadowSelf.questions.length
        : 0;
      setPromptCount(questions);
    } else {
      setError("Invalid secret");
    }
  }

  async function fetchProviders(pass: string) {
    const res = await fetch("/api/providers", {
      headers: { Authorization: `Bearer ${pass}` },
    });
    if (res.ok) {
      const data = await res.json();
      setProviders(JSON.stringify(data, null, 2));
      setProviderCount(Object.keys(data).length);
    }
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
    setError(null);
    const resPrompts = await fetch("/api/prompts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: prompts,
    });
    if (!resPrompts.ok) {
      setError("Failed to save prompts");
      return;
    }

    const resProviders = await fetch("/api/providers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: providers,
    });
    if (!resProviders.ok) {
      setError("Failed to save providers");
    }
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
          <button className="w-full p-2 bg-black text-white rounded">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Admin Settings</h1>

      <div className="space-y-2 p-4 border rounded">
        <h2 className="font-semibold text-lg">API Status</h2>
        <p>GROQ_API_KEY configured: {groq ? "Yes" : "No"}</p>
        <p>CARTESIA_API_KEY configured: {cartesia ? "Yes" : "No"}</p>
      </div>

      <div className="space-y-2 p-4 border rounded">
        <h2 className="font-semibold text-lg">User Settings</h2>
        <p>Saved language: {lang || "None"}</p>
        <p>Focus areas: {focus.length > 0 ? focus.join(", ") : "None"}</p>
      </div>

      <div className="space-y-2 p-4 border rounded">
        <h2 className="font-semibold text-lg">Progress</h2>
        {Object.keys(progress).length === 0 ? (
          <p>No progress yet.</p>
        ) : (
          focus.map((area) => (
            <div key={area}>
              <div className="flex justify-between text-sm">
                <span>{area}</span>
                <span>{progress[area] ?? 0}%</span>
              </div>
              <div className="h-2 bg-neutral-200 rounded">
                <div
                  className="h-2 bg-blue-500 rounded"
                  style={{ width: `${progress[area] ?? 0}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-4 p-4 border rounded">
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Prompts ({promptCount})</h2>
          <textarea
            value={prompts}
            onChange={(e) => setPrompts(e.target.value)}
            className="w-full h-64 border p-2 font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Providers ({providerCount})</h2>
          <textarea
            value={providers}
            onChange={(e) => setProviders(e.target.value)}
            className="w-full h-40 border p-2 font-mono text-sm"
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button onClick={save} className="w-full p-2 bg-black text-white rounded">
          Save Prompts & Providers
        </button>
      </div>

      <div className="space-y-2 p-4 border rounded">
        <h2 className="font-semibold text-lg">Crisis Reports ({reports.length})</h2>
        {reports.length === 0 ? (
          <p>No reports</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {reports.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}
        <button
          onClick={clearReports}
          disabled={reports.length === 0}
          className="w-full p-2 bg-red-600 text-white rounded disabled:bg-neutral-400"
        >
          Clear Reports
        </button>
      </div>
    </div>
  );
}