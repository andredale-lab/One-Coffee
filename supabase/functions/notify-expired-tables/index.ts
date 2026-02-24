import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL")!;
    const SITE_URL = Deno.env.get("SITE_URL")!;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 1️⃣ Tavoli scaduti
    const { data: tables } = await supabase
      .rpc("get_tables_to_notify_expired");

    if (!tables || tables.length === 0) {
      console.log("No expired tables");
      return new Response("No expired tables", { status: 200 });
    }

    for (const row of tables) {
      const tableId = row.table_id;

      console.log("Processing table:", tableId);

      // 2️⃣ Prendiamo partecipanti
      const { data: participants } = await supabase
        .from("table_participants")
        .select("user_id")
        .eq("table_id", tableId);

      if (!participants || participants.length === 0) continue;

      const reviewUrl = `${SITE_URL}/tables/${tableId}/review`;

      for (const p of participants) {
        const { data: userData } =
          await supabase.auth.admin.getUserById(p.user_id);

        const email = userData?.user?.email;
        if (!email) continue;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `One Coffee <${FROM_EMAIL}>`,
            to: email,
            subject: "☕ Il tavolo è terminato! Lascia una valutazione",
            html: `
              <div style="font-family: Arial, sans-serif; padding:24px;">
                <h1>☕ One Coffee</h1>
                <p>Il tavolo a cui hai partecipato è terminato.</p>
                <a href="${reviewUrl}"
                   style="display:inline-block;margin-top:20px;padding:12px 18px;background:#000;color:#fff;text-decoration:none;border-radius:8px;">
                  Vai alla valutazione
                </a>
              </div>
            `,
          }),
        });

        console.log("Review email sent to:", email);
      }

      // 3️⃣ Segniamo come notificato
      await supabase
        .from("coffee_tables")
        .update({
          expired_email_sent_at: new Date().toISOString(),
        })
        .eq("id", tableId);
    }

    return new Response("Done", { status: 200 });

  } catch (err) {
    console.error("Fatal error:", err);
    return new Response("Internal error", { status: 500 });
  }
});

