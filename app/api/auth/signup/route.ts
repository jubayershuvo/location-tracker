import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  hashPassword,
  signToken,
  authCookieOptions,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    let username = normalizedEmail.split("@")[0];
    let existingUsername = await User.findOne({ username });
    if (existingUsername) {
      username = `${username}_${Math.floor(Math.random() * 10000)}`;
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      username,
      password: passwordHash,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      ...authCookieOptions(token),
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
