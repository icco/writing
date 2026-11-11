interface Node {
  type: string
  value?: string
  alt?: string | null
  children?: Node[]
  data?: Record<string, unknown>
}

/** Turns a paragraph holding only `![alt](src)`, optionally wrapped in a link, into a figure with the alt text as a visible caption. */
export function remarkImageCaptions() {
  return (tree: Node) => {
    const visit = (node: Node) => {
      node.children?.forEach(visit)
      if (node.type !== "paragraph" || !node.children) return
      const content = node.children.filter(
        (c) => !(c.type === "text" && !c.value?.trim())
      )
      if (content.length !== 1) return
      const [block] = content
      const image =
        block.type === "link" && block.children?.length === 1
          ? block.children[0]
          : block
      const caption = image.type === "image" ? image.alt?.trim() : undefined
      if (!caption) return
      node.data = { ...node.data, hName: "figure" }
      node.children = [
        block,
        {
          type: "emphasis",
          // The img alt already carries this text for screen readers.
          data: { hName: "figcaption", hProperties: { ariaHidden: "true" } },
          children: [{ type: "text", value: caption }],
        },
      ]
    }
    visit(tree)
  }
}
