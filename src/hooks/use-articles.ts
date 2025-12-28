import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi, Article, ArticlesResponse } from "@/lib/api/articles";

export function useArticles(options?: {
  isEnhanced?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery<ArticlesResponse>({
    queryKey: ["articles", options],
    queryFn: () => articlesApi.getArticles(options),
    // keep list data fresh for a bit to reduce refetches, but always refresh on mount
    staleTime: 1000 * 60 * 3, // 3 minutes
    // When a user opens the page (component mounts), always refetch to show fresh data
    refetchOnMount: "always",
    // Also refetch when the window regains focus
    refetchOnWindowFocus: true,
  });
}

export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => articlesApi.getArticle(id!),
    enabled: !!id,
  });
}

export function useScrapeArticles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => articlesApi.scrapeArticles(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useEnhanceArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: string) => articlesApi.enhanceArticle(articleId),
    // optimistic update: mark article as enhanced locally while request is in-flight
    onMutate: async (articleId: string) => {
      await queryClient.cancelQueries({ queryKey: ["articles"] });
      const previous = queryClient.getQueryData<ArticlesResponse>(["articles"]);

      queryClient.setQueryData<ArticlesResponse | undefined>(
        ["articles"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((a) =>
              a.id === articleId ? { ...a, is_enhanced: true } : a
            ),
          } as ArticlesResponse;
        }
      );

      return { previous };
    },
    onError: (_err, _variables, context) => {
      const previous = context as { previous?: ArticlesResponse } | undefined;
      if (previous?.previous) {
        queryClient.setQueryData(["articles"], previous.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (article: {
      title: string;
      content: string;
      source_url: string;
      excerpt?: string;
      featured_image?: string;
      author?: string;
    }) => articlesApi.createArticle(article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Article> }) =>
      articlesApi.updateArticle(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
