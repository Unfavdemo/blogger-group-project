"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      if (result?.ok) {
        window.location.href = callbackUrl;
        return;
      }
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
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Login</h1>
            <p className="text-neutral-600">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
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

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border-2 border-neutral-300 focus:border-neutral-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 w-4 h-4" />
                <span className="text-sm text-neutral-600">Remember me</span>
              </label>
              <Link
                href="/request-reset"
                className="text-sm text-neutral-700 underline hover:text-neutral-900"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-900 text-white font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-neutral-200">
            <p className="text-center text-sm text-neutral-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-neutral-900 underline font-medium hover:text-neutral-700"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-neutral-100 border border-neutral-300 rounded">
            <p className="text-xs text-neutral-600 mb-2 font-medium">
              Demo Credentials:
            </p>
            <p className="text-xs text-neutral-600">
              Admin: admin@example.com
            </p>
            <p className="text-xs text-neutral-600">
              Editor: editor@example.com
            </p>
            <p className="text-xs text-neutral-600">
              Reader: reader@example.com
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              Password: Admin123!@# (or see README)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
