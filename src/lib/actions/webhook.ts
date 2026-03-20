"use server";

import { createDiscordPayload } from "../discord";

const ADMIN_WEBHOOK_URL = process.env.ADMIN_WEBHOOK_URL as string;

if (!ADMIN_WEBHOOK_URL) throw new Error("ADMIN_WEBHOOK_URL is not defined");

export async function sendToAdminWebhook(
  payload: ReturnType<typeof createDiscordPayload>,
) {
  try {
    console.log("[ADMIN PAYLOAD]", payload);
    console.log("[ADMIN WEBHOOK URL]", ADMIN_WEBHOOK_URL);
    const res = await fetch(ADMIN_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      console.error(`[Admin Webhook Failed] Status: ${res.status}`, errText);
      return false;
    }

    console.log(`[Admin Webhook] Success (${res.status})`);
    return true;
  } catch {
    return false;
  }
}
