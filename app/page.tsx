import Link from "next/link";
import { Link2, MapPin, BarChart3, UserPlus } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create an account", text: "Sign up and log in to your dashboard." },
  { icon: Link2, title: "Create a short link", text: "Pick a destination URL and a custom name, then share it." },
  { icon: MapPin, title: "Visitors allow location", text: "Anyone opening your link is asked to share their location first." },
  { icon: BarChart3, title: "See where they are", text: "View every visitor's location on your dashboard and on a map." },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#09090b] px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Short links that show <span className="text-blue-400">where visitors are</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-zinc-400">
          Create a custom short link, share it, and see the locations of the
          people who open it — with their permission.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500">
            Get started
          </Link>
          <Link href="/signin" className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold transition hover:bg-white/5">
            Sign in
          </Link>
        </div>

        <div className="mt-16 grid gap-3 text-left sm:grid-cols-2">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-[#111114] p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                <Icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold">{i + 1}. {title}</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
