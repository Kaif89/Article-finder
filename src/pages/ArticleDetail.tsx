import { useParams, Link, useNavigate } from "react-router-dom";
import { useArticle, useEnhanceArticle, useDeleteArticle, useArticles } from "@/hooks/use-articles";
import { Header } from "@/components/Header";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Sparkles, 
  ExternalLink, 
  Calendar, 
  User, 
  Trash2,
  Link as LinkIcon,
  ArrowRightLeft
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: articleData, isLoading, error } = useArticle(id);
  const { mutate: enhanceArticle, isPending: isEnhancing } = useEnhanceArticle();
  const { mutate: deleteArticle, isPending: isDeleting } = useDeleteArticle();
  
  // Fetch related articles (original or enhanced version)
  const { data: relatedArticles } = useArticles();

  const article = articleData?.data;

  // Find the original or enhanced counterpart
  const originalArticle = article?.is_enhanced && article?.original_article_id
    ? relatedArticles?.data.find(a => a.id === article.original_article_id)
    : null;
  
  const enhancedVersion = !article?.is_enhanced
    ? relatedArticles?.data.find(a => a.original_article_id === article?.id)
    : null;

  const handleEnhance = () => {
    if (!article) return;
    
    enhanceArticle(article.id, {
      onSuccess: (data) => {
        toast({
          title: "Article Enhanced!",
          description: `Successfully created an AI-enhanced version with ${data.referencesUsed || 0} references.`,
        });
        if (data.article) {
          navigate(`/article/${data.article.id}`);
        }
      },
      onError: (error) => {
        toast({
          title: "Enhancement Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleDelete = () => {
    if (!article) return;
    
    deleteArticle(article.id, {
      onSuccess: () => {
        toast({
          title: "Article Deleted",
          description: "The article has been removed.",
        });
        navigate("/");
      },
      onError: (error) => {
        toast({
          title: "Delete Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-12 w-full bg-muted rounded" />
            <div className="h-6 w-64 bg-muted rounded" />
            <div className="aspect-video w-full bg-muted rounded-xl" />
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl py-12">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-semibold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-4xl py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <article className="animate-fade-in">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {article.is_enhanced ? (
                <span className="enhanced-badge">
                  <Sparkles className="h-3 w-3" />
                  AI Enhanced
                </span>
              ) : (
                <span className="original-badge">Original Article</span>
              )}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-balance">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              {article.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {article.author}
                </span>
              )}
              {article.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(article.published_at), "MMMM d, yyyy")}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                Scraped {formatDistanceToNow(new Date(article.scraped_at), { addSuffix: true })}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-border">
              {!article.is_enhanced && (
                <Button onClick={handleEnhance} disabled={isEnhancing} className="btn-accent gap-2">
                  <Sparkles className="h-4 w-4" />
                  {isEnhancing ? "Enhancing..." : "Enhance with AI"}
                </Button>
              )}

              <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Source
                </Button>
              </a>

              {/* Link to original/enhanced version */}
              {originalArticle && (
                <Link to={`/article/${originalArticle.id}`}>
                  <Button variant="outline" className="gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    View Original
                  </Button>
                </Link>
              )}
              
              {enhancedVersion && (
                <Link to={`/article/${enhancedVersion.id}`}>
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    View Enhanced
                  </Button>
                </Link>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the article.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </header>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="mb-8 overflow-hidden rounded-xl">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose-article">
            <MarkdownRenderer content={article.content} />
          </div>

          {/* References */}
          {article.reference_urls && article.reference_urls.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-accent" />
                References Used
              </h3>
              <ul className="space-y-2">
                {article.reference_urls.map((url, index) => (
                  <li key={index}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
