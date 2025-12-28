import { useSearchParams } from "react-router-dom";
import {
  useArticles,
  useEnhanceArticle,
  useScrapeArticles,
} from "@/hooks/use-articles";
import { Header } from "@/components/Header";
import { ArticleGrid } from "@/components/ArticleGrid";
import { ArticleGridSkeleton } from "@/components/ArticleSkeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Sparkles, Newspaper, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Index() {
  const { toast } = useToast();
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  const {
    data: articlesData,
    isLoading,
    refetch,
    isRefetching,
  } = useArticles();
  const { mutate: scrapeArticles, isPending: isScraping } = useScrapeArticles();
  const { mutate: enhanceArticle } = useEnhanceArticle();

  const articles = articlesData?.data || [];
  const originalArticles = articles.filter((a) => !a.is_enhanced);
  const enhancedArticles = articles.filter((a) => a.is_enhanced);

  const handleScrape = () => {
    scrapeArticles(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Scraping Complete!",
          description: data.message,
        });
      },
      onError: (error) => {
        toast({
          title: "Scraping Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleEnhance = (articleId: string) => {
    setEnhancingId(articleId);
    enhanceArticle(articleId, {
      onSuccess: (data) => {
        toast({
          title: "Article Enhanced!",
          description: `Successfully created an AI-enhanced version with ${
            data.referencesUsed || 0
          } references.`,
        });
        setEnhancingId(null);
      },
      onError: (error) => {
        toast({
          title: "Enhancement Failed",
          description: error.message,
          variant: "destructive",
        });
        setEnhancingId(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Hero Section */}
        <section className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          <div className="relative z-10 max-w-2xl">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Article Scraper & AI Enhancer
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Scrape articles from BeyondChats, analyze top-ranking content, and
              generate enhanced versions using AI.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={handleScrape}
                disabled={isScraping}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent gap-2"
              >
                <Download
                  className={`h-5 w-5 ${isScraping ? "animate-bounce" : ""}`}
                />
                {isScraping ? "Scraping..." : "Scrape BeyondChats"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="hero-btn-outline gap-2"
              >
                <RefreshCw
                  className={`h-5 w-5 ${isRefetching ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-primary-foreground/10 p-4">
              <div className="text-3xl font-bold">{articles.length}</div>
              <div className="text-sm opacity-75">Total Articles</div>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 p-4">
              <div className="text-3xl font-bold">
                {originalArticles.length}
              </div>
              <div className="text-sm opacity-75">Original</div>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 p-4">
              <div className="text-3xl font-bold">
                {enhancedArticles.length}
              </div>
              <div className="text-sm opacity-75">Enhanced</div>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 p-4">
              <div className="text-3xl font-bold flex items-center gap-1">
                <Sparkles className="h-6 w-6" />
                AI
              </div>
              <div className="text-sm opacity-75">Powered</div>
            </div>
          </div>
        </section>

        {/* Original Articles Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Newspaper className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Original Articles
                </h2>
                <p className="text-sm text-muted-foreground">
                  Scraped from BeyondChats blog
                </p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {originalArticles.length} articles
            </span>
          </div>

          {isLoading ? (
            <ArticleGridSkeleton count={3} />
          ) : (
            <ArticleGrid
              articles={originalArticles}
              onEnhance={handleEnhance}
              enhancingId={enhancingId}
              emptyMessage="No original articles yet"
            />
          )}
        </section>

        {/* Enhanced Articles Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-enhanced/10">
                <Sparkles className="h-5 w-5 text-enhanced" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  AI-Enhanced Articles
                </h2>
                <p className="text-sm text-muted-foreground">
                  Improved with competitive insights
                </p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {enhancedArticles.length} articles
            </span>
          </div>

          {isLoading ? (
            <ArticleGridSkeleton count={3} />
          ) : (
            <ArticleGrid
              articles={enhancedArticles}
              emptyMessage="No enhanced articles yet. Click 'Enhance' on any original article to create one!"
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Built with Lovable • Powered by Firecrawl for scraping • AI
            enhancement via Lovable AI
          </p>
          <p className="mt-2">
            Source:{" "}
            <a
              href="https://beyondchats.com/blogs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              BeyondChats Blog
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
