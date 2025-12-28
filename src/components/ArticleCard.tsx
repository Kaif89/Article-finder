import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Article } from "@/lib/api/articles";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, ExternalLink, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import OptimizedImage from "./OptimizedImage";

interface ArticleCardProps {
  article: Article;
  onEnhance?: (id: string) => void;
  isEnhancing?: boolean;
}

function ArticleCardComponent({
  article,
  onEnhance,
  isEnhancing,
}: ArticleCardProps) {
  return (
    <article className="article-card group animate-fade-in">
      {article.featured_image && (
        <div className="aspect-video overflow-hidden">
          <OptimizedImage
            src={article.featured_image}
            alt={article.title}
            width={1600}
            height={900}
            sizes="(max-width: 640px) 100vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-6">
        <div className="mb-3 flex items-center gap-2">
          {article.is_enhanced ? (
            <span className="enhanced-badge">
              <Sparkles className="h-3 w-3" />
              AI Enhanced
            </span>
          ) : (
            <span className="original-badge">Original</span>
          )}
        </div>

        <Link to={`/article/${article.id}`}>
          <h2 className="mb-2 font-serif text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-accent line-clamp-2">
            {article.title}
          </h2>
        </Link>

        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
          {article.excerpt || article.content.substring(0, 150)}...
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {article.author && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.author}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(article.scraped_at), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/article/${article.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Read Article
            </Button>
          </Link>

          {!article.is_enhanced && onEnhance && (
            <Button
              size="sm"
              onClick={() => onEnhance(article.id)}
              disabled={isEnhancing}
              className="btn-accent gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Enhance
            </Button>
          )}

          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </article>
  );
}

export const ArticleCard = memo(ArticleCardComponent);
