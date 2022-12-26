/** @typedef {import('remark-directive')} */

import {visit} from 'unist-util-visit'

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
export default function myRemarkPlugin() {
  return (tree) => {
    visit(tree, (node) => {
      // `node` can now be one of the nodes for directives.
    })
  }