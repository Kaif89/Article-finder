import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const articleId = pathParts[pathParts.length - 1] !== "articles-crud" 
      ? pathParts[pathParts.length - 1] 
      : null;

    // Handle GET requests
    if (req.method === "GET") {
      // Get query parameters
      const isEnhanced = url.searchParams.get("is_enhanced");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      if (articleId && articleId !== "articles-crud") {
        // Get single article by ID
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("id", articleId)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          return new Response(
            JSON.stringify({ success: false, error: "Article not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get all articles with optional filtering
      let query = supabase
        .from("articles")
        .select("*", { count: "exact" })
        .order("scraped_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (isEnhanced !== null) {
        query = query.eq("is_enhanced", isEnhanced === "true");
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data, total: count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle POST requests (Create)
    if (req.method === "POST") {
      const body = await req.json();
      
      const { title, content, excerpt, source_url, featured_image, author } = body;

      if (!title || !content || !source_url) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields: title, content, source_url" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate slug
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-") + "-" + Date.now();

      const { data, error } = await supabase
        .from("articles")
        .insert({
          title,
          slug,
          content,
          excerpt: excerpt || content.substring(0, 300),
          source_url,
          featured_image,
          author: author || "Unknown",
          published_at: new Date().toISOString(),
          is_enhanced: false,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle PUT requests (Update)
    if (req.method === "PUT") {
      if (!articleId) {
        return new Response(
          JSON.stringify({ success: false, error: "Article ID required for update" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const { title, content, excerpt, featured_image, author } = body;

      const updateData: Record<string, any> = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (featured_image !== undefined) updateData.featured_image = featured_image;
      if (author !== undefined) updateData.author = author;

      const { data, error } = await supabase
        .from("articles")
        .update(updateData)
        .eq("id", articleId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle DELETE requests
    if (req.method === "DELETE") {
      if (!articleId) {
        return new Response(
          JSON.stringify({ success: false, error: "Article ID required for deletion" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Article deleted successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in articles-crud function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
