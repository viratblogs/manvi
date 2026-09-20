"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallbackSrc?: string;
}

export function SafeImage({
  src,
  fallbackSrc = "/m.png",
  alt,
  className,
  fill,
  width,
  height,
  priority,
  sizes,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  // Reset error and auto-resolve ImgBB page URLs if provided
  useEffect(() => {
    setError(false);
    if (src && src.includes("ibb.co/") && !src.includes("i.ibb.co/")) {
      const match = src.trim().match(/^https?:\/\/ibb\.co\/([a-zA-Z0-9]+)\/?$/i);
      if (match) {
        fetch(`https://ibb.co/${match[1]}/oembed.json`)
          .then((r) => r.json())
          .then((d) => {
            if (d.url && typeof d.url === "string") {
              setResolvedSrc(d.url);
            }
          })
          .catch(() => setResolvedSrc(null));
        return;
      }
    }
    setResolvedSrc(null);
  }, [src]);

  const activeSrc = resolvedSrc || src;
  // Use fallbackSrc only if an actual error occurs loading the image
  const effectiveSrc = error ? (fallbackSrc || "/m.png") : activeSrc;

  // If no image source is ready yet, show a matching shimmer skeleton instead of flashing the wrong picture
  if (!effectiveSrc) {
    return (
      <div
        className={`bg-surface-sub/80 animate-pulse ${className || ""} ${fill ? "h-full w-full" : ""}`}
        style={!fill && width && height ? { width, height } : undefined}
      />
    );
  }

  const isDataUrl = effectiveSrc.startsWith("data:");
  const isBlob = effectiveSrc.startsWith("blob:");

  // For data URLs or blob URLs, native <img> is much safer and avoids Next.js server image optimization errors
  if (isDataUrl || isBlob) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={effectiveSrc}
        alt={alt || "Image"}
        className={`${className || ""} ${fill ? "h-full w-full object-cover" : ""}`}
        onError={() => setError(true)}
      />
    );
  }

  // Use Next.js Image component for relative or standard HTTPS URLs with unoptimized fallback on error
  return (
    <Image
      {...props}
      src={effectiveSrc}
      alt={alt || "Image"}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      sizes={sizes}
      className={className}
      unoptimized // Allows any remote host domain without breaking
      onError={() => setError(true)}
    />
  );
}
