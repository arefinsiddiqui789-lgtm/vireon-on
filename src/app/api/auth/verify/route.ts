import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ success: false, reason: "no-token" }, { status: 400 });
    }

    // Find the verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json({ success: false, reason: "invalid-token" }, { status: 400 });
    }

    // Check if token expired
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await db.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json({ success: false, reason: "token-expired" }, { status: 400 });
    }

    // Find user by email (identifier)
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json({ success: false, reason: "user-not-found" }, { status: 404 });
    }

    if (user.emailVerified) {
      // Already verified, just clean up token
      await db.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    // Verify the user
    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Clean up used token
    await db.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, reason: "server-error" },
      { status: 500 }
    );
  }
}
