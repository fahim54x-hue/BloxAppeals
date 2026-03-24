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
  });

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    // Search for emails from Roblox support
    const messages = await client.search({
      from: "no-reply@roblox.com",
      since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
    });

    if (!messages || messages.length === 0) {
      await client.logout();
      return "pending";
    }

    // Check the latest Roblox email
    for await (const msg of client.fetch(messages.slice(-5), { bodyParts: ["TEXT"], envelope: true })) {
      const text = msg.bodyParts?.get("TEXT")?.toString().toLowerCase() ?? "";
      if (
        text.includes("has been restored") ||
        text.includes("unbanned") ||
        text.includes("appeal has been approved") ||
        text.includes("account has been unlocked")
      ) {
        await client.logout();
        return "approved";
      }
      if (
        text.includes("has been reviewed") ||
        text.includes("will not be reversed") ||
        text.includes("appeal has been denied") ||
        text.includes("moderation will stand")
      ) {
        await client.logout();
        return "rejected";
      }
      // Ownership verification request — treat as pending, not rejected
      if (
        text.includes("verify ownership") ||
        text.includes("billing email") ||
        text.includes("verified email address added to the roblox account") ||
        text.includes("verify you own")
      ) {
        await client.logout();
        return "pending";
      }
    }

    await client.logout();
    return "pending";
  } catch {
    return "pending";
  }
}
