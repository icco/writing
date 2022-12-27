import "@testing-library/jest-dom"

import { render, screen } from "@testing-library/react"
import { DateTime } from "luxon"

import PostList from "components/PostList"

describe("Home", () => {
  it("renders", () => {
    const post = {
      id: "1",
      title: "Test",
      tags: ["test"],
      datetime: DateTime.local().toISO(),
    }
    render(<PostList posts={[post]} />)

    const heading = screen.getByRole("heading", {
      name: /Test/,
    })

    expect(heading).toBeInTheDocument()
  })
})
