import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitAppeal(
  username: string,
  email: string,
  appealText: string,
  _appPassword?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: "BloxAppeal <onboarding@resend.dev>",
      to: "appeals@roblox.com",
      replyTo: email,
      subject: `Ban Appeal - ${username}`,
      text: appealText,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: `Resend: ${error.message}` };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Resend failed:", msg);
    return { success: false, error: msg };
  }
}
