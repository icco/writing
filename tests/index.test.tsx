import { render, screen } from "@testing-library/react"
import { DateTime } from "luxon"
import Index from "pages/index"

describe("Home", () => {
  it("renders", () => {
    const post = {
      id: "1",
      title: "Test",
      tags: ["test"],
      datetime: DateTime.local().toISO(),
    }
    render(<Index posts={[post]} />)

    const heading = screen.getByRole("heading", {
      name: /welcome to next\.js!/i,
    })

    expect(heading).toBeInTheDocument()
  })
})
