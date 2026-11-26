import { describe, it, expect } from "vitest"
import { SEED_POSTS, filterPosts, sortPosts, boardStats, validatePost, makePost, claimPost, completePost, reopenPost, timeAgo } from "./board.js"

describe("filterPosts", () => {
  it("returns all posts with no filters", () => {
    expect(filterPosts(SEED_POSTS, {})).toHaveLength(SEED_POSTS.length)
  })
  it("filters by category", () => {
    const out = filterPosts(SEED_POSTS, { category: "Food" })
    expect(out.length).toBeGreaterThan(0)
    expect(out.every((p) => p.category === "Food")).toBe(true)
  })
  it("filters by kind", () => {
    const out = filterPosts(SEED_POSTS, { kind: "offer" })
    expect(out.every((p) => p.kind === "offer")).toBe(true)
  })
  it("filters by status", () => {
    const out = filterPosts(SEED_POSTS, { status: "open" })
    expect(out.every((p) => p.status === "open")).toBe(true)
  })
  it("searches title, detail, area and name", () => {
    expect(filterPosts(SEED_POSTS, { query: "clinic" }).length).toBeGreaterThan(0)
    expect(filterPosts(SEED_POSTS, { query: "Sabon Gari" }).length).toBeGreaterThan(0)
    expect(filterPosts(SEED_POSTS, { query: "zzzz-nothing" })).toHaveLength(0)
  })
})

describe("sortPosts", () => {
  it("sorts newest first by default", () => {
    const out = sortPosts(SEED_POSTS, "newest")
    expect(new Date(out[0].createdAt) >= new Date(out[1].createdAt)).toBe(true)
  })
  it("puts high urgency first when urgent", () => {
    const out = sortPosts(SEED_POSTS, "urgent")
    expect(out[0].urgency).toBe("High")
  })
  it("sorts by loves", () => {
    const out = sortPosts(SEED_POSTS, "loved")
    expect(out[0].likes).toBeGreaterThanOrEqual(out[1].likes)
  })
})

describe("boardStats", () => {
  it("counts statuses and helpers", () => {
    const s = boardStats(SEED_POSTS)
    expect(s.total).toBe(SEED_POSTS.length)
    expect(s.open + s.claimed + s.done).toBe(s.total)
    expect(s.helpers).toBeGreaterThanOrEqual(1)
    expect(s.urgentOpen).toBeGreaterThanOrEqual(1)
  })
})

describe("validatePost and makePost", () => {
  const good = { kind: "need", category: "Food", title: "A clear and helpful title", detail: "This detail is long enough to pass validation easily.", area: "Sabon Gari", name: "Fatima A.", urgency: "Normal" }
  it("accepts a good draft", () => {
    expect(Object.keys(validatePost(good))).toHaveLength(0)
  })
  it("rejects short fields", () => {
    const errs = validatePost({ kind: "need", category: "All", title: "Hi", detail: "short", area: "", name: "" })
    expect(errs.title).toBeTruthy()
    expect(errs.detail).toBeTruthy()
    expect(errs.name).toBeTruthy()
    expect(errs.area).toBeTruthy()
    expect(errs.category).toBeTruthy()
  })
  it("makes an open post with trimmed fields", () => {
    const p = makePost({ ...good, title: "  Padded title here  " }, new Date("2026-11-26T10:00:00.000Z"))
    expect(p.title).toBe("Padded title here")
    expect(p.status).toBe("open")
    expect(p.likes).toBe(0)
    expect(p.createdAt).toBe("2026-11-26T10:00:00.000Z")
  })
})

describe("claim, complete, reopen", () => {
  it("claims only open posts", () => {
    const open = SEED_POSTS.find((p) => p.status === "open")
    const out = claimPost(SEED_POSTS, open.id, "Amina S.")
    expect(out.find((p) => p.id === open.id).status).toBe("claimed")
    expect(out.find((p) => p.id === open.id).helper).toBe("Amina S.")
  })
  it("completes only claimed posts", () => {
    const claimed = SEED_POSTS.find((p) => p.status === "claimed")
    const out = completePost(SEED_POSTS, claimed.id)
    expect(out.find((p) => p.id === claimed.id).status).toBe("done")
    const open = SEED_POSTS.find((p) => p.status === "open")
    expect(completePost(SEED_POSTS, open.id).find((p) => p.id === open.id).status).toBe("open")
  })
  it("reopens a post and clears the helper", () => {
    const claimed = SEED_POSTS.find((p) => p.status === "claimed")
    const out = reopenPost(SEED_POSTS, claimed.id)
    expect(out.find((p) => p.id === claimed.id).status).toBe("open")
    expect(out.find((p) => p.id === claimed.id).helper).toBe("")
  })
})

describe("timeAgo", () => {
  const now = new Date("2026-11-26T12:00:00.000Z")
  it("formats minutes, hours and days", () => {
    expect(timeAgo("2026-11-26T11:30:00.000Z", now)).toBe("30 min ago")
    expect(timeAgo("2026-11-26T09:00:00.000Z", now)).toBe("3 hours ago")
    expect(timeAgo("2026-11-24T12:00:00.000Z", now)).toBe("2 days ago")
    expect(timeAgo("2026-11-26T11:59:30.000Z", now)).toBe("just now")
  })
})
