import nodemailer from "nodemailer";

export async function submitAppeal(
  username: string,
  email: string,
  appealText: string,
  appPassword?: string
): Promise<{ success: boolean; error?: string }> {
  // Try Gmail SMTP first
  if (appPassword) {
    const result = await submitViaGmail(username, email, appealText, appPassword);
    if (result.success) return result;
    console.log("Gmail SMTP failed, trying Zendesk:", result.error);
  }
  return submitViaZendesk(username, email, appealText);
}

async function submitViaGmail(
  username: string,
  email: string,
  appealText: string,
  appPassword: string
): Promise<{ success: boolean; error?: string }> {
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
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function submitViaZendesk(
  username: string,
  email: string,
  appealText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use the moderation appeal form (ticket_form_id: 360000080263)
    // with only the required fields to avoid billing routing
    const res = await fetch("https://en.help.roblox.com/api/v2/requests.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "Origin": "https://en.help.roblox.com",
        "Referer": "https://en.help.roblox.com/hc/en-us/requests/new",
      },
      body: JSON.stringify({
        request: {
          requester: { name: username, email },
          subject: `Ban Appeal - ${username}`,
          comment: { body: appealText },
        },
      }),
    });

    const body = await res.text();
    console.log("Zendesk response:", res.status, body.slice(0, 400));
    if (res.status === 201 || res.status === 200) return { success: true };
    return { success: false, error: `Zendesk ${res.status}: ${body.slice(0, 200)}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
