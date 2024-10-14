import { Base64 } from "js-base64"

export default class ImgixClient {
  settings: {
    domain: string
    urlPrefix: string
    libraryParam: string
  } = {
    domain: "",
    urlPrefix: "https://",
    libraryParam: "js-icco",
  }
  constructor(options: { domain: string }) {
    this.settings.domain = options.domain
  }

  _sanitizePath(path: string) {
    // Strip leading slash first (we'll re-add after encoding)
    let _path = path.replace(/^\//, "")
    _path = encodeURI(_path).replace(/[#?:+]/g, encodeURIComponent)

    return "/" + _path
  }

  buildURL(rawPath: string, params: Record<string, string | string[]>) {
    const path = this._sanitizePath(rawPath)

    const finalParams = this._buildParams(params)
    return this.settings.urlPrefix + this.settings.domain + path + finalParams
  }

  _buildParams(params: Record<string, string | string[]>) {
    const queryParams = [
      // Set the libraryParam if applicable.
      ...(this.settings.libraryParam
        ? [`ixlib=${this.settings.libraryParam}`]
        : []),

      // Map over the key-value pairs in params while applying applicable encoding.
      ...Object.entries(params).reduce((prev: string[], [key, value]) => {
        if (value == null) {
          return prev
        }

        const v = (Array.isArray(value) ? value : [value]).join(",")

        const encodedKey = encodeURIComponent(key)
        const encodedValue = Base64.encodeURI(v)

        prev.push(`${encodedKey}=${encodedValue}`)

        return prev
      }, []),
    ]

    return `${queryParams.length > 0 ? "?" : ""}${queryParams.join("&")}`
  }
}

/**
 * `extractUrl()` extracts URL components from a source URL string.
 * It does this by matching the URL against regular expressions. The irrelevant
 * (entire URL) matches are removed and the rest stored as their corresponding
 * URL components.
 *
 * `url` can be a partial, full URL, or full proxy URL. `useHttps` boolean
 * defaults to false.
 *
 * @returns {Object} `{ protocol, auth, host, pathname, search, hash }`
 * extracted from the URL.
 */
export function extractUrl({ url }: { url: string }) {
  const u = new URL(url)

  const { protocol, host, pathname, search, hash } = u

  return { protocol, host, pathname, search, hash }
}
