import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { username, banReason, extraInfo } = await req.json();

    if (!username || !banReason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `Write a professional and polite Roblox ban appeal letter for a user with the following details:
- Roblox Username: ${username}
- Ban Reason: ${banReason} (enforcement ban / account linking)
- Additional Info: ${extraInfo || "None provided"}

The appeal should:
- Be respectful and sincere
- Clearly state the account was flagged incorrectly by Roblox's automated system
- Explain this is a false positive — the account has no connection to any banned account
- Request a manual review by a human moderator
- Be concise (3-4 paragraphs)
- No subject line, just the body of the letter`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const appeal = response.choices[0].message.content;
    return NextResponse.json({ appeal });
  } catch (err: unknown) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
