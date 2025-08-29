// supabase/functions/serve-map/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Fetch the HTML file from Storage
  const storageUrl = `${SUPABASE_URL}/storage/v1/object/public/healthcare%20data/kenya_healthcare_interactive_map.html`;
  const response = await fetch(storageUrl, {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) {
    return new Response("File not found", { status: 404 });
  }

  const html = await response.text();

  // Return with correct headers
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      // Remove restrictive CSP
    },
  });
});
