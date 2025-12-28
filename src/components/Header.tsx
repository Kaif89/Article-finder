import { Link, useLocation } from "react-router-dom";
import { Newspaper, Sparkles, Settings, Home, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/articles", label: "All Articles", icon: Newspaper },
  { href: "/articles/original", label: "Original", icon: Newspaper },
  { href: "/articles/enhanced", label: "Enhanced", icon: Sparkles },
];

export function Header() {
  const location = useLocation();
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return (
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark"
      );
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch {
      // noop
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Newspaper className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight">
            ArticleAI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onMouseEnter={() => {
                  // Prefetch page chunk on hover to improve perceived navigation speed
                  try {
                    if (item.href === "/") import("../pages/Index");
                    else if (item.href.startsWith("/articles"))
                      import("../pages/ArticlesList");
                  } catch {
                    /* ignore */
                  }
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://beyondchats.com/blogs/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Source: BeyondChats
          </a>

          <button
            aria-label="Toggle theme"
            title="Toggle theme"
            onClick={() => setIsDark((v) => !v)}
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent text-sm text-muted-foreground hover:bg-muted/20 transition-colors"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
