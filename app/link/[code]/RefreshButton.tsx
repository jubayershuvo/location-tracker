"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";

export default function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
      Refresh
    </button>
  );
}
