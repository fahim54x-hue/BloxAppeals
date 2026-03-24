import nodemailer from "nodemailer";

export async function submitAppeal(
  username: string,
  email: string,
  appealText: string,
  appPassword?: string
): Promise<{ success: boolean; error?: string }> {
  // If we have the user's Gmail app password, send via their Gmail
  // Otherwise fall back to Zendesk API
  if (appPassword) {
    return submitViaEmail(username, email, appealText, appPassword);
  }
  return submitViaZendesk(username, email, appealText);
}

async function submitViaEmail(
  username: string,
  email: string,
  appealText: string,
  appPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: email, pass: appPassword },
    });

    await transporter.sendMail({
      from: `"${username}" <${email}>`,
      to: "appeals@roblox.com",
      subject: `Ban Appeal - ${username}`,
      text: appealText,
    });

    return { success: true };
  } catch (err) {
    console.error("Email submit failed:", err);
    // Fall back to Zendesk if email fails
    return submitViaZendesk(username, email, appealText);
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
