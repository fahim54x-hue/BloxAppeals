export async function submitAppeal(
  username: string,
  email: string,
  appealText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Roblox uses Zendesk at customercare.roblox.com
    const res = await fetch("https://customercare.roblox.com/api/v2/requests.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Origin": "https://www.roblox.com",
        "Referer": "https://www.roblox.com/support",
      },
      body: JSON.stringify({
        request: {
          requester: { name: username, email },
          subject: `Ban Appeal - ${username}`,
          comment: { body: appealText },
          custom_fields: [
            { id: 360023452571, value: "account_moderation_appeal" }, // issue type
          ],
        },
      }),
    });

    if (res.status >= 500) {
      return { success: false, error: `Server error: ${res.status}` };
    }

    // 201 = created, 200 = ok
    if (res.status === 201 || res.status === 200) {
      return { success: true };
    }

    const body = await res.text();
    return { success: false, error: `Unexpected status ${res.status}: ${body.slice(0, 100)}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
