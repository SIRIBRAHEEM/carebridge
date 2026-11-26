export const CATEGORIES = ["All", "Food", "Health", "Learning", "Errands", "Home"]

export const SEED_POSTS = [
  { id: "seed-1", kind: "need", category: "Health", title: "Ride to the clinic on Thursday morning", detail: "My mother has a checkup at the general clinic. We need a ride there and back. She can walk short distances with support.", area: "Sabon Gari", name: "Fatima A.", urgency: "High", status: "open", helper: "", createdAt: "2026-11-24T08:30:00.000Z", likes: 6 },
  { id: "seed-2", kind: "offer", category: "Learning", title: "Free maths help for secondary students", detail: "I can tutor maths and physics on Saturday afternoons. Bring your past questions and we will work through them together.", area: "Nasarawa", name: "Yusuf B.", urgency: "Normal", status: "open", helper: "", createdAt: "2026-11-24T11:15:00.000Z", likes: 11 },
  { id: "seed-3", kind: "need", category: "Food", title: "Cooked meals for three days after surgery", detail: "Recovering at home and cannot cook yet. Simple rice or soup meals would help a lot. I can collect from nearby.", area: "Wadata", name: "Grace E.", urgency: "High", status: "open", helper: "", createdAt: "2026-11-25T07:40:00.000Z", likes: 9 },
  { id: "seed-4", kind: "offer", category: "Errands", title: "I can help with market runs this week", detail: "Going to the market on Tuesday and Friday. Happy to pick up groceries or medicine for neighbors who cannot go out.", area: "Sabon Gari", name: "Ibrahim Y.", urgency: "Normal", status: "open", helper: "", createdAt: "2026-11-25T09:05:00.000Z", likes: 4 },
  { id: "seed-5", kind: "need", category: "Home", title: "Help fixing a leaking tap", detail: "The kitchen tap drips all day and wastes water. I have a new washer ready. Just need someone who knows plumbing basics.", area: "Nasarawa", name: "Mr. Okonkwo", urgency: "Normal", status: "open", helper: "", createdAt: "2026-11-25T13:20:00.000Z", likes: 3 },
  { id: "seed-6", kind: "offer", category: "Food", title: "Extra harvest to share: yam and vegetables", detail: "Our small farm produced more than we need. Free yam tubers and fresh vegetables for any family nearby. First come, first served.", area: "Wadata", name: "Hajiya Rabi", urgency: "Normal", status: "claimed", helper: "Amina S.", createdAt: "2026-11-23T16:00:00.000Z", likes: 18 },
  { id: "seed-7", kind: "need", category: "Learning", title: "Someone to read exam notes aloud", detail: "My vision is poor and I am preparing for exams next month. Reading aloud for one hour a day would change everything.", area: "Sabon Gari", name: "Chiamaka N.", urgency: "High", status: "open", helper: "", createdAt: "2026-11-25T15:45:00.000Z", likes: 7 },
  { id: "seed-8", kind: "offer", category: "Health", title: "Blood pressure checks at the community hall", detail: "Nurse volunteer offering free blood pressure checks every Sunday after morning service. No booking needed, just walk in.", area: "Nasarawa", name: "Nurse Blessing", urgency: "Normal", status: "open", helper: "", createdAt: "2026-11-22T10:00:00.000Z", likes: 22 },
  { id: "seed-9", kind: "need", category: "Errands", title: "Collect a parcel from the bus park", detail: "A parcel arrived at the park and I am at work all day. It is small and light. I will cover your transport fare.", area: "Wadata", name: "Sule M.", urgency: "Normal", status: "done", helper: "Yusuf B.", createdAt: "2026-11-21T09:30:00.000Z", likes: 5 },
]

export function filterPosts(posts, { query = "", category = "All", kind = "all", status = "all" } = {}) {
  const q = query.trim().toLowerCase()
  return posts.filter((p) => {
    if (category !== "All" && p.category !== category) return false
    if (kind !== "all" && p.kind !== kind) return false
    if (status !== "all" && p.status !== status) return false
    if (!q) return true
    return [p.title, p.detail, p.area, p.name, p.category].join(" ").toLowerCase().includes(q)
  })
}

export function sortPosts(posts, sortBy = "newest") {
  const list = [...posts]
  if (sortBy === "urgent") {
    const rank = { High: 0, Normal: 1 }
    return list.sort((a, b) => (rank[a.urgency] ?? 1) - (rank[b.urgency] ?? 1) || new Date(b.createdAt) - new Date(a.createdAt))
  }
  if (sortBy === "loved") return list.sort((a, b) => b.likes - a.likes)
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function boardStats(posts) {
  const open = posts.filter((p) => p.status === "open").length
  const claimed = posts.filter((p) => p.status === "claimed").length
  const done = posts.filter((p) => p.status === "done").length
  const helpers = new Set(posts.filter((p) => p.helper).map((p) => p.helper)).size
  const urgentOpen = posts.filter((p) => p.status === "open" && p.urgency === "High").length
  return { total: posts.length, open, claimed, done, helpers, urgentOpen }
}

export function validatePost(draft) {
  const errors = {}
  if (!draft.title || draft.title.trim().length < 8) errors.title = "Give it a clear title of at least 8 characters."
  if (!draft.detail || draft.detail.trim().length < 20) errors.detail = "Add a little more detail, at least 20 characters, so helpers understand."
  if (!draft.name || draft.name.trim().length < 2) errors.name = "Add your name so neighbors know who to look for."
  if (!draft.area || draft.area.trim().length < 2) errors.area = "Add your area or neighborhood."
  if (!CATEGORIES.includes(draft.category) || draft.category === "All") errors.category = "Pick a category."
  if (!["need", "offer"].includes(draft.kind)) errors.kind = "Choose need or offer."
  return errors
}

export function makePost(draft, now = new Date()) {
  return {
    id: "post-" + now.getTime().toString(36) + Math.random().toString(36).slice(2, 6),
    kind: draft.kind,
    category: draft.category,
    title: draft.title.trim(),
    detail: draft.detail.trim(),
    area: draft.area.trim(),
    name: draft.name.trim(),
    urgency: draft.urgency === "High" ? "High" : "Normal",
    status: "open",
    helper: "",
    createdAt: now.toISOString(),
    likes: 0,
  }
}

export function claimPost(posts, id, helperName) {
  return posts.map((p) => (p.id === id && p.status === "open" ? { ...p, status: "claimed", helper: helperName.trim() } : p))
}

export function completePost(posts, id) {
  return posts.map((p) => (p.id === id && p.status === "claimed" ? { ...p, status: "done" } : p))
}

export function reopenPost(posts, id) {
  return posts.map((p) => (p.id === id ? { ...p, status: "open", helper: "" } : p))
}

export function timeAgo(iso, now = new Date()) {
  const diff = now - new Date(iso)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return mins + " min ago"
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago")
  const days = Math.floor(hours / 24)
  return days + (days === 1 ? " day ago" : " days ago")
}
