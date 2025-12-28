import React, { Suspense, useEffect, useState } from "react";
import remarkGfm from "remark-gfm";

const LazyReactMarkdown = React.lazy(() => import("react-markdown"));

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [rehypeSanitize, setRehypeSanitize] = useState<unknown | null>(null);

  useEffect(() => {
    let mounted = true;
    // Try to dynamically import rehype-sanitize if available (optional)
    import("rehype-sanitize")
      .then((m) => {
        if (mounted)
          setRehypeSanitize((m as { default?: unknown }).default || m);
      })
      .catch(() => {
        // optional: package not installed — continue without sanitize
        setRehypeSanitize(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const components = {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-4xl font-semibold tracking-tight mt-8 mb-4 font-serif">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-4 font-serif">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xl font-semibold tracking-tight mt-6 mb-3 font-serif">
        {children}
      </h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline underline-offset-2 transition-colors hover:text-accent/80"
      >
        {children}
      </a>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="mb-4 pl-6 list-disc">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="mb-4 pl-6 list-decimal">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="mb-2">{children}</li>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-accent pl-4 italic my-6 text-muted-foreground">
        {children}
      </blockquote>
    ),
    code: ({
      className,
      children,
    }: {
      className?: string;
      children?: React.ReactNode;
    }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        );
      }
      return (
        <code className="block bg-muted p-4 rounded-lg overflow-x-auto my-6 font-mono text-sm">
          {children}
        </code>
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-6">
        {children}
      </pre>
    ),
    hr: () => <hr className="my-8 border-border" />,
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-border">{children}</table>
      </div>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-4 py-2 text-left font-semibold bg-muted">{children}</th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-4 py-2 border-t border-border">{children}</td>
    ),
  };

  return (
    <div className="prose-article">
      <Suspense
        fallback={<div className="text-muted-foreground">Loading content…</div>}
      >
        {/* Pass rehypeSanitize (unknown) when present */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <LazyReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={
            rehypeSanitize ? [rehypeSanitize as unknown as any] : []
          }
          components={components}
        >
          {content}
        </LazyReactMarkdown>
      </Suspense>
    </div>
  );
}
