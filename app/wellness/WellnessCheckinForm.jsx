"use client";

import { useState } from "react";
import { createWellnessCheckin } from "./actions";

const MOODS = [
  { id: "excellent", label: "Excellent", emoji: "😄" },
  { id: "good", label: "Good", emoji: "🙂" },
  { id: "okay", label: "Okay", emoji: "😐" },
  { id: "low", label: "Low", emoji: "😔" },
  { id: "difficult", label: "Difficult", emoji: "😞" },
];

export function WellnessCheckinForm() {
  const [mood, setMood] = useState("");
  const [stress, setStress] = useState(5);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setPending(true);
    const formData = new FormData(e.target);
    const result = await createWellnessCheckin(formData);
    setPending(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Check-in saved." });
    setMood("");
    setStress(5);
    setNotes("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 border-2 border-neutral-200 rounded-lg bg-neutral-50 space-y-4"
    >
      <h2 className="text-lg font-semibold text-neutral-900">New check-in</h2>
      {message && (
        <p
          className={`text-sm ${
            message.type === "error" ? "text-red-600" : "text-green-700"
          }`}
        >
          {message.text}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Mood
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-2 px-3 py-2 border-2 rounded cursor-pointer ${
                mood === m.id
                  ? "border-neutral-900 bg-neutral-100"
                  : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <input
                type="radio"
                name="mood"
                value={m.id}
                checked={mood === m.id}
                onChange={() => setMood(m.id)}
                required
              />
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Stress level (1–10): {stress}
        </label>
        <input
          type="range"
          name="stress"
          min={1}
          max={10}
          value={stress}
          onChange={(e) => setStress(parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border-2 border-neutral-300 rounded focus:border-neutral-500 focus:outline-none"
          rows={2}
          maxLength={2000}
          placeholder="How are you feeling?"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-neutral-900 text-white font-medium rounded hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save check-in"}
      </button>
    </form>
  );
}
