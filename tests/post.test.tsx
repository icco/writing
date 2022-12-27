import "@testing-library/jest-dom"

import { render, screen } from "@testing-library/react"
import { GetServerSidePropsContext, ParsedUrlQuery } from "next/types"

import Page, { getStaticProps } from "pages/post/[pid]"

describe("Post", () => {
  it("renders", () => {
    const context = {
      params: { id: "712" } as ParsedUrlQuery,
    }
    const value = getStaticProps(context as GetServerSidePropsContext)
    expect(value).toEqual({
      props: { post: "Name", html: "fjdks" },
    })

    render(<Page post={value.props.post} html={value.props.html} />)

    const heading = screen.getByRole("heading", {
      name: /welcome to next\.js!/i,
    })

    expect(heading).toBeInTheDocument()
  })
})
