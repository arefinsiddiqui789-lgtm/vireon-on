import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const exercises = await db.gymExercise.findMany({
      orderBy: { createdAt: "desc" },
    });
    const logs = await db.gymLog.findMany();
    return NextResponse.json({ exercises, logs });
  } catch (error) {
    console.error("Failed to fetch gym data:", error);
    return NextResponse.json(
      { error: "Failed to fetch gym data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, sets, reps, dayOfWeek } = await req.json();
    const exercise = await db.gymExercise.create({
      data: { name, sets, reps, dayOfWeek, completed: false },
    });
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Failed to create exercise:", error);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
