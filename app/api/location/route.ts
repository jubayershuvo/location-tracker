import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Location from "@/models/Location";



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      latitude,
      longitude,
      accuracy,
      altitude,
      speed,
      heading,
      timestamp,
    } = body;

    if (
      typeof userId !== "string" ||
      !userId.trim() ||
      userId.length > 100
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
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
        { success: false, error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    const recordedAt =
      typeof timestamp === "number" &&
      Number.isFinite(timestamp) &&
      Math.abs(Date.now() - timestamp) < 86400000
        ? new Date(timestamp)
        : new Date();

    await connectDB();

    const location = await Location.create({
      userId: userId.trim(),
      latitude,
      longitude,
      accuracy: typeof accuracy === "number" ? accuracy : 0,
      altitude: typeof altitude === "number" ? altitude : null,
      speed: typeof speed === "number" ? speed : null,
      heading: typeof heading === "number" ? heading : null,
      recordedAt,
    });

    return NextResponse.json({
      success: true,
      message: "Location saved",
      data: location,
    });
  } catch (error) {
    console.error("Location API error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId || userId.length > 100) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const history = request.nextUrl.searchParams.get("history") === "true";

    if (history) {
      const limit = Math.min(
        Math.max(
          Number(request.nextUrl.searchParams.get("limit")) || 100,
          1
        ),
        1000
      );

      const locations = await Location.find({ userId })
        .sort({ recordedAt: -1 })
        .limit(limit)
        .lean();

      return NextResponse.json({
        success: true,
        count: locations.length,
        data: locations,
      });
    }

    const location = await Location.findOne({ userId })
      .sort({ recordedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Location GET error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}