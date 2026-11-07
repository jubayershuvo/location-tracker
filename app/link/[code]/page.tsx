import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin, Users, Clock } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import { verifyTokenFromCookie } from "@/lib/auth";
import { CODE_REGEX } from "@/lib/codes";
import ShortLink from "@/models/ShortLink";
import Visit from "@/models/Visit";
import VisitorMap, { type MapPoint } from "./VisitorMap";
import RefreshButton from "./RefreshButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function LinkDetailPage({ params }: Props) {
  const { code } = await params;

  const cookieStore = await cookies();
  const session = verifyTokenFromCookie(cookieStore.get("token")?.value);

  if (!session) redirect("/signin");

  if (code.length > 80 || !CODE_REGEX.test(code)) notFound();

  await connectDB();

  // Only the owner can open this page.
  const link = await ShortLink.findOne({
    code: code.toLowerCase(),
    userId: session.userId,
  }).lean();

  if (!link) notFound();

  const [total, visits] = await Promise.all([
    Visit.countDocuments({ linkId: link._id }),
    Visit.find({ linkId: link._id })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean(),
  ]);

  const points: MapPoint[] = visits.map((v) => ({
    id: String(v._id),
    latitude: v.latitude,
    longitude: v.longitude,
    label: `${v.place || `${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)}`}<br/>${new Date(
      v.createdAt
    ).toLocaleString("en-GB", { timeZone: "UTC" })} UTC`,
  }));

  const lastVisit = visits[0]?.createdAt;

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/links"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my links
        </Link>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="break-all text-2xl font-bold tracking-tight text-blue-400">
              /{link.code}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 break-all text-xs text-zinc-500">
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
              {link.url}
            </p>
          </div>
          <RefreshButton />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Users className="h-4 w-4" /> Total visitors
            </div>
            <p className="mt-2 text-2xl font-semibold">{total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="h-4 w-4" /> Last visit
            </div>
            <p className="mt-2 text-sm font-medium">
              {lastVisit
                ? new Date(lastVisit).toLocaleString("en-GB", {
                    timeZone: "UTC",
                  }) + " UTC"
                : "No visits yet"}
            </p>
          </div>
        </div>

        {visits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#111114] px-5 py-16 text-center">
            <MapPin className="mx-auto mb-4 h-9 w-9 text-zinc-600" />
            <h3 className="font-medium text-zinc-300">No visitor locations yet</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Share your link — locations appear here once visitors allow
              location access.
            </p>
          </div>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-white/10 bg-[#111114] p-4">
              <h2 className="mb-3 text-sm font-semibold">Visitor map</h2>
              <VisitorMap points={points} />
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#111114] p-4">
              <h2 className="mb-3 text-sm font-semibold">
                Visitor locations{" "}
                <span className="font-normal text-zinc-500">
                  (showing {visits.length} of {total})
                </span>
              </h2>

              <ul className="divide-y divide-white/5">
                {visits.map((v) => (
                  <li
                    key={String(v._id)}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
                        <span className="break-words">
                          {v.place || "Location saved"}
                        </span>
                      </p>
                      <p className="mt-1 pl-6 text-xs text-zinc-500">
                        {v.latitude.toFixed(5)}, {v.longitude.toFixed(5)}
                        {v.accuracy ? ` · ±${Math.round(v.accuracy)} m` : ""}
                        {v.device ? ` · ${v.device}` : ""} ·{" "}
                        {new Date(v.createdAt).toLocaleString("en-GB", {
                          timeZone: "UTC",
                        })}{" "}
                        UTC
                      </p>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Open in Maps
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
