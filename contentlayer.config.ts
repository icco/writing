import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `**/*.md`,
  fields: {
    title: { type: 'string', required: true },
    datetime: { type: 'date', required: true },
    id: { type: 'string', required: true },
    draft: { type: 'boolean', required: false, default: false },
    permalink: { type: 'string', required: true },
  },
  computedFields: {
    url: { type: 'string', resolve: (post) => post.permalink },
  },
}))

export default makeSource({ contentDirPath: 'posts', documentTypes: [Post] })