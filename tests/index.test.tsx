import { render, screen } from "@testing-library/react"
import Index from "pages/index"

describe("Home", () => {
  it("renders a heading", () => {
    render(<Index posts={undefined} />)

    const heading = screen.getByRole("heading", {
      name: /welcome to next\.js!/i,
    })

    expect(heading).toBeInTheDocument()
  })
})
