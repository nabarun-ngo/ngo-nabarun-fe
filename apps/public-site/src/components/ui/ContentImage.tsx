import type { ImgHTMLAttributes } from 'react'
import { resolveImageSrc, toWebpSrc } from '@/lib/media'

type ContentImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string
}

/** Renders images from content — WebP via `<picture>` when a sibling .webp exists. */
export default function ContentImage({
  src,
  alt = '',
  sizes,
  ...props
}: ContentImageProps) {
  const resolved = resolveImageSrc(src)
  const webp = toWebpSrc(src)
  const resolvedSizes = sizes ?? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'

  if (webp) {
    return (
      <picture>
        <source srcSet={webp} type="image/webp" sizes={resolvedSizes} />
        <img
          src={resolved}
          alt={alt}
          sizes={resolvedSizes}
          decoding="async"
          {...props}
        />
      </picture>
    )
  }

  return (
    <img
      src={resolved}
      alt={alt}
      sizes={resolvedSizes}
      decoding="async"
      {...props}
    />
  )
}
