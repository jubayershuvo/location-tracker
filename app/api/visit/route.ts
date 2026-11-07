import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShortLink from "@/models/ShortLink";
import Visit from "@/models/Visit";
import { CODE_REGEX } from "@/lib/codes";
import { detectDevice, reverseGeocode } from "@/lib/geo";

// Tiny in-memory rate limit (per server instance): 20 requests / minute / IP.
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }

  entry.count += 1;
  return entry.count > 20;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (rateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: "Too many requests" },
        { status: 429 }
      );
    }

    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { success: false, message: "Invalid body" },
        { status: 400 }
      );
    }

    const { code, latitude, longitude, accuracy } = body as Record<
      string,
      unknown
    >;

    if (
      typeof code !== "string" ||
      code.length > 80 ||
      !CODE_REGEX.test(code)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid code" },
        { status: 400 }
      );
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid coordinates" },
        { status: 400 }
      );
    }

    await connectDB();

    const link = await ShortLink.findOne({
      code: code.toLowerCase(),
      isActive: true,
    })
      .select("_id code")
      .lean();

    if (!link) {
      return NextResponse.json(
        { success: false, message: "Link not found" },
        { status: 404 }
      );
    }

    const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 300);

    const visit = await Visit.create({
      linkId: link._id,
      code: link.code,
      latitude,
      longitude,
      accuracy:
        typeof accuracy === "number" && Number.isFinite(accuracy)
          ? Math.min(Math.max(accuracy, 0), 100000)
          : 0,
      device: detectDevice(userAgent),
      userAgent,
    });

    // Resolve a readable place name without delaying the visitor's redirect.
    after(async () => {
      const place = await reverseGeocode(latitude, longitude);
      if (place) await Visit.updateOne({ _id: visit._id }, { place });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visit API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
