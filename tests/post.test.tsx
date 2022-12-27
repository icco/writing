import "@testing-library/jest-dom"

import { render, screen } from "@testing-library/react"
import { GetStaticPropsContext } from "next/types"

import { Post } from "components/Post"
import { getStaticProps } from "pages/post/[pid]"

describe("Post", () => {
  it("renders", () => {
    const context = {
      params: { id: "712" } as ParsedUrlQuery,
    }
    const value = getStaticProps(context as GetStaticPropsContext)
    expect(value).toEqual({
      props: { post: "Name", html: "fjdks" },
    })

    render(<Post post={value["props"].post} html={value["props"].html} />)

    const heading = screen.getByRole("heading", {
      name: /welcome to next\.js!/i,
    })

    expect(heading).toBeInTheDocument()
  })
})
