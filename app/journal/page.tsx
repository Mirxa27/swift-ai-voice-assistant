"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getJournalEntries, clearJournal } from "@/lib/journal";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function JournalPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const entries = getJournalEntries();
    const messages = entries.flatMap(entry => [
      { role: 'user' as const, content: entry.content }
    ]);
    setMessages(messages);
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
      <button
        onClick={() => {
          clearJournal();
          setMessages([]);
        }}
        className="px-3 py-1 bg-red-600 text-white rounded"
      >
        Clear Journal
      </button>
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
