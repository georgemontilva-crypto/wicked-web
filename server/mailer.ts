/**
 * Optional email notification for contact messages, through Resend.
 *
 * Every message is stored in the database first and shown in the admin, so
 * this is a convenience on top, not the record. That is why it is skipped
 * silently when the variables are missing and why a failure is logged rather
 * than surfaced to the visitor: their message was received either way.
 *
 * Env: RESEND_API_KEY, RESEND_FROM_EMAIL (a sender on a domain verified in
 * Resend). Notifications go to the contact email the site shows (Contact
 * details in the admin), so changing it there changes both at once.
 * CONTACT_TO_EMAIL, when set, overrides that recipient.
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "";
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "";

export function isMailConfigured(): boolean {
  return Boolean(RESEND_API_KEY && RESEND_FROM_EMAIL);
}

export async function notifyContactMessage(
  msg: {
    name: string;
    email: string;
    phone: string | null;
    topic: string | null;
    message: string;
  },
  /** The site's public contact email; used unless CONTACT_TO_EMAIL is set. */
  siteEmail: string
): Promise<void> {
  const to = CONTACT_TO_EMAIL || siteEmail;
  if (!isMailConfigured() || !to) return;

  const text = [
    `From: ${msg.name} <${msg.email}>`,
    msg.phone ? `Phone: ${msg.phone}` : null,
    msg.topic ? `About: ${msg.topic}` : null,
    "",
    msg.message,
  ]
    .filter(line => line !== null)
    .join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [to],
        reply_to: msg.email,
        subject: `WICK'D contact: ${msg.topic ?? "New message"} — ${msg.name}`,
        text,
      }),
    });
    if (!res.ok) {
      console.warn(
        `[mailer] Resend replied ${res.status}: ${await res.text()}`
      );
    }
  } catch (err) {
    console.warn("[mailer] could not send the notification:", err);
  }
}
