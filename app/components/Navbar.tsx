"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Link as LinkIcon, LogOut, User as UserIcon, Menu, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });

        if (res.ok) {
          const data = await res.json();

          if (mounted && data.user) setUser(data.user);
          else if (mounted) setUser(null);
        } else if (mounted) setUser(null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setChecking(false);
      }
    }

    void fetchUser();
    return () => { mounted = false; };
  }, []);

  async function handleSignout() {
    try {
      await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
    } catch { /* ignore */ }
    setUser(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">TR</span>
          <span className="font-semibold text-white tracking-tight">Tracker</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-blue-600 transition-colors">
            <Home className="mr-1.5 h-4 w-4" /> Home
          </Link>
          {user ? (
            <>
              <Link href="/links" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                <LinkIcon className="mr-1.5 h-4 w-4" /> My Links
              </Link>
              <button onClick={handleSignout} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/signin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sign in</Link>
              <Link href="/signup" className="text-sm font-medium text-white bg-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">Sign up</Link>
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button onClick={() => setMobileOpen(true)} className="text-zinc-400 hover:text-white" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-[#09090b]">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <span className="font-semibold text-white">Menu</span>
            <button onClick={() => setMobileOpen(false)} className="text-zinc-500 hover:text-zinc-700" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 px-4 space-y-4 overflow-y-auto">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors">Home</Link>
            {user ? (
              <>
                <Link href="/links" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors">My Links</Link>
                <button onClick={() => { setMobileOpen(false); void handleSignout(); }} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-white/5 rounded-lg transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/signin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors">Sign in</Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-white bg-blue-600 text-center rounded-lg hover:bg-blue-700 transition-colors">Sign up</Link>
              </>
            )}
            <p className="px-3 py-2 text-xs text-zinc-500">{user ? `Signed in as ${user.name}` : "Not signed in"}</p>
          </div>
        </div>
      )}
    </header>
  );
}
