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
    // Step 1: Get XSRF token from support page
    const pageRes = await fetch("https://www.roblox.com/support", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "Accept": "text/html",
      },
    });
    // Extract CSRF token from page cookies
    const setCookie = pageRes.headers.get("set-cookie") ?? "";
    const csrfMatch = setCookie.match(/GuestData=([^;]+)/);
    // Also try getting it from a POST to get the token header
    const tokenRes = await fetch("https://www.roblox.com/support/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
      },
      body: "{}",
    });
    const xsrfToken = tokenRes.headers.get("x-csrf-token") ?? "";
    console.log("XSRF token:", xsrfToken, "cookie match:", csrfMatch?.[1]?.slice(0, 20));

    // Step 2: Submit appeal
    const res = await fetch("https://www.roblox.com/support/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "Origin": "https://www.roblox.com",
        "Referer": "https://www.roblox.com/support",
        "X-CSRF-TOKEN": xsrfToken,
      },
      body: JSON.stringify({
        username,
        name: username,
        email: inboxEmail,
        ageCategory: "Age13AndOver",
        deviceType: "Pc",
        mainCategory: "AppealDecision",
        subCategory: "AppealAccountV2",
        message: appealText,
        optOutCommunication: false,
      }),
    });

    const body = await res.text();
    console.log("Roblox support response:", res.status, body.slice(0, 300));
    if (res.status === 200 || res.status === 201) return { success: true };
    return { success: false, error: `Roblox ${res.status}: ${body.slice(0, 200)}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
