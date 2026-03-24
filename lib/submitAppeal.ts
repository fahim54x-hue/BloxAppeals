export async function submitAppeal(
  username: string,
  email: string,
  appealText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("https://en.help.roblox.com/api/v2/requests.json", {
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
          subject: `Appeal for ${username}`,
          comment: { body: appealText },
          ticket_form_id: 360000080263,
          custom_fields: [
            { id: 360023452571, value: "account_moderation_appeal" },
            { id: 360023452591, value: username },
          ],
        },
      }),
    });

    const body = await res.text();
    console.error("Roblox submit response:", res.status, body.slice(0, 300));

    if (res.status === 201 || res.status === 200) return { success: true };
    return { success: false, error: `Status ${res.status}: ${body.slice(0, 150)}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
