import { supabase } from "@/integrations/supabase/client";

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author: string | null;
  source_url: string;
  featured_image: string | null;
  published_at: string | null;
  scraped_at: string;
  is_enhanced: boolean;
  original_article_id: string | null;
  reference_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ArticlesResponse {
  success: boolean;
  data: Article[];
  total: number;
}

export interface ArticleResponse {
  success: boolean;
  data: Article;
}

export interface ScrapeResponse {
  success: boolean;
  message: string;
  articlesScraped: number;
  articles?: Article[];
  error?: string;
}

export interface EnhanceResponse {
  success: boolean;
  message: string;
  article?: Article;
  referencesUsed?: number;
  error?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const articlesApi = {
  // Fetch all articles
  async getArticles(options?: { isEnhanced?: boolean; limit?: number; offset?: number }): Promise<ArticlesResponse> {
    const params = new URLSearchParams();
    if (options?.isEnhanced !== undefined) {
      params.append("is_enhanced", String(options.isEnhanced));
    }
    if (options?.limit) {
      params.append("limit", String(options.limit));
    }
    if (options?.offset) {
      params.append("offset", String(options.offset));
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/articles-crud?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch articles");
    }

    return response.json();
  },

  // Fetch single article by ID
  async getArticle(id: string): Promise<ArticleResponse> {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/articles-crud/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch article");
    }

    return response.json();
  },

  // Create new article
  async createArticle(article: {
    title: string;
    content: string;
    source_url: string;
    excerpt?: string;
    featured_image?: string;
    author?: string;
  }): Promise<ArticleResponse> {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/articles-crud`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create article");
    }

    return response.json();
  },

  // Update article
  async updateArticle(id: string, updates: Partial<Article>): Promise<ArticleResponse> {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/articles-crud/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update article");
    }

    return response.json();
  },

  // Delete article
  async deleteArticle(id: string): Promise<{ success: boolean }> {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/articles-crud/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete article");
    }

    return response.json();
  },

  // Scrape articles from BeyondChats
  async scrapeArticles(): Promise<ScrapeResponse> {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/scrape-articles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to scrape articles");
    }

    return response.json();
  },

  // Enhance article with AI
  async enhanceArticle(articleId: string): Promise<EnhanceResponse> {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/enhance-article`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to enhance article");
    }

    return response.json();
  },
};
