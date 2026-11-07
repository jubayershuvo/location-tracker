"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Link as LinkIcon, LogOut, Menu, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (mounted) setUser(data.user ?? null);
        } else if (mounted) {
          setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
      }
    }

    void fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignout() {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    setUser(null);
    router.push("/");
  }

  // Hide the navbar on public short-link pages like /mylink.
  // Must stay AFTER all hooks above.
  const appRoutes = ["/", "/links", "/signin", "/signup"];
  const isShortLinkPage =
    /^\/[^/]+$/.test(pathname) && !appRoutes.includes(pathname);

  if (isShortLinkPage) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
            TR
          </span>
          <span className="font-semibold tracking-tight text-white">
            Tracker
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <Home className="mr-1.5 h-4 w-4" /> Home
          </Link>

          {user ? (
            <>
              <Link
                href="/links"
                className="inline-flex items-center text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                <LinkIcon className="mr-1.5 h-4 w-4" /> My Links
              </Link>
              <button
                onClick={handleSignout}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors hover:text-red-400"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-zinc-400 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#09090b] md:hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <span className="font-semibold text-white">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-zinc-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 pt-4">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  href="/links"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  My Links
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    void handleSignout();
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 transition-colors hover:bg-white/5"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </>
            )}

            <p className="px-3 py-2 text-xs text-zinc-500">
              {user ? `Signed in as ${user.name}` : "Not signed in"}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}