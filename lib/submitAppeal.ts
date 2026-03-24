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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "Origin": "https://en.help.roblox.com",
        "Referer": "https://en.help.roblox.com/hc/en-us/requests/new?ticket_form_id=360000080263",
      },
      body: JSON.stringify({
        request: {
          requester: { name: username, email },
          subject: `Account Ban Appeal - ${username}`,
          comment: { body: appealText },
          ticket_form_id: 360000080263,
          custom_fields: [
            // Device: PC
            { id: 360023452491, value: "computer" },
            // Type of help: Moderation / violations & appeals
            { id: 360023452571, value: "moderation_appeal" },
            // Sub-type: account ban / enforcement
            { id: 360023452611, value: "account_ban" },
            // Roblox username
            { id: 21238230, value: username },
            // Website URL
            { id: 25328106, value: "https://www.roblox.com" },
          ],
        },
      }),
    });

    const body = await res.text();
    console.log("Roblox submit response:", res.status, body.slice(0, 400));

    if (res.status === 201 || res.status === 200) return { success: true };

    // Log full error for debugging
    console.error("Roblox submit FAILED:", res.status, body);
    return { success: false, error: `Status ${res.status}: ${body.slice(0, 200)}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
