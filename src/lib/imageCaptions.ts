interface Node {
  type: string
  value?: string
  title?: string | null
  children?: Node[]
  data?: Record<string, unknown>
}

/** Turns a paragraph holding only `![alt](src "title")`, optionally wrapped in a link, into a figure with the title as a visible caption. */
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
      if (image.type !== "image" || !image.title) return
      const caption = image.title
      // The caption replaces the title so screen readers do not announce it twice.
      image.title = null
      node.data = { ...node.data, hName: "figure" }
      node.children = [
        block,
        {
          type: "emphasis",
          data: { hName: "figcaption" },
          children: [{ type: "text", value: caption }],
        },
      ]
    }
    visit(tree)
  }
}
