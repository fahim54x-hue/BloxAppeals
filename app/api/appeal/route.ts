import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import sql, { initDb } from "@/lib/db";
import { submitAppeal } from "@/lib/submitAppeal";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateAppeal(username: string, extraInfo: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{
      role: "user",
      content: `Write a professional and polite Roblox ban appeal letter for:
- Roblox Username: ${username}
- Ban Type: Enforcement ban (account linking / ban evasion false positive)
- Additional Info: ${extraInfo || "None"}

Requirements:
- Exactly 271 words (count carefully)
- Respectful and sincere tone
- Clearly state the account was flagged incorrectly by Roblox's automated system
- Explain this is a false positive with no connection to any banned account
- Request a manual review by a human moderator
- Make it unique each time
- No subject line, just the body`,
    }],
    max_tokens: 500,
  });
  return response.choices[0].message.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { username, email, appPassword, extraInfo } = await req.json();

    if (!username || !email) {
      return NextResponse.json({ error: "Username and email are required" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO appeals (username, email, app_password, extra_info, status, attempts, last_attempt)
      VALUES (${username}, ${email}, ${appPassword ?? ""}, ${extraInfo ?? ""}, 'pending', 0, ${Date.now()})
      RETURNING id
    `;
    const appealId = rows[0].id;

    const appealText = await generateAppeal(username, extraInfo ?? "");
    const submission = await submitAppeal(username, email, appealText);

    await sql`
      UPDATE appeals SET status = ${submission.success ? "submitted" : "failed"},
      attempts = 1, last_attempt = ${Date.now()} WHERE id = ${appealId}
    `;

    return NextResponse.json({
      success: submission.success,
      appealId,
      appealText,
      message: submission.success
        ? "Appeal submitted to Roblox successfully."
        : "Appeal generated but auto-submit failed. Copy the letter and submit manually.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
