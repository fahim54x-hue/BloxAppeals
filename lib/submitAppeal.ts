import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitAppeal(
  username: string,
  email: string,
  appealText: string,
  _appPassword?: string
): Promise<{ success: boolean; error?: string }> {
  // Try Resend first (works on Vercel, no SMTP needed)
  if (process.env.RESEND_API_KEY) {
    const result = await submitViaResend(username, email, appealText);
    if (result.success) return result;
  }
  // Fallback: Zendesk API
  return submitViaZendesk(username, email, appealText);
}

async function submitViaResend(
  username: string,
  email: string,
  appealText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: "BloxAppeal <appeals@bloxappeal.vercel.app>",
      to: "appeals@roblox.com",
      replyTo: email,
      subject: `Ban Appeal - ${username}`,
      text: appealText,
    });
    if (error) {
      console.error("Resend submit error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("Resend submit failed:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

async function submitViaZendesk(
  username: string,
  email: string,
  appealText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("https://en.help.roblox.com/api/v2/requests.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "Origin": "https://en.help.roblox.com",
        "Referer": "https://en.help.roblox.com/hc/en-us/requests/new?ticket_form_id=360000080263",
      },
      body: JSON.stringify({
        request: {
          requester: { name: username, email },
          subject: `Ban Appeal - ${username}`,
          comment: { body: appealText },
          ticket_form_id: 360000080263,
          custom_fields: [
            { id: 360023452491, value: "computer" },
            { id: 360023452571, value: "moderation_appeal" },
            { id: 360023452611, value: "account_ban" },
            { id: 21238230, value: username },
            { id: 25328106, value: "https://www.roblox.com" },
          ],
        },
      }),
    });

    const body = await res.text();
    console.log("Zendesk submit response:", res.status, body.slice(0, 400));
    if (res.status === 201 || res.status === 200) return { success: true };
    return { success: false, error: `Status ${res.status}: ${body.slice(0, 200)}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
