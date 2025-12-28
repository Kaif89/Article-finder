import { useEffect, useRef, useState } from "react";
import { Article } from "@/lib/api/articles";
import { ArticleCard } from "./ArticleCard";

interface ArticleGridProps {
  articles: Article[];
  onEnhance?: (id: string) => void;
  enhancingId?: string | null;
  emptyMessage?: string;
  initialVisible?: number; // number of items to render initially for perceived speed
  loadMoreStep?: number; // how many to reveal when scrolling
}

export function ArticleGrid({
  articles,
  onEnhance,
  enhancingId,
  emptyMessage = "No articles found",
  initialVisible = 9,
  loadMoreStep = 6,
}: ArticleGridProps) {
  const [visibleCount, setVisibleCount] = useState<number>(
    Math.min(initialVisible, articles.length)
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset visible count when the article list changes
    setVisibleCount(Math.min(initialVisible, articles.length));
  }, [articles, initialVisible]);

  useEffect(() => {
    if (visibleCount >= articles.length) return;

    const node = sentinelRef.current;
    if (!node) return;

    let obs: IntersectionObserver | null = null;
    const onIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Use idle callback to schedule non-urgent rendering
          const schedule = (fn: () => void) => {
            // feature-detect requestIdleCallback without using `any` for lint
            type RIC = (
              callback: () => void,
              options?: { timeout?: number }
            ) => number;
            const ric = (window as unknown as { requestIdleCallback?: RIC })
              .requestIdleCallback;
            if (typeof ric === "function") {
              (ric as RIC)(fn, { timeout: 500 });
            } else {
              setTimeout(fn, 200);
            }
          };

          schedule(() => {
            setVisibleCount((v) => Math.min(articles.length, v + loadMoreStep));
          });
        }
      });
    };

    obs = new IntersectionObserver(onIntersect, { rootMargin: "200px" });
    obs.observe(node);

    return () => {
      if (obs && node) obs.unobserve(node);
      obs = null;
    };
  }, [visibleCount, articles.length, loadMoreStep]);

  if (articles.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          {emptyMessage}
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Try scraping articles from BeyondChats to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, visibleCount).map((article, index) => (
          <div
            key={article.id}
            className="opacity-0 animate-fade-in"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <ArticleCard
              article={article}
              onEnhance={onEnhance}
              isEnhancing={enhancingId === article.id}
            />
          </div>
        ))}
      </div>

      {/* Sentinel to load more items when the user scrolls near the bottom */}
      {visibleCount < articles.length && (
        <div
          ref={sentinelRef}
          className="mt-6 flex items-center justify-center"
        >
          <div className="text-sm text-muted-foreground">
            Loading more articles…
          </div>
        </div>
      )}
    </>
  );
}
