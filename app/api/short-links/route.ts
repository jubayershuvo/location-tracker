import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import ShortLink from "@/models/ShortLink";
import Visit from "@/models/Visit";
import { authenticateRequest } from "@/lib/auth";
import { isValidCode } from "@/lib/codes";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getUserId(request: NextRequest): string | null {
  const payload = authenticateRequest(request);
  return payload ? payload.userId : null;
}

const unauthorized = () =>
  NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401 }
  );

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return unauthorized();

  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("url" in body) ||
      !("code" in body) ||
      typeof body.url !== "string" ||
      typeof body.code !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "URL and name are required" },
        { status: 400 }
      );
    }

    const url = body.url.trim();
    const code = body.code.trim().toLowerCase();

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid HTTP or HTTPS URL" },
        { status: 400 }
      );
    }

    if (!isValidCode(code)) {
      return NextResponse.json(
        { success: false, message: "Invalid or reserved link name" },
        { status: 400 }
      );
    }

    await connectDB();

    if (await ShortLink.findOne({ code })) {
      return NextResponse.json(
        { success: false, message: "This link name is already taken" },
        { status: 409 }
      );
    }

    const link = await ShortLink.create({ code, url, userId });

    return NextResponse.json(
      {
        success: true,
        message: "Short link created successfully",
        link: {
          ...link.toObject(),
          shortUrl: `${request.nextUrl.origin}/${code}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "This link name is already taken" },
        { status: 409 }
      );
    }

    console.error("Create short link error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return unauthorized();

  try {
    await connectDB();

    const links = await ShortLink.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const withVisits = await Promise.all(
      links.map(async (link) => {
        const [visitCount, recentVisits] = await Promise.all([
          Visit.countDocuments({ linkId: link._id }),
          Visit.find({ linkId: link._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("latitude longitude accuracy place device createdAt")
            .lean(),
        ]);

        return {
          ...link,
          shortUrl: `${request.nextUrl.origin}/${link.code}`,
          visitCount,
          recentVisits,
        };
      })
    );

    return NextResponse.json({ success: true, links: withVisits });
  } catch (error) {
    console.error("Get short links error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return unauthorized();

  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid link id" },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await ShortLink.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Link not found" },
        { status: 404 }
      );
    }

    await Visit.deleteMany({ linkId: deleted._id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete short link error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
