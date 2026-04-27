import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tasks = await db.studyTask.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch study tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { subject, title, description, dayOfWeek } = await req.json();
    const task = await db.studyTask.create({
      data: { subject, title, description, dayOfWeek, completed: false },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create study task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
