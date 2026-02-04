import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const payload = await req.json();
    const message = payload?.record;

    if (!message) {
      console.error("No record in payload:", payload);
      return new Response("No record", { status: 200 });
    }

    const { conversation_id, sender_id, content } = message;

    console.log("New message:", message);

    // =========================
    // ENV VARIABLES
    // =========================
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
    const SITE_URL = Deno.env.get("SITE_URL");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !RESEND_API_KEY || !FROM_EMAIL || !SITE_URL) {
      console.error("Missing environment variables");
      return new Response("Missing env vars", { status: 500 });
    }

    // =========================
    // SUPABASE ADMIN CLIENT
    // =========================
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // =========================
    // 1️⃣ GET CONVERSATION
    // =========================
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("user1_id, user2_id")
      .eq("id", conversation_id)
      .single();

    if (convError || !conversation) {
      console.error("Conversation not found", convError);
      return new Response("Conversation not found", { status: 200 });
    }

    // =========================
    // 2️⃣ DETERMINE RECIPIENT
    // =========================
    let recipient_id: string;

    if (sender_id === conversation.user1_id) {
      recipient_id = conversation.user2_id;
    } else if (sender_id === conversation.user2_id) {
      recipient_id = conversation.user1_id;
    } else {
      console.error("Sender not part of conversation");
      return new Response("Invalid sender", { status: 200 });
    }

    // =========================
    // 3️⃣ GET RECIPIENT EMAIL (auth.users)
    // =========================
    const { data: recipientUser, error: recipientError } =
      await supabase.auth.admin.getUserById(recipient_id);

    if (recipientError || !recipientUser?.user?.email) {
      console.error("Recipient email not found");
      return new Response("Recipient email not found", { status: 200 });
    }

    const recipientEmail = recipientUser.user.email;

    // =========================
    // 4️⃣ GET SENDER NAME (profiles)
    // =========================
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", sender_id)
      .single();

    const senderName = senderProfile?.username ?? "Un utente";

    // =========================
    // 5️⃣ BUILD CHAT LINK
    // =========================
    const chatUrl = `${SITE_URL}/chat/${conversation_id}`;

    // =========================
    // 6️⃣ SEND EMAIL WITH RESEND
    // =========================
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `One Coffee <${FROM_EMAIL}>`,
        to: recipientEmail,
        subject: `💬 ${senderName} ti ha scritto su One Coffee`,
        html: `
          <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding:24px;">
            <h1 style="margin:0 0 8px 0;">☕ One Coffee</h1>
            <p style="margin:0 0 24px 0; color:#555;">
              Hai ricevuto un nuovo messaggio
            </p>

            <div style="background:#ffffff; padding:16px; border-radius:8px; border:1px solid #e5e5e5;">
              <p style="margin:0 0 8px 0; font-size:14px; color:#555;">
                <strong>${senderName}</strong> ti ha scritto:
              </p>
              <p style="margin:0; font-size:16px;">
                ${content}
              </p>
            </div>

            <a href="${chatUrl}"
               style="display:inline-block; margin-top:24px; padding:12px 18px;
                      background:#000; color:#fff; text-decoration:none;
                      border-radius:8px; font-weight:bold;">
              Apri la chat
            </a>
          </div>
        `,
      }),
    });

    const resendText = await resendRes.text();
    console.log("Resend response:", resendRes.status, resendText);

    if (!resendRes.ok) {
      console.error("Resend failed");
      return new Response("Email failed", { status: 500 });
    }

    console.log("Email sent to:", recipientEmail);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Fatal error:", err);
    return new Response("Internal error", { status: 500 });
  }
});




