/**
 * Custom Next.js image loader for imgix-hosted images.
 *
 * Setting `images.loader = 'custom'` and `images.loaderFile` in next.config.js
 * routes every <Image> through this function. For imgix URLs we return a
 * direct imgix URL with the right size/format params; for anything else we
 * pass the source through unchanged so Next.js doesn't try to re-host it.
 *
 * Authoring extra imgix params:
 *   <Image src="https://icco.imgix.net/path.jpg?fp-x=0.4&fp-y=0.3&crop=focalpoint&fit=crop" .../>
 * Existing query params on the src are preserved; this loader only sets
 * defaults (`auto`) and the per-srcset width / quality that Next.js asks for.
 *
 * @see https://docs.imgix.com/getting-started/tutorials/developer-guides/imgix-with-nextjs
 */
import ImgixClient from "@imgix/js-core"

const IMGIX_HOST = "icco.imgix.net"

const client = new ImgixClient({
  domain: IMGIX_HOST,
  includeLibraryParam: false,
})

type LoaderArgs = { src: string; width: number; quality?: number }

export default function imgixLoader({ src, width, quality }: LoaderArgs): string {
  let url: URL
  try {
    url = new URL(src, `https://${IMGIX_HOST}`)
  } catch {
    return src
  }

  if (url.hostname !== IMGIX_HOST) {
    return src
  }

  const params: Record<string, string> = {}
  for (const [k, v] of url.searchParams) {
    params[k] = v
  }
  if (!params.auto) {
    params.auto = "format,compress"
  }
  params.w = String(width)
  if (quality) {
    params.q = String(quality)
  }

  return client.buildURL(url.pathname, params)
}
