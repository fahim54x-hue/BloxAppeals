import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStatusEmail(
  to: string,
  username: string,
  status: "approved" | "rejected" | "retrying",
  attemptNumber?: number
) {
  const subjects: Record<string, string> = {
    approved: `🎉 Your Roblox account ${username} has been unbanned!`,
    rejected: `Appeal for ${username} was rejected — retrying automatically`,
    retrying: `New appeal submitted for ${username} (attempt #${attemptNumber})`,
  };

  const bodies: Record<string, string> = {
    approved: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f0f;color:#fff;padding:32px;border-radius:16px;">
        <h2 style="color:#22c55e;margin-bottom:8px;">Account Unbanned 🎉</h2>
        <p style="color:#aaa;">Great news! Your Roblox account <strong style="color:#fff">${username}</strong> has been successfully unbanned.</p>
        <p style="color:#aaa;">Your appeal was approved by Roblox Support. You can now log back into your account.</p>
        <a href="https://bloxappeal.vercel.app" style="display:inline-block;margin-top:16px;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Visit BloxAppeal</a>
        <p style="color:#555;font-size:12px;margin-top:24px;">BloxAppeal — Automated Roblox Ban Appeals</p>
      </div>
    `,
    rejected: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f0f;color:#fff;padding:32px;border-radius:16px;">
        <h2 style="color:#f59e0b;margin-bottom:8px;">Appeal Rejected — Don't worry</h2>
        <p style="color:#aaa;">Roblox rejected the appeal for <strong style="color:#fff">${username}</strong>, but we're already on it.</p>
        <p style="color:#aaa;">A fresh appeal letter has been automatically generated and submitted. No action needed from you.</p>
        <a href="https://bloxappeal.vercel.app" style="display:inline-block;margin-top:16px;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Check Status</a>
        <p style="color:#555;font-size:12px;margin-top:24px;">BloxAppeal — Automated Roblox Ban Appeals</p>
      </div>
    `,
    retrying: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f0f;color:#fff;padding:32px;border-radius:16px;">
        <h2 style="color:#3b82f6;margin-bottom:8px;">New Appeal Submitted</h2>
        <p style="color:#aaa;">A new appeal for <strong style="color:#fff">${username}</strong> has been submitted (attempt #${attemptNumber}).</p>
        <p style="color:#aaa;">We'll keep monitoring and notify you when there's an update.</p>
        <a href="https://bloxappeal.vercel.app" style="display:inline-block;margin-top:16px;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Check Status</a>
        <p style="color:#555;font-size:12px;margin-top:24px;">BloxAppeal — Automated Roblox Ban Appeals</p>
      </div>
    `,
  };

  try {
    await resend.emails.send({
      from: "BloxAppeal <notifications@bloxappeal.vercel.app>",
      to,
      subject: subjects[status],
      html: bodies[status],
    });
  } catch (err) {
    console.error("Failed to send notification email:", err);
  }
}
