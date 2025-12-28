import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Default allowlist - keep it small and conservative. Can be extended via ALLOWED_HOSTS env var (comma separated).
const DEFAULT_ALLOWED = [
  "beyondchats.com",
  "images.unsplash.com",
  "cdn.shopify.com",
  "res.cloudinary.com",
  "pbs.twimg.com",
  "i.ytimg.com",
];

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const target = params.get("url");

    if (!target) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing url parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(target);
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid url" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const envAllowed = (Deno.env.get("ALLOWED_HOSTS") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const allowedHosts = new Set([...DEFAULT_ALLOWED, ...envAllowed]);

    if (
      !allowedHosts.has(parsed.hostname) &&
      !Array.from(allowedHosts).some((h) => parsed.hostname.endsWith(`.${h}`))
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Host not allowed" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Minimal proxy: fetch the image and stream it back with caching headers.
    // Note: this implementation does not perform resizing/encoding (sharp/WASM not included).
    const fetchHeaders: Record<string, string> = {};
    // If the client asked for webp, hint the origin server
    const fmt = params.get("fmt");
    if (fmt === "webp")
      fetchHeaders["accept"] = "image/webp,image/*;q=0.8,*/*;q=0.5";

    const resp = await fetch(parsed.toString(), { headers: fetchHeaders });

    if (!resp.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Upstream returned ${resp.status}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const contentType =
      resp.headers.get("content-type") || "application/octet-stream";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    // Cache aggressively at the edge, but allow clients to revalidate occasionally
    headers.set(
      "Cache-Control",
      "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400"
    );
    // CORS
    headers.set("Access-Control-Allow-Origin", "*");

    return new Response(resp.body, { status: 200, headers });
  } catch (error) {
    console.error("image-proxy error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
