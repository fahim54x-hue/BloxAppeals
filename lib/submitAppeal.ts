import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_SECRET_KEY,
  },
});

export async function submitAppeal(
  username: string,
  email: string,
  appealText: string,
  _appPassword?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.sendMail({
      from: `"BloxAppeal" <${process.env.MAILJET_SENDER ?? "appeals@bloxappeal.vercel.app"}>`,
      to: "appeals@roblox.com",
      replyTo: email,
      subject: `Ban Appeal - ${username}`,
      text: appealText,
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Mailjet SMTP failed:", msg);
    return { success: false, error: msg };
  }
}
