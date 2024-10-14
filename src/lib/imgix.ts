export default class ImgixClient {
  settings = {
    domain: null,
    useHTTPS: true,
    includeLibraryParam: true,
    urlPrefix: "https://",
    secureURLToken: null,
    libraryParam: "js-icco",
  }
  constructor() {
    if (this.settings.includeLibraryParam) {
      this.settings.libraryParam = "js-icco"
    }

    this.settings.urlPrefix = this.settings.useHTTPS ? "https://" : "http://"
  }

  _sanitizePath(path: string) {
    // Strip leading slash first (we'll re-add after encoding)
    let _path = path.replace(/^\//, "")
    _path = encodeURI(_path).replace(/[#?:+]/g, encodeURIComponent)

    return "/" + _path
  }

  buildURL(
    rawPath: string,
    params?: Record<string, string>,
    options?: { disablePathEncoding?: boolean }
  ) {
    const path = this._sanitizePath(rawPath)

    let finalParams = this._buildParams(params, options)
    if (this.settings.secureURLToken) {
      finalParams = this._signParams(path, finalParams)
    }
    return this.settings.urlPrefix + this.settings.domain + path + finalParams
  }

  _signParams(path, queryParams) {
    const signatureBase = this.settings.secureURLToken + path + queryParams;
    const signature = md5(signatureBase);

    return queryParams.length > 0
      ? queryParams + '&s=' + signature
      : '?s=' + signature;
  }

  /**
   *`_buildURL` static method allows full URLs to be formatted for use with
   * imgix.
   *
   * - If the source URL has included parameters, they are merged with
   * the `params` passed in as an argument.
   * - URL must match `{host}/{pathname}?{query}` otherwise an error is thrown.
   *
   * @param {String} url - full source URL path string, required
   * @param {Object} params - imgix params object, optional
   * @param {Object} options - imgix client options, optional
   *
   * @returns URL string formatted to imgix specifications.
   *
   * @example
   * const client = ImgixClient
   * const params = { w: 100 }
   * const opts = { useHttps: true }
   * const src = "sdk-test.imgix.net/amsterdam.jpg?h=100"
   * const url = client._buildURL(src, params, opts)
   * console.log(url)
   * // => "https://sdk-test.imgix.net/amsterdam.jpg?h=100&w=100"
   */
  static _buildURL(url, params = {}, options = {}) {
    if (url == null) {
      return ""
    }

    const { host, pathname, search } = extractUrl({
      url,
      useHTTPS: options.useHTTPS,
    })
    // merge source URL parameters with options parameters
    const combinedParams = { ...getQuery(search), ...params }

    // throw error if no host or no pathname present
    if (!host.length || !pathname.length) {
      throw new Error("_buildURL: URL must match {host}/{pathname}?{query}")
    }

    const client = new ImgixClient({ domain: host, ...options })

    return client.buildURL(pathname, combinedParams)
  }

  _buildParams(params = {}, options = {}) {
    // If a custom encoder is present, use it
    // Otherwise just use the encodeURIComponent
    const useCustomEncoder = !!options.encoder
    const customEncoder = options.encoder

    const queryParams = [
      // Set the libraryParam if applicable.
      ...(this.settings.libraryParam
        ? [`ixlib=${this.settings.libraryParam}`]
        : []),

      // Map over the key-value pairs in params while applying applicable encoding.
      ...Object.entries(params).reduce((prev, [key, value]) => {
        if (value == null) {
          return prev
        }
        const encodedKey = useCustomEncoder
          ? customEncoder(key, value)
          : encodeURIComponent(key)
        const encodedValue =
          key.substr(-2) === "64"
            ? useCustomEncoder
              ? customEncoder(value, key)
              : Base64.encodeURI(value)
            : useCustomEncoder
              ? customEncoder(value, key)
              : encodeURIComponent(value)
        prev.push(`${encodedKey}=${encodedValue}`)

        return prev
      }, []),
    ]

    return `${queryParams.length > 0 ? "?" : ""}${queryParams.join("&")}`
  }
}
