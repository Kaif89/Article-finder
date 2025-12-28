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
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Scrape the BeyondChats blog page
    const blogUrl = "https://beyondchats.com/blogs/";
    console.log("Starting to scrape BeyondChats blog:", blogUrl);

    // First, map the website to get all blog URLs
    const mapResponse = await fetch("https://api.firecrawl.dev/v1/map", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: blogUrl,
        limit: 50,
      }),
    });

    const mapData = await mapResponse.json();
    console.log("Map response:", JSON.stringify(mapData));

    if (!mapResponse.ok || !mapData.success) {
      throw new Error(`Failed to map website: ${mapData.error || "Unknown error"}`);
    }

    // Filter for blog article URLs (not the main blogs page)
    const blogLinks = (mapData.links || [])
      .filter((link: string) => 
        link.includes("/blogs/") && 
        link !== blogUrl && 
        !link.endsWith("/blogs/") &&
        !link.includes("/page/")
      )
      .slice(-5); // Get the 5 oldest articles (last 5 from the list)

    console.log("Found blog article URLs:", blogLinks);

    if (blogLinks.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No blog articles found to scrape",
          articlesScraped: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scrapedArticles = [];

    // Scrape each article
    for (const articleUrl of blogLinks) {
      console.log("Scraping article:", articleUrl);

      try {
        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: articleUrl,
            formats: ["markdown", "html"],
            onlyMainContent: true,
          }),
        });

        const scrapeData = await scrapeResponse.json();
        
        if (!scrapeResponse.ok || !scrapeData.success) {
          console.error(`Failed to scrape ${articleUrl}:`, scrapeData.error);
          continue;
        }

        const data = scrapeData.data || scrapeData;
        const title = data.metadata?.title || "Untitled Article";
        const content = data.markdown || data.html || "";
        const description = data.metadata?.description || "";
        
        // Generate slug from URL
        const urlParts = articleUrl.split("/").filter(Boolean);
        const slug = urlParts[urlParts.length - 1] || `article-${Date.now()}`;

        // Check if article already exists
        const { data: existingArticle } = await supabase
          .from("articles")
          .select("id")
          .eq("source_url", articleUrl)
          .maybeSingle();

        if (existingArticle) {
          console.log(`Article already exists: ${title}`);
          continue;
        }

        // Insert article into database
        const { data: insertedArticle, error: insertError } = await supabase
          .from("articles")
          .insert({
            title,
            slug: slug + "-" + Date.now(), // Ensure unique slug
            content,
            excerpt: description.substring(0, 300),
            source_url: articleUrl,
            featured_image: data.metadata?.ogImage || null,
            author: "BeyondChats",
            published_at: new Date().toISOString(),
            is_enhanced: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Failed to insert article ${title}:`, insertError);
          continue;
        }

        console.log(`Successfully scraped and stored: ${title}`);
        scrapedArticles.push(insertedArticle);

        // Add small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`Error processing ${articleUrl}:`, err);
      }
    }

    console.log(`Scraping complete. ${scrapedArticles.length} articles stored.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully scraped ${scrapedArticles.length} articles`,
        articlesScraped: scrapedArticles.length,
        articles: scrapedArticles,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scrape-articles function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
