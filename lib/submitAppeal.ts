import nodemailer from "nodemailer";

export async function submitAppeal(
  username: string,
  email: string,
  appealText: string,
  appPassword?: string
): Promise<{ success: boolean; error?: string }> {
  if (!appPassword) return { success: false, error: "No app password provided" };
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: email, pass: appPassword.replace(/\s/g, "") },
    });
    await transporter.sendMail({
      from: `"${username}" <${email}>`,
      to: "appeals@roblox.com",
      subject: `Ban Appeal - ${username}`,
      text: appealText,
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Gmail SMTP failed:", msg);
    return { success: false, error: msg };
  }
}
