import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, useEffect } from "react";
import { articlesApi } from "@/lib/api/articles";
const Index = React.lazy(() => import("./pages/Index"));
const ArticleDetail = React.lazy(() => import("./pages/ArticleDetail"));
const ArticlesList = React.lazy(() => import("./pages/ArticlesList"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Prefetch articles on app mount to populate cache and improve perceived loading speed
  React.useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["articles", undefined],
      queryFn: () => articlesApi.getArticles(),
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Skip link for keyboard users */}
        <a href="#content" className="skip-link sr-only focus:not-sr-only">
          Skip to content
        </a>
        <BrowserRouter>
          <Suspense fallback={<div className="container py-8">Loading…</div>}>
            <div id="content">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/article/:id" element={<ArticleDetail />} />
                <Route path="/articles" element={<ArticlesList />} />
                <Route path="/articles/original" element={<ArticlesList />} />
                <Route path="/articles/enhanced" element={<ArticlesList />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
