import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `**/*.md(x)?`,
  contentType: 'mdx',
  fields: {
    datetime: { type: 'date', required: true },
    draft: { type: 'boolean', required: false, default: false },
    id: { type: 'number', required: true },
    permalink: { type: 'string', required: true },
    title: { type: 'string', required: true },
    excerpt: { type: 'markdown', required: false, default: "" },
  },
  computedFields: {
    url: { type: 'string', resolve: (post) => post.permalink },
  },
}))

export default makeSource({ contentDirPath: 'posts', documentTypes: [Post] })