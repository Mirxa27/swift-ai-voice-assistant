"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function JournalPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("journal");
    if (stored) setMessages(JSON.parse(stored));
  }, []);

  if (messages.length === 0) {
    return (
      <div className="space-y-4 text-center p-4">
        <p>No journal entries yet.</p>
        <Link href="/">Back to chat</Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-center">Journal</h1>
      <div className="space-y-2">
        {messages.map((m, i) => (
          <div key={i} className="border rounded p-2">
            <p className="text-sm text-neutral-500">
              {m.role === "user" ? "You" : "AI"}
            </p>
            <p>{m.content}</p>
          </div>
        ))}
      </div>
      <Link href="/" className="text-blue-600 hover:underline block text-center">
        Back to chat
      </Link>
    </div>
  );
}
