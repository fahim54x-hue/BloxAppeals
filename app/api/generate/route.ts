import { NextRequest, NextResponse } from "next/server";
import { generateAppeal } from "@/app/api/appeal/route";

export async function POST(req: NextRequest) {
  try {
    const { username, extraInfo } = await req.json();
    if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });
    const appealText = await generateAppeal(username, extraInfo ?? "");
    return NextResponse.json({ appealText });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
