import { useId } from "react"

interface MusicEmbedProps {
  /**
   * File name in `public/audio` (e.g. `track.mp3`) or an absolute path from site root (e.g. `/audio/track.mp3`).
   * Use MP3, AAC (.m4a), or similar as the primary source for broad support.
   */
  src: string
  /**
   * Optional Ogg Vorbis / Opus file (e.g. `track.ogg`). Browsers pick the first `<source>` they support;
   * a second format improves coverage (see MDN cross-browser audio).
   */
  srcOgg?: string
  /** Shown above the player (also used as the accessible name for the media control). */
  title?: string
  /** Optional line below the player (credit, album, etc.). */
  caption?: string
  /**
   * Link to a transcript for speech-heavy audio. MDN recommends transcripts for accessibility.
   */
  transcriptUrl?: string
  /**
   * Preload hint. Default `metadata` matches MDN/spec guidance (duration without full download).
   * Use `none` for large files or when playback is unlikely.
   */
  preload?: "none" | "metadata" | "auto"
}

const MIME_BY_EXT: Record<string, string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/ogg; codecs=opus",
  wav: "audio/wav",
  webm: "audio/webm",
}

function resolveSrc(src: string): string {
  const s = src.trim()
  if (s.startsWith("/")) return s
  const withoutLeading = s.replace(/^\.\//, "")
  if (withoutLeading.startsWith("audio/")) return `/${withoutLeading}`
  return `/audio/${withoutLeading}`
}

function mimeForUrl(url: string): string {
  const path = url.split("?")[0] ?? url
  const ext = path.split(".").pop()?.toLowerCase()
  return (ext && MIME_BY_EXT[ext]) || "audio/mpeg"
}

export default function MusicEmbed({
  src,
  srcOgg,
  title,
  caption,
  transcriptUrl,
  preload = "metadata",
}: MusicEmbedProps) {
  const titleId = useId()
  const primaryUrl = resolveSrc(src)
  const oggUrl = srcOgg ? resolveSrc(srcOgg) : null
  const downloadHref = primaryUrl

  return (
    <figure className="not-prose my-6 rounded-box border border-base-300 bg-base-200/40 p-4">
      {title ? (
        <figcaption
          className="text-base-content mb-3 text-sm font-medium"
          id={titleId}
        >
          {title}
        </figcaption>
      ) : null}
      <audio
        className="block w-full max-w-full"
        controls
        preload={preload}
        {...(title
          ? { "aria-labelledby": titleId }
          : { "aria-label": "Embedded audio" })}
      >
        <source src={primaryUrl} type={mimeForUrl(primaryUrl)} />
        {oggUrl ? <source src={oggUrl} type={mimeForUrl(oggUrl)} /> : null}
        <p className="text-base-content/80 text-sm">
          Your browser does not support embedded audio.{" "}
          <a className="link link-primary" href={downloadHref}>
            Download the audio file
          </a>
          .
        </p>
      </audio>
      {caption ? (
        <p className="text-base-content/70 mt-2 text-sm">{caption}</p>
      ) : null}
      {transcriptUrl ? (
        <p className="mt-2 text-sm">
          <a className="link link-secondary" href={transcriptUrl}>
            Transcript
          </a>
        </p>
      ) : null}
    </figure>
  )
}
