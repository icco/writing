import React from "react"

interface PhotoGridProps {
  urls: string[]
  alts?: string[]
}

const SRCSET_WIDTHS = [320, 480, 640, 960, 1280] as const
const DEFAULT_WIDTH = 640
const SIZES = "(min-width: 1024px) 16rem, (min-width: 768px) 33vw, 50vw"

/**
 * Build an imgix `src` + `srcSet` from a raw URL. Existing imgix params on
 * the URL (e.g. `fp-x`, `crop`) are preserved; only `w` is overridden per
 * candidate width and `auto=format,compress` is added if absent. Non-URL
 * inputs fall back to the raw string with no srcset.
 */
function buildImgixSrc(rawUrl: string): { src: string; srcSet?: string } {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return { src: rawUrl }
  }
  url.searchParams.delete("w")
  if (!url.searchParams.has("auto")) {
    url.searchParams.set("auto", "format,compress")
  }
  const withWidth = (w: number) => {
    const u = new URL(url.toString())
    u.searchParams.set("w", String(w))
    return u.toString()
  }
  return {
    src: withWidth(DEFAULT_WIDTH),
    srcSet: SRCSET_WIDTHS.map((w) => `${withWidth(w)} ${w}w`).join(", "),
  }
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ urls, alts }) => {
  return (
    <div className="not-prose columns-2 gap-2 md:columns-3 lg:columns-4">
      {urls.map((url, index) => {
        const { src, srcSet } = buildImgixSrc(url)
        return (
          <a
            href={url}
            key={index}
            className="mb-2 block break-inside-avoid"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              srcSet={srcSet}
              sizes={SIZES}
              alt={alts?.[index] ?? `Grid item ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="block w-full rounded-md"
            />
          </a>
        )
      })}
    </div>
  )
}

export default PhotoGrid
