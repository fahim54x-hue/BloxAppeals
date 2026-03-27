export async function submitAppeal(
  username: string,
  email: string,
  appealText: string,
  _appPassword?: string
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
          requester: { name: username, email },
          subject: `Ban Appeal - ${username}`,
          comment: { body: appealText },
          ticket_form_id: 360000023446,
          custom_fields: [
            { id: 360023452491, value: "computer" },
            { id: 360023452571, value: "appeal_a_decision" },
            { id: 360023452611, value: "appeal_account_v2" },
            { id: 21238230, value: username },
            { id: 25328106, value: "https://www.roblox.com" },
            { id: 21633601987476, value: "0" },
            { id: 25328086, value: "moderation" },
          ],
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
