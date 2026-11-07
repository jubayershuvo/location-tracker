"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, User, Lock, ArrowRight } from "lucide-react";

export default function SigninPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sign in failed");
      }

      window.location.href = "/links";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Welcome back to your short link dashboard.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Email address
                </label>
                <div className="mt-1 flex items-center">
                  <span className="inline-flex items-center justify-center px-3 text-zinc-500 border-r border-zinc-300 rounded-l-md">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="flex-1 appearance-none block w-full px-3 py-2 border border-zinc-300 rounded-r-md placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-zinc-700">
                    Password
                  </label>
                </div>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-zinc-300 rounded-md placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <Lock className="absolute inset-y-0 right-3 flex items-center text-zinc-500 h-5 w-5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <>
                    <span className="flex items-center justify-center gap-2">
                      <ArrowRight className="h-4 w-4 animate-spin" />
                      Signing in...
                    </span>
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-zinc-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
