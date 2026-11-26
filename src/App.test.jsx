import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import App from "./App.jsx"

describe("CareBridge app", () => {
  beforeEach(() => { localStorage.clear() })

  it("renders the hero and the board", () => {
    render(<App />)
    expect(screen.getByText(/Small help,/)).toBeInTheDocument()
    expect(screen.getByText(/The neighborhood board/)).toBeInTheDocument()
    expect(screen.getAllByText(/Ride to the clinic/).length).toBeGreaterThan(0)
  })

  it("filters the board by search", () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText("Search posts"), { target: { value: "maths" } })
    expect(screen.getByText(/Free maths help/)).toBeInTheDocument()
    expect(screen.getByText(/1 of 9 posts shown/)).toBeInTheDocument()
  })

  it("opens the post form and validates empty fields", () => {
    render(<App />)
    fireEvent.click(screen.getByText("Post a need or offer"))
    expect(screen.getByText(/Post a need or an offer/)).toBeInTheDocument()
    fireEvent.click(screen.getByText("Publish to the board"))
    expect(screen.getByText(/Give it a clear title/)).toBeInTheDocument()
  })

  it("publishes a valid post to the board", () => {
    render(<App />)
    fireEvent.click(screen.getByText("Post a need or offer"))
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Help carrying water on Saturday" } })
    fireEvent.change(screen.getByLabelText("Details"), { target: { value: "We need help carrying two buckets of water from the borehole on Saturday morning." } })
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Test Neighbor" } })
    fireEvent.change(screen.getByLabelText("Your area"), { target: { value: "Sabon Gari" } })
    fireEvent.click(screen.getByText("Publish to the board"))
    expect(screen.getByText(/Help carrying water on Saturday/)).toBeInTheDocument()
  })

  it("opens a detail dialog for a post", () => {
    render(<App />)
    fireEvent.click(screen.getByText("See how to help"))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText(/I can help with this/)).toBeInTheDocument()
  })
})
