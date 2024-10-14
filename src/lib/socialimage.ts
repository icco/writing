export function GenerateSocialImage(title: string, when: string): string {
  const bgColor = "eeeceb"
  const txtColor = "333"
  const txtFont = ["Roboto Slab", "serif"]

  const ub = new ImgixClient({
    domain: "icco.imgix.net",
  })

  const formatedTitle = ub.buildURL("/~text", {
    bg: bgColor,
    h: "260",
    txt64: title,
    txtalign: "bottom",
    txtclr: txtColor,
    txtfont64: txtFont,
    txtsize: "72",
    w: "1100",
  })

  const urlString = ub.buildURL("/canvas.png", {
    ba: "bottom",
    bg: bgColor,
    blend64: formatedTitle,
    bm: "normal",
    bx: "50",
    by: "280",
    fit: "crop",
    fm: "png8",
    h: "630",
    "mark-w": "200",
    mark64: "https://natwelch.com/i/logo.png",
    markx: "20",
    marky: "28",
    txt64: when,
    txtalign: ["left", "bottom"],
    txtclip: ["end", "ellipsis"],
    txtclr: txtColor,
    txtfont64: txtFont,
    txtpad: "60",
    txtsize: "24",
    w: "1200",
  })

  return urlString
}
