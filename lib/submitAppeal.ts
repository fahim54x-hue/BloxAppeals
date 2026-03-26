export async function submitAppeal(
  username: string,
  email: string,
  appealText: string,
  _appPassword?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const params = new URLSearchParams({
      apikey: process.env.ELASTIC_EMAIL_API_KEY!,
      from: process.env.ELASTIC_EMAIL_FROM!,
      fromName: "BloxAppeal",
      to: "appeals@roblox.com",
      replyTo: email,
      subject: `Ban Appeal - ${username}`,
      bodyText: appealText,
      isTransactional: "true",
    });

    const res = await fetch("https://api.elasticemail.com/v2/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();
    console.log("Elastic Email response:", JSON.stringify(data));

    if (data.success) return { success: true };
    return { success: false, error: data.error ?? "Elastic Email failed" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Elastic Email failed:", msg);
    return { success: false, error: msg };
  }
}
