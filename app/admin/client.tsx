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

  useEffect(() => {
    setLang(localStorage.getItem("language"));
    const stored = localStorage.getItem("focusAreas");
    if (stored) setFocus(JSON.parse(stored));
  }, []);

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center">Admin Settings</h1>
      <div className="space-y-1">
        <p>GROQ_API_KEY configured: {groq ? "Yes" : "No"}</p>
        <p>CARTESIA_API_KEY configured: {cartesia ? "Yes" : "No"}</p>
      </div>
      <div className="space-y-1">
        <p>Saved language: {lang || "None"}</p>
        <p>Focus areas: {focus.length > 0 ? focus.join(", ") : "None"}</p>
      </div>
    </div>
  );
}
