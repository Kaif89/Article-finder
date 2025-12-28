import { useState } from "react";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  ...rest
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Optional runtime-configured image proxy base. Set VITE_IMAGE_PROXY_URL to your deployed function
  // e.g. https://<project>.functions.supabase.co/image-proxy
  const PROXY_BASE = (import.meta as any)?.env?.VITE_IMAGE_PROXY_URL as
    | string
    | undefined;

  const buildProxy = (
    original: string,
    opts?: { w?: number; fmt?: string }
  ) => {
    if (!PROXY_BASE) return original;
    const u = new URL(PROXY_BASE);
    u.searchParams.set("url", original);
    if (opts?.w) u.searchParams.set("w", String(opts.w));
    if (opts?.fmt) u.searchParams.set("fmt", opts.fmt);
    return u.toString();
  };

  // Try to derive a WebP variant if the URL ends with jpg/png. If PROXY_BASE is set, prefer proxy fmt=webp
  const webpSource = (() => {
    try {
      if (src.match(/\.(jpe?g|png)$/i)) {
        if (PROXY_BASE) return buildProxy(src, { fmt: "webp" });
        return src.replace(/\.(jpe?g|png)$/i, ".webp");
      }
    } catch (e) {
      // ignore
    }
    return null;
  })();

  // Build a simple srcSet with common widths. If a proxy is configured we pass &w= to it so the edge can resize (if supported).
  const srcSet = (() => {
    try {
      if (!src) return undefined;
      const sizesArr = [480, 800, 1200, 1600];
      return sizesArr
        .map((w) => {
          const candidate = PROXY_BASE ? buildProxy(src, { w }) : src;
          return `${candidate} ${w}w`;
        })
        .join(", ");
    } catch {
      return undefined;
    }
  })();

  const imgSrc = PROXY_BASE ? buildProxy(src) : src;

  return (
    <div
      className={`relative overflow-hidden ${className || ""}`}
      style={{
        width: width ? width : undefined,
        height: height ? height : undefined,
      }}
    >
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted/40 before:animate-shimmer"
          aria-hidden
        >
          <div className="h-3/4 w-full bg-gradient-to-r from-muted to-muted-foreground/10" />
        </div>
      )}

      <picture>
        {webpSource && <source srcSet={webpSource} type="image/webp" />}
        {/* plain img is intentional here; no next/image in this project */}
        <img
          src={imgSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width={width}
          height={height}
          sizes={sizes}
          srcSet={srcSet}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`block h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${failed ? "opacity-60 mix-blend-multiply" : ""}`}
          {...rest}
        />
      </picture>
    </div>
  );
}
