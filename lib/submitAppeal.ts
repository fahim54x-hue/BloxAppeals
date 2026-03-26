const MAILSLURP_API_KEY = process.env.MAILSLURP_API_KEY!;
const BASE = "https://api.mailslurp.com";

export async function createInbox(): Promise<{ id: string; emailAddress: string }> {
  const res = await fetch(`${BASE}/inboxes`, {
    method: "POST",
    headers: { "x-api-key": MAILSLURP_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 2592000000 }), // 30 days
  });
  if (!res.ok) throw new Error(`MailSlurp create inbox failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { id: data.id, emailAddress: data.emailAddress };
}

export async function checkInboxForReply(
  inboxId: string
): Promise<"approved" | "rejected" | "pending"> {
  try {
    const res = await fetch(`${BASE}/emails?inboxId=${inboxId}&size=10&sort=DESC`, {
      headers: { "x-api-key": MAILSLURP_API_KEY },
    });
    if (!res.ok) return "pending";
    const data = await res.json();
    const emails = data.content ?? [];
    if (emails.length === 0) return "pending";

    for (const email of emails) {
      const emailRes = await fetch(`${BASE}/emails/${email.id}`, {
        headers: { "x-api-key": MAILSLURP_API_KEY },
      });
      if (!emailRes.ok) continue;
      const full = await emailRes.json();
      const text = ((full.body ?? "") + " " + (full.subject ?? "")).toLowerCase();

      if (
        text.includes("has been restored") ||
        text.includes("has been unbanned") ||
        text.includes("appeal has been approved") ||
        text.includes("account has been unlocked") ||
        text.includes("moderation has been lifted") ||
        text.includes("your account is now") ||
        text.includes("reinstated")
      ) return "approved";

      if (
        text.includes("will not be reversed") ||
        text.includes("appeal has been denied") ||
        text.includes("moderation will stand") ||
        text.includes("unable to reverse") ||
        text.includes("decision is final") ||
        text.includes("not eligible for an appeal") ||
        text.includes("does not qualify")
      ) return "rejected";
    }
    return "pending";
  } catch (err) {
    console.error("MailSlurp check failed:", err);
    return "pending";
  }
}

export async function submitAppeal(
  username: string,
  inboxEmail: string,
  appealText: string,
): Promise<{ success: boolean; error?: string }> {
  try {
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
          requester: { name: username, email: inboxEmail },
          subject: `Ban Appeal - ${username}`,
          comment: { body: appealText },
          ticket_form_id: 114094170887,
          custom_fields: [
            { id: 360023452491, value: "computer" },
            { id: 360023452571, value: "account_moderation" },
            { id: 360023452611, value: "appeal_account_moderation" },
            { id: 21238230, value: username },
            { id: 25328106, value: "https://www.roblox.com" },
            { id: 21633601987476, value: "0" },
          ],
        },
      }),
    });
    const body = await res.text();
    console.log("Zendesk response:", res.status, body.slice(0, 300));
    if (res.status === 201 || res.status === 200) return { success: true };
    return { success: false, error: `Zendesk ${res.status}: ${body.slice(0, 200)}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
