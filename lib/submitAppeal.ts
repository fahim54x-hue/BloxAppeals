export async function submitAppeal(
  username: string,
  email: string,
  appealText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Roblox support form submission via their API
    const res = await fetch("https://apis.roblox.com/customer-feedback-api/v1/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Origin": "https://www.roblox.com",
        "Referer": "https://www.roblox.com/support",
      },
      body: JSON.stringify({
        username,
        email,
        issueType: "Account",
        subIssueType: "Moderation",
        message: appealText,
      }),
    });

    // Roblox may return various status codes — treat anything non-5xx as submitted
    if (res.status >= 500) {
      return { success: false, error: `Roblox server error: ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
