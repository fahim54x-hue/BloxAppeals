import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import db from "@/lib/db";
import { submitAppeal } from "@/lib/submitAppeal";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateAppeal(username: string, extraInfo: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Write a professional and polite Roblox ban appeal letter for:
- Roblox Username: ${username}
- Ban Type: Enforcement ban (account linking / ban evasion false positive)
- Additional Info: ${extraInfo || "None"}

The appeal should:
- Be respectful and sincere
- Clearly state the account was flagged incorrectly by Roblox's automated system
- Explain this is a false positive with no connection to any banned account
- Request a manual review by a human moderator
- Be concise (3-4 paragraphs), unique each time
- No subject line, just the body`,
      },
    ],
    max_tokens: 500,
  });
  return response.choices[0].message.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const { username, email, appPassword, extraInfo } = await req.json();

    if (!username || !email) {
      return NextResponse.json({ error: "Username and email are required" }, { status: 400 });
    }

    // Save to DB
    const insert = db.prepare(
      "INSERT INTO appeals (username, email, app_password, extra_info, status, attempts, last_attempt) VALUES (?, ?, ?, ?, 'pending', 0, ?)"
    );
    const result = insert.run(username, email, appPassword ?? "", extraInfo ?? "", Date.now());
    const appealId = result.lastInsertRowid;

    // Generate appeal text
    const appealText = await generateAppeal(username, extraInfo ?? "");

    // Submit to Roblox
    const submission = await submitAppeal(username, email, appealText);

    // Update DB
    const update = db.prepare(
      "UPDATE appeals SET status = ?, attempts = attempts + 1, last_attempt = ? WHERE id = ?"
    );
    update.run(submission.success ? "submitted" : "failed", Date.now(), appealId);

    if (!submission.success) {
      return NextResponse.json({
        success: false,
        appealId,
        appealText,
        error: submission.error,
        message: "Appeal generated but auto-submit failed. Copy the letter and submit manually.",
      });
    }

    return NextResponse.json({
      success: true,
      appealId,
      appealText,
      message: "Appeal submitted to Roblox successfully.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
