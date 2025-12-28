import { useArticles, useEnhanceArticle } from "@/hooks/use-articles";
import { Header } from "@/components/Header";
import { ArticleGrid } from "@/components/ArticleGrid";
import { ArticleGridSkeleton } from "@/components/ArticleSkeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Newspaper, Sparkles } from "lucide-react";

export default function ArticlesList() {
  const location = useLocation();
  const { toast } = useToast();
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  
  const isEnhancedOnly = location.pathname === "/articles/enhanced";
  const isOriginalOnly = location.pathname === "/articles/original";
  
  const filterOptions = isEnhancedOnly 
    ? { isEnhanced: true } 
    : isOriginalOnly 
    ? { isEnhanced: false } 
    : undefined;
  
  const { data: articlesData, isLoading } = useArticles(filterOptions);
  const { mutate: enhanceArticle } = useEnhanceArticle();

  const articles = articlesData?.data || [];

  const handleEnhance = (articleId: string) => {
    setEnhancingId(articleId);
    enhanceArticle(articleId, {
      onSuccess: (data) => {
        toast({
          title: "Article Enhanced!",
          description: `Successfully created an AI-enhanced version with ${data.referencesUsed || 0} references.`,
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

  const getTitle = () => {
    if (isEnhancedOnly) return "AI-Enhanced Articles";
    if (isOriginalOnly) return "Original Articles";
    return "All Articles";
  };

  const getDescription = () => {
    if (isEnhancedOnly) return "Articles improved with AI and competitive insights";
    if (isOriginalOnly) return "Scraped from BeyondChats blog";
    return "Browse all scraped and enhanced articles";
  };

  const getIcon = () => {
    if (isEnhancedOnly) return <Sparkles className="h-6 w-6 text-enhanced" />;
    return <Newspaper className="h-6 w-6 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isEnhancedOnly ? 'bg-enhanced/10' : 'bg-muted'}`}>
              {getIcon()}
            </div>
            <div>
              <h1 className="font-serif text-3xl font-semibold">{getTitle()}</h1>
              <p className="text-muted-foreground">{getDescription()}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {articles.length} article{articles.length !== 1 ? 's' : ''} found
          </p>
        </header>

        {isLoading ? (
          <ArticleGridSkeleton count={6} />
        ) : (
          <ArticleGrid
            articles={articles}
            onEnhance={!isEnhancedOnly ? handleEnhance : undefined}
            enhancingId={enhancingId}
            emptyMessage={isEnhancedOnly ? "No enhanced articles yet" : "No articles found"}
          />
        )}
      </main>
    </div>
  );
}
