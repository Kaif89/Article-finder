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
    const { articleId } = await req.json();

    if (!articleId) {
      return new Response(
        JSON.stringify({ success: false, error: "Article ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!FIRECRAWL_API_KEY || !LOVABLE_API_KEY) {
      console.error("Missing required API keys");
      return new Response(
        JSON.stringify({ success: false, error: "Service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch the original article
    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleId)
      .single();

    if (fetchError || !article) {
      console.error("Article not found:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "Article not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Enhancing article: ${article.title}`);

    // Step 1: Search for similar articles on Google using Firecrawl search
    console.log("Searching for related articles...");
    
    const searchQuery = article.title.substring(0, 100);
    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 5,
        scrapeOptions: {
          formats: ["markdown"],
        },
      }),
    });

    const searchData = await searchResponse.json();
    console.log("Search results:", JSON.stringify(searchData).substring(0, 500));

    // Filter for actual blog/article content (not the original source)
    const referenceArticles = (searchData.data || [])
      .filter((result: any) => 
        result.url && 
        !result.url.includes("beyondchats.com") &&
        (result.markdown || result.content)
      )
      .slice(0, 2);

    console.log(`Found ${referenceArticles.length} reference articles`);

    const referenceUrls = referenceArticles.map((r: any) => r.url);
    const referenceContent = referenceArticles
      .map((r: any) => `### Reference: ${r.title || r.url}\n\n${(r.markdown || r.content || "").substring(0, 2000)}`)
      .join("\n\n---\n\n");

    // Step 2: Use AI to enhance the article
    console.log("Calling AI to enhance article...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert content editor and SEO specialist. Your task is to enhance and improve articles to make them more comprehensive, engaging, and well-structured.

Guidelines:
1. Maintain the original article's core message and intent
2. Improve the structure with clear headings and subheadings
3. Add relevant details and explanations where needed
4. Make the content more engaging and readable
5. Ensure proper formatting with markdown
6. Keep a professional, authoritative tone
7. The enhanced version should be significantly more valuable than the original
8. DO NOT add references section - we will add that separately`
          },
          {
            role: "user",
            content: `Please enhance the following article. Use the reference articles for inspiration on style, structure, and depth of content.

ORIGINAL ARTICLE:
Title: ${article.title}

${article.content}

---

REFERENCE ARTICLES FOR STYLE INSPIRATION:
${referenceContent || "No reference articles available - enhance based on best practices."}

---

Please provide the enhanced article in markdown format. Start directly with the content (no title needed as we'll use the original title).`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const enhancedContent = aiData.choices?.[0]?.message?.content;

    if (!enhancedContent) {
      throw new Error("No content generated by AI");
    }

    console.log("AI enhancement complete");

    // Add references section
    let finalContent = enhancedContent;
    if (referenceUrls.length > 0) {
      finalContent += `\n\n---\n\n## References\n\nThis article was enhanced using insights from:\n\n`;
      referenceUrls.forEach((url: string, index: number) => {
        finalContent += `${index + 1}. [${url}](${url})\n`;
      });
    }

    // Step 3: Create the enhanced article
    const enhancedSlug = `${article.slug}-enhanced-${Date.now()}`;
    
    const { data: enhancedArticle, error: insertError } = await supabase
      .from("articles")
      .insert({
        title: `${article.title} (Enhanced)`,
        slug: enhancedSlug,
        content: finalContent,
        excerpt: article.excerpt,
        source_url: article.source_url,
        featured_image: article.featured_image,
        author: article.author,
        published_at: new Date().toISOString(),
        is_enhanced: true,
        original_article_id: article.id,
        reference_urls: referenceUrls,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert enhanced article:", insertError);
      throw new Error("Failed to save enhanced article");
    }

    console.log(`Successfully created enhanced article: ${enhancedArticle.title}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Article enhanced successfully",
        article: enhancedArticle,
        referencesUsed: referenceUrls.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in enhance-article function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
