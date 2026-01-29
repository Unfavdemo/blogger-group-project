"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestResetPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-neutral-300 p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Reset Password
            </h1>
            <p className="text-neutral-600">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-neutral-300 focus:border-neutral-500 focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-neutral-900 text-white font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
              If an account exists for that email, you&apos;ll receive reset
              instructions shortly. Check your inbox (and spam).
            </div>
          )}

          <div className="mt-6 pt-6 border-t-2 border-neutral-200">
            <Link
              href="/login"
              className="text-sm text-neutral-700 underline hover:text-neutral-900"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
