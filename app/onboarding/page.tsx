"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const areas = [
  "Relationships",
  "Health",
  "Self-Esteem",
  "Family Dynamics",
  "Career",
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<string>("English");
  const [focus, setFocus] = useState<string[]>([]);

  const totalSteps = 2;

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    const savedFocus = localStorage.getItem("focusAreas");
    if (savedLang) setLanguage(savedLang);
    if (savedFocus) setFocus(JSON.parse(savedFocus));
  }, []);

  function toggle(area: string) {
    setFocus((f) =>
      f.includes(area) ? f.filter((a) => a !== area) : [...f, area]
    );
  }

  function next() {
    if (step === 1) {
      localStorage.setItem("language", language);
      setStep(2);
    } else {
      if (focus.length === 0) {
        toast.error("Please select at least one focus area.");
        return;
      }
      localStorage.setItem("focusAreas", JSON.stringify(focus));
      const progress: Record<string, number> = {};
      for (const area of focus) progress[area] = 0;
      localStorage.setItem("progress", JSON.stringify(progress));
      router.push("/");
    }
  }

  function back() {
    if (step === 2) setStep(1);
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <progress value={step} max={totalSteps} className="w-full h-2" />
      {step === 1 && (
        <>
          <h1 className="text-xl font-bold text-center">Choose language</h1>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="lang"
                checked={language === "English"}
                onChange={() => setLanguage("English")}
              />
              English
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="lang"
                checked={language === "Arabic"}
                onChange={() => setLanguage("Arabic")}
              />
              Arabic
            </label>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-xl font-bold text-center">Select focus areas</h1>
          <div className="flex flex-col gap-2">
            {areas.map((area) => (
              <label key={area} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={focus.includes(area)}
                  onChange={() => toggle(area)}
                />
                {area}
              </label>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-2">
        {step === 2 && (
          <button
            onClick={back}
            className="p-2 w-24 rounded border border-black dark:border-white"
          >
            Back
          </button>
        )}
        <button
          onClick={next}
          className="flex-1 p-2 bg-black text-white rounded"
        >
          {step === 1 ? "Next" : "Finish"}
        </button>
      </div>
    </div>
  );
}
