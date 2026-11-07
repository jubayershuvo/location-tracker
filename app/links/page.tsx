
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Link2,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
  AlertCircle,
  Globe,
  ArrowUpRight,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";

interface ShortLink {
  _id: string;
  code: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  shortUrl: string;
  visitCount: number;
  recentVisits: {
    _id: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    place: string;
    device: string;
    createdAt: string;
  }[];
}

export default function LinksPage() {
  const [url, setUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [links, setLinks] = useState<ShortLink[]>([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadLinks = useCallback(async () => {
    try {
      setFetching(true);

      const response = await fetch("/api/short-links", {
        cache: "no-store",
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load short links");
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "links" in data &&
        Array.isArray(data.links)
      ) {
        setLinks(data.links as ShortLink[]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load links"
      );
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const trimmedUrl = url.trim();
    const trimmedName = customName.trim();

    if (!trimmedUrl || !trimmedName) {
      setError("Please enter both destination URL and custom name.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/short-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: trimmedUrl,
          code: trimmedName,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Failed to create short link";

        throw new Error(message);
      }

      setUrl("");
      setCustomName("");
      setSuccess("Short link created successfully!");

      await loadLinks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(link: ShortLink) {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopiedId(link._id);

      window.setTimeout(() => {
        setCopiedId((current) =>
          current === link._id ? null : current
        );
      }, 2000);
    } catch {
      setError("Failed to copy link.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this link?")) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      const response = await fetch(`/api/short-links?id=${id}`, {
        method: "DELETE",
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Failed to delete link";

        throw new Error(message);
      }

      setLinks((current) => current.filter((link) => link._id !== id));
      setSuccess("Short link deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete link"
      );
    } finally {
      setDeletingId(null);
    }
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <Link2 className="h-6 w-6 text-blue-400" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Short Links
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Create short links and see where your visitors are.
          </p>
        </div>

        {/* Create Link */}
        <section className="rounded-2xl border border-white/10 bg-[#111114] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <Plus className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <h2 className="font-semibold">Create a new link</h2>
              <p className="text-xs text-zinc-500">
                Enter your destination URL and custom name.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            {/* Destination URL */}
            <div>
              <label
                htmlFor="destination-url"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Destination URL
              </label>

              <div className="relative">
                <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                <input
                  id="destination-url"
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Custom Name */}
            <div>
              <label
                htmlFor="custom-name"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Custom link name
              </label>

              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/30 transition focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/10">
                <span className="flex shrink-0 items-center border-r border-white/10 px-3 text-xs text-zinc-500 sm:px-4">
                  {origin}/
                </span>

                <input
                  id="custom-name"
                  type="text"
                  required
                  value={customName}
                  onChange={(e) =>
                    setCustomName(
                      e.target.value.replace(/[^a-zA-Z0-9._-]/g, "")
                    )
                  }
                  placeholder="video.mp4"
                  maxLength={80}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-zinc-600"
                />
              </div>

              <p className="mt-2 text-xs text-zinc-500">
                Letters, numbers, dots, hyphens and underscores are allowed.
              </p>
            </div>

            {/* Preview */}
            {customName && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                <p className="mb-1 text-xs text-zinc-500">
                  Short link preview
                </p>
                <p className="break-all text-sm font-medium text-blue-400">
                  {origin}/{customName}
                </p>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !url.trim() || !customName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating link...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create short link
                </>
              )}
            </button>
          </form>
        </section>

        {/* Links List */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your links</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {links.length} {links.length === 1 ? "link" : "links"} created
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadLinks()}
              disabled={fetching}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 disabled:opacity-50"
            >
              {fetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-[#111114] py-16">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          ) : links.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111114] px-5 py-16 text-center">
              <Link2 className="mx-auto mb-4 h-9 w-9 text-zinc-600" />

              <h3 className="font-medium text-zinc-300">
                No short links yet
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Create your first custom short link above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <article
                  key={link._id}
                  className="rounded-2xl border border-white/10 bg-[#111114] p-4 transition hover:border-white/20 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Link2 className="h-4 w-4 shrink-0 text-blue-400" />

                        <h3 className="break-all font-semibold text-blue-400">
                          {link.shortUrl}
                        </h3>
                      </div>

                      <p className="mb-2 flex items-center gap-1.5 break-all text-xs text-zinc-500">
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                        {link.url}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                        <span>
                          {new Date(link.createdAt).toLocaleDateString()}
                        </span>

                        <span>•</span>

                        <span
                          className={
                            link.isActive
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {link.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleCopy(link)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 sm:flex-none"
                      >
                        {copiedId === link._id ? (
                          <>
                            <Check className="h-4 w-4 text-green-400" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>

                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open short link"
                        className="flex items-center justify-center rounded-lg border border-white/10 p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => void handleDelete(link._id)}
                        disabled={deletingId === link._id}
                        aria-label="Delete short link"
                        className="flex items-center justify-center rounded-lg border border-red-500/20 p-2.5 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === link._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Visitor locations */}
                  <div className="mt-4 border-t border-white/5 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                        <Users className="h-3.5 w-3.5" />
                        {link.visitCount}{" "}
                        {link.visitCount === 1 ? "visitor" : "visitors"}
                      </p>

                      <Link
                        href={`/link/${link.code}`}
                        className="text-xs font-medium text-blue-400 hover:underline"
                      >
                        View all locations &rarr;
                      </Link>
                    </div>

                    {link.recentVisits.length === 0 ? (
                      <p className="text-xs text-zinc-600">
                        No visitor locations yet.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {link.recentVisits.map((v) => (
                          <li
                            key={v._id}
                            className="flex flex-wrap items-center justify-between gap-x-3 text-xs"
                          >
                            <span className="flex min-w-0 items-center gap-1.5 text-zinc-300">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                              <a
                                href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="break-words hover:underline"
                              >
                                {v.place ||
                                  `${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)}`}
                              </a>
                            </span>
                            <span className="text-zinc-600">
                              {new Date(v.createdAt).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/10 pt-5 text-center text-xs text-zinc-600">
          Custom URL Shortener
        </footer>
      </div>
    </main>
  );
}
