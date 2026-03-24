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
            // Device: PC
            { id: 360023452491, value: "computer" },
            // Type of help category: Appeal a Decision
            { id: 360023452571, value: "appeal_a_decision" },
            // Sub-category: moderated for behavior or alt account
            { id: 360023452611, value: "i_was_moderated_for_my_behavior_or_the_behavior_of_an_alt_account" },
            // Roblox username
            { id: 21238230, value: username },
            // Website URL (required field)
            { id: 25328106, value: "https://www.roblox.com" },
          ],
        },
      }),
    });

    const body = await res.text();
    console.log("Roblox submit response:", res.status, body.slice(0, 400));

    if (res.status === 201 || res.status === 200) return { success: true };
    return { success: false, error: `Status ${res.status}: ${body.slice(0, 200)}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
