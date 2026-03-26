import { ImapFlow } from "imapflow";

export async function checkRobloxReply(
  email: string,
  appPassword: string
): Promise<"approved" | "rejected" | "pending"> {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user: email, pass: appPassword },
    logger: false,
    tls: { rejectUnauthorized: false },
    socketTimeout: 10000,
    connectionTimeout: 10000,
  });

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    const messages = await client.search({
      from: "no-reply@roblox.com",
      since: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    });

    if (!messages || messages.length === 0) {
      await client.logout();
      return "pending";
    }

    // Check the latest 10 Roblox emails
    for await (const msg of client.fetch(messages.slice(-10), { bodyParts: ["TEXT"], envelope: true })) {
      const text = msg.bodyParts?.get("TEXT")?.toString().toLowerCase() ?? "";

      // Approved keywords
      if (
        text.includes("has been restored") ||
        text.includes("has been unbanned") ||
        text.includes("appeal has been approved") ||
        text.includes("account has been unlocked") ||
        text.includes("moderation has been lifted") ||
        text.includes("we have reviewed your appeal") && text.includes("lifted") ||
        text.includes("your account is now") ||
        text.includes("reinstated")
      ) {
        await client.logout();
        return "approved";
      }

      // Rejected keywords
      if (
        text.includes("will not be reversed") ||
        text.includes("appeal has been denied") ||
        text.includes("moderation will stand") ||
        text.includes("has been reviewed and will") ||
        text.includes("we have reviewed your appeal") && text.includes("stand") ||
        text.includes("unable to reverse") ||
        text.includes("decision is final") ||
        text.includes("not eligible for an appeal") ||
        text.includes("does not qualify")
      ) {
        await client.logout();
        return "rejected";
      }

      // Ownership verification / wrong form — treat as pending, not rejected
      if (
        text.includes("verify ownership") ||
        text.includes("billing email") ||
        text.includes("verified email address added to the roblox account") ||
        text.includes("resubmit") ||
        text.includes("correct help categor")
      ) {
        await client.logout();
        return "pending";
      }
    }

    await client.logout();
    return "pending";
  } catch (err) {
    console.error("IMAP check failed:", err);
    return "pending";
  }
}
