"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import Link from "next/link";

export default function BalancePage() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored = localStorage.getItem("progress");
    if (stored) setProgress(JSON.parse(stored));
  }, []);

  const data = Object.entries(progress).map(([area, value]) => ({
    area,
    value,
  }));

  if (data.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <p>No progress recorded yet.</p>
        <Link href="/">Back to chat</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col items-center p-4">
      <h1 className="text-xl font-bold">Balance Wheel</h1>
      <div role="img" aria-label="Progress across focus areas">
        <RadarChart width={300} height={300} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="area" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="progress"
            dataKey="value"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.6}
          />
        </RadarChart>
      </div>
      <Link href="/" className="text-blue-600 hover:underline">
        Back to chat
      </Link>
    </div>
  );
}
