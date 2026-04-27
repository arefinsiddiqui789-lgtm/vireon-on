import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      // User exists but not verified — resend verification
      const token = randomUUID();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Delete old tokens for this email
      await db.verificationToken.deleteMany({
        where: { identifier: email.toLowerCase() },
      });

      await db.verificationToken.create({
        data: {
          identifier: email.toLowerCase(),
          token,
          expires,
        },
      });

      // Update the user's name and password in case they changed
      const hashedPassword = await bcrypt.hash(password, 12);
      await db.user.update({
        where: { email: email.toLowerCase() },
        data: { name, password: hashedPassword },
      });

      // Return relative path so the frontend can fetch it (works in sandbox)
      const verifyPath = `/api/auth/verify?token=${token}`;

      return NextResponse.json({
        message: "Verification email sent! Please check your inbox.",
        verifyPath,
        email: email.toLowerCase(),
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // Create verification token
    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Return relative path so the frontend can fetch it (works in sandbox)
    const verifyPath = `/api/auth/verify?token=${token}`;

    return NextResponse.json({
      message: "Account created! Please check your email to verify your account.",
      verifyPath,
      email: user.email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
