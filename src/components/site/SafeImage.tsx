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

  // Reset error when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  const effectiveSrc = error || !src ? fallbackSrc : src;
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
