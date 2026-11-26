import { useEffect, useMemo, useState } from "react"
import { Heart, HandHeart, Search, MapPin, Clock, Plus, Check, X, Users, Sparkles, BookOpen, Utensils, Stethoscope, ShoppingBasket, Wrench, ChevronRight, ShieldCheck, WifiOff } from "lucide-react"
import { Button, Card, Badge, Input, Textarea, Select, Label } from "./components/ui.jsx"
import { SEED_POSTS, CATEGORIES, filterPosts, sortPosts, boardStats, validatePost, makePost, claimPost, completePost, reopenPost, timeAgo } from "./lib/board.js"

const STORE_KEY = "carebridge-posts-v1"
const LIKES_KEY = "carebridge-likes-v1"

const CATEGORY_ICONS = { Food: Utensils, Health: Stethoscope, Learning: BookOpen, Errands: ShoppingBasket, Home: Wrench }

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed) && parsed.length) return parsed }
  } catch { /* ignore */ }
  return SEED_POSTS
}

export default function App() {
  const [posts, setPosts] = useState(loadPosts)
  const [liked, setLiked] = useState(() => { try { return JSON.parse(localStorage.getItem(LIKES_KEY) || "[]") } catch { return [] } })
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [kind, setKind] = useState("all")
  const [status, setStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [helperName, setHelperName] = useState("")
  const [notice, setNotice] = useState("")
  const [draft, setDraft] = useState({ kind: "need", category: "Food", title: "", detail: "", area: "", name: "", urgency: "Normal" })
  const [errors, setErrors] = useState({})

  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(posts)) } catch { /* ignore */ } }, [posts])
  useEffect(() => { try { localStorage.setItem(LIKES_KEY, JSON.stringify(liked)) } catch { /* ignore */ } }, [liked])
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(""), 4200); return () => clearTimeout(t) }, [notice])

  const stats = useMemo(() => boardStats(posts), [posts])
  const visible = useMemo(() => sortPosts(filterPosts(posts, { query, category, kind, status }), sortBy), [posts, query, category, kind, status, sortBy])
  const featured = useMemo(() => posts.find((p) => p.status === "open" && p.urgency === "High") || posts[0], [posts])

  function submitPost(e) {
    e.preventDefault()
    const errs = validatePost(draft)
    setErrors(errs)
    if (Object.keys(errs).length) return
    const post = makePost(draft)
    setPosts((prev) => [post, ...prev])
    setDraft({ kind: "need", category: "Food", title: "", detail: "", area: "", name: "", urgency: "Normal" })
    setShowForm(false)
    setNotice("Your post is live on the board. Neighbors nearby can now see it.")
    document.getElementById("board")?.scrollIntoView?.({ behavior: "smooth" })
  }

  function toggleLike(id) {
    const has = liked.includes(id)
    setLiked((prev) => (has ? prev.filter((x) => x !== id) : [...prev, id]))
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + (has ? -1 : 1) } : p)))
  }

  function handleClaim(id) {
    if (helperName.trim().length < 2) { setNotice("Add your name first so the neighbor knows who is coming."); return }
    setPosts((prev) => claimPost(prev, id, helperName))
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: "claimed", helper: helperName.trim() } : prev))
    setNotice("Thank you. You have claimed this one. Please follow through or reopen it if plans change.")
  }

  function handleComplete(id) {
    setPosts((prev) => completePost(prev, id))
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: "done" } : prev))
    setNotice("Marked as done. Another neighbor helped. Well done.")
  }

  function handleReopen(id) {
    setPosts((prev) => reopenPost(prev, id))
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: "open", helper: "" } : prev))
    setNotice("Back on the board as open.")
  }

  function resetDemo() {
    setPosts(SEED_POSTS); setLiked([]); setSelected(null)
    setNotice("Board reset to the sample neighborhood posts.")
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[#14532d]/10 bg-[#fdf8ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#14532d] text-[#fdf8ee]"><Heart className="h-5 w-5" /></span>
            <span>
              <span className="font-display block text-xl leading-none font-bold text-[#14532d]">CareBridge</span>
              <span className="text-[11px] font-semibold tracking-widest text-stone-500 uppercase">Neighbors helping neighbors</span>
            </span>
          </a>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-[#14532d] md:flex">
            <a href="#board" className="hover:underline">The board</a>
            <a href="#how" className="hover:underline">How it works</a>
            <a href="#impact" className="hover:underline">Impact</a>
          </nav>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> Post a need or offer</Button>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="grid items-center gap-8 py-10 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-7">
            <Badge tone="gold"><Sparkles className="h-3 w-3" /> A small board with a big heart</Badge>
            <h1 className="font-display mt-5 text-5xl leading-[1.02] font-bold text-[#14532d] sm:text-6xl">
              Small help,<br />close to home.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-700">
              CareBridge is a neighborhood board where people post a small need or a kind offer: a ride to the clinic, a cooked meal, an hour of tutoring. A neighbor nearby claims it, helps, and marks it done. No fees. No sign up. It works offline on this device.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => document.getElementById("board")?.scrollIntoView?.({ behavior: "smooth" })}>Browse the board <ChevronRight className="h-4 w-4" /></Button>
              <Button size="lg" variant="outline" onClick={() => setShowForm(true)}>Post something</Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-stone-600">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#14532d]" /> Free for everyone</span>
              <span className="inline-flex items-center gap-1.5"><WifiOff className="h-4 w-4 text-[#14532d]" /> Works offline</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-[#14532d]" /> Built for one neighborhood at a time</span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Card className="p-6">
              <p className="text-xs font-bold tracking-widest text-[#c96f4a] uppercase">Needs help soon</p>
              {featured && (
                <>
                  <h2 className="font-display mt-3 text-2xl leading-snug font-bold text-[#14532d]">{featured.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{featured.detail}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge tone="sage">{featured.category}</Badge>
                    <Badge tone="stone"><MapPin className="h-3 w-3" /> {featured.area}</Badge>
                    <Badge tone="clay">{featured.urgency} urgency</Badge>
                  </div>
                  <Button className="mt-5 w-full" onClick={() => setSelected(featured)}>See how to help</Button>
                  <p className="mt-3 text-center text-xs text-stone-500">Posted by {featured.name} · {timeAgo(featured.createdAt)}</p>
                </>
              )}
            </Card>
            <div id="impact" className="mt-4 grid grid-cols-4 gap-3 text-center">
              {[
                { n: stats.open, l: "Open now" },
                { n: stats.claimed, l: "Claimed" },
                { n: stats.done, l: "Done" },
                { n: stats.helpers, l: "Helpers" },
              ].map((s) => (
                <div key={s.l} className="rounded-3xl border border-[#14532d]/10 bg-white px-2 py-4 card-shadow">
                  <p className="font-display text-2xl font-bold text-[#14532d]">{s.n}</p>
                  <p className="text-[11px] font-bold tracking-wide text-stone-500 uppercase">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Post form */}
        {showForm && (
          <section className="pb-10">
            <Card className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-bold text-[#14532d]">Post a need or an offer</h2>
                  <p className="mt-1 text-sm text-stone-600">Keep it small and specific. One task, one neighbor, one good day.</p>
                </div>
                <button onClick={() => setShowForm(false)} aria-label="Close form" className="rounded-full p-2 text-stone-500 hover:bg-stone-100"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={submitPost} className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="f-kind">I am posting</Label>
                  <Select id="f-kind" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} className="mt-1.5">
                    <option value="need">A need: I could use a hand</option>
                    <option value="offer">An offer: I can help</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="f-cat">Category</Label>
                  <Select id="f-cat" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="mt-1.5">
                    {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                  {errors.category && <p className="mt-1 text-xs font-medium text-red-700">{errors.category}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="f-title">Title</Label>
                  <Input id="f-title" placeholder="For example: Ride to the clinic on Thursday morning" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1.5" />
                  {errors.title && <p className="mt-1 text-xs font-medium text-red-700">{errors.title}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="f-detail">Details</Label>
                  <Textarea id="f-detail" rows={3} placeholder="What exactly, when, and anything a helper should know." value={draft.detail} onChange={(e) => setDraft({ ...draft, detail: e.target.value })} className="mt-1.5" />
                  {errors.detail && <p className="mt-1 text-xs font-medium text-red-700">{errors.detail}</p>}
                </div>
                <div>
                  <Label htmlFor="f-name">Your name</Label>
                  <Input id="f-name" placeholder="For example: Fatima A." value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1.5" />
                  {errors.name && <p className="mt-1 text-xs font-medium text-red-700">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="f-area">Your area</Label>
                  <Input id="f-area" placeholder="For example: Sabon Gari" value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })} className="mt-1.5" />
                  {errors.area && <p className="mt-1 text-xs font-medium text-red-700">{errors.area}</p>}
                </div>
                <div>
                  <Label htmlFor="f-urg">Urgency</Label>
                  <Select id="f-urg" value={draft.urgency} onChange={(e) => setDraft({ ...draft, urgency: e.target.value })} className="mt-1.5">
                    <option value="Normal">Normal</option>
                    <option value="High">High: needed soon</option>
                  </Select>
                </div>
                <div className="flex items-end gap-3">
                  <Button type="submit" className="flex-1">Publish to the board</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          </section>
        )}

        {/* Board */}
        <section id="board" className="pb-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-4xl font-bold text-[#14532d]">The neighborhood board</h2>
              <p className="mt-1 text-sm text-stone-600">{visible.length} of {posts.length} posts shown. Claim one and make someone's week.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetDemo}>Reset sample board</Button>
          </div>

          <Card className="mt-5 p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-12">
              <div className="relative md:col-span-5">
                <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input aria-label="Search posts" placeholder="Search needs, offers, areas..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-11" />
              </div>
              <div className="md:col-span-2">
                <Select aria-label="Filter by type" value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="all">Needs and offers</option>
                  <option value="need">Needs only</option>
                  <option value="offer">Offers only</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="all">Any status</option>
                  <option value="open">Open</option>
                  <option value="claimed">Claimed</option>
                  <option value="done">Done</option>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Select aria-label="Sort posts" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="urgent">Most urgent first</option>
                  <option value="loved">Most loved first</option>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={category === c ? "rounded-full bg-[#14532d] px-4 py-2 text-sm font-semibold text-[#fdf8ee]" : "rounded-full border border-[#14532d]/25 bg-white px-4 py-2 text-sm font-semibold text-[#14532d] hover:bg-[#dce8d8]/60"}>
                  {c}
                </button>
              ))}
            </div>
          </Card>

          {visible.length === 0 ? (
            <Card className="mt-6 p-10 text-center">
              <HandHeart className="mx-auto h-10 w-10 text-[#14532d]" />
              <h3 className="font-display mt-3 text-2xl font-bold text-[#14532d]">Nothing matches yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-stone-600">Try a different search, or be the first to post. A small offer today can be exactly what a neighbor needs.</p>
              <Button className="mt-5" onClick={() => setShowForm(true)}>Post the first one</Button>
            </Card>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => {
                const Icon = CATEGORY_ICONS[p.category] || Heart
                return (
                  <Card key={p.id} className="flex flex-col p-5 transition-shadow">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dce8d8] text-[#14532d]"><Icon className="h-4 w-4" /></span>
                        <Badge tone={p.kind === "need" ? "clay" : "sage"}>{p.kind === "need" ? "Need" : "Offer"}</Badge>
                      </span>
                      <Badge tone={p.status === "open" ? "gold" : p.status === "claimed" ? "sage" : "forest"}>{p.status}</Badge>
                    </div>
                    <h3 className="font-display mt-4 text-xl leading-snug font-bold text-[#14532d]">{p.title}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-600">{p.detail}</p>
                    <div className="mt-4 space-y-1.5 text-xs font-medium text-stone-500">
                      <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {p.area} · {p.category}{p.urgency === "High" ? " · High urgency" : ""}</p>
                      <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {p.name} · {timeAgo(p.createdAt)}{p.helper ? " · Helper: " + p.helper : ""}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4">
                      <Button size="sm" className="flex-1" onClick={() => setSelected(p)}>{p.status === "open" ? "I can help" : "View details"}</Button>
                      <button onClick={() => toggleLike(p.id)} aria-label={"Love this post, " + p.likes + " loves"} className={liked.includes(p.id) ? "flex items-center gap-1 rounded-full bg-[#f3ddd2] px-3 py-2 text-sm font-bold text-[#8a3b1f]" : "flex items-center gap-1 rounded-full bg-stone-100 px-3 py-2 text-sm font-bold text-stone-600 hover:bg-[#f3ddd2]"}>
                        <Heart className="h-4 w-4" /> {p.likes}
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* How it works */}
        <section id="how" className="py-12">
          <h2 className="font-display text-4xl font-bold text-[#14532d]">How it works</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              { n: "1", t: "Post it plainly", d: "Say what you need or what you can give, in one small task. Add your area so the right neighbor finds it." },
              { n: "2", t: "A neighbor claims it", d: "Someone nearby taps I can help and adds their name. The post moves to claimed so two people do not show up twice." },
              { n: "3", t: "Help, then mark done", d: "After the ride, meal, or lesson, mark it done. The board keeps a gentle count of help given in the neighborhood." },
            ].map((s) => (
              <Card key={s.n} className="p-6">
                <span className="font-display flex h-11 w-11 items-center justify-center rounded-full bg-[#14532d] text-lg font-bold text-[#fdf8ee]">{s.n}</span>
                <h3 className="font-display mt-4 text-2xl font-bold text-[#14532d]">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.d}</p>
              </Card>
            ))}
          </div>
          <Card className="mt-5 bg-[#14532d] p-6 text-[#fdf8ee] sm:p-8" style={{ background: "#14532d" }}>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-display text-3xl font-bold">Your street already has the help it needs.</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#dce8d8]">CareBridge just makes it visible. Post one small thing today, or claim one and be the reason a neighbor smiles.</p>
              </div>
              <Button variant="clay" size="lg" onClick={() => setShowForm(true)}>Start now</Button>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-[#14532d]/10 bg-[#f7efdc]/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-stone-600 sm:flex-row sm:px-6">
          <p><span className="font-display font-bold text-[#14532d]">CareBridge</span> · Neighbors helping neighbors, one request at a time.</p>
          <p>Built by Ibrahim Yahaya · Works offline, your posts stay on this device.</p>
        </div>
      </footer>

      {/* Detail dialog */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label={selected.title}>
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#fdf8ee] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge tone={selected.kind === "need" ? "clay" : "sage"}>{selected.kind === "need" ? "Need" : "Offer"}</Badge>
                <Badge tone="stone">{selected.category}</Badge>
                <Badge tone={selected.status === "open" ? "gold" : selected.status === "claimed" ? "sage" : "forest"}>{selected.status}</Badge>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close details" className="rounded-full p-2 text-stone-500 hover:bg-white"><X className="h-5 w-5" /></button>
            </div>
            <h2 className="font-display mt-4 text-3xl leading-snug font-bold text-[#14532d]">{selected.title}</h2>
            <p className="mt-3 leading-relaxed text-stone-700">{selected.detail}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white p-3"><p className="text-[11px] font-bold tracking-wide text-stone-400 uppercase">Posted by</p><p className="mt-0.5 font-semibold text-[#14532d]">{selected.name}</p></div>
              <div className="rounded-2xl bg-white p-3"><p className="text-[11px] font-bold tracking-wide text-stone-400 uppercase">Area</p><p className="mt-0.5 font-semibold text-[#14532d]">{selected.area}</p></div>
              <div className="rounded-2xl bg-white p-3"><p className="text-[11px] font-bold tracking-wide text-stone-400 uppercase">Urgency</p><p className="mt-0.5 font-semibold text-[#14532d]">{selected.urgency}</p></div>
              <div className="rounded-2xl bg-white p-3"><p className="text-[11px] font-bold tracking-wide text-stone-400 uppercase">Helper</p><p className="mt-0.5 font-semibold text-[#14532d]">{selected.helper || "Not claimed yet"}</p></div>
            </div>
            {selected.status === "open" && (
              <div className="mt-5">
                <Label htmlFor="helper-name">Your name, as the helper</Label>
                <Input id="helper-name" placeholder="For example: Amina S." value={helperName} onChange={(e) => setHelperName(e.target.value)} className="mt-1.5" />
                <Button className="mt-3 w-full" size="lg" onClick={() => handleClaim(selected.id)}><HandHeart className="h-5 w-5" /> I can help with this</Button>
                <p className="mt-2 text-center text-xs text-stone-500">Only claim what you can truly do. You can reopen it later if plans change.</p>
              </div>
            )}
            {selected.status === "claimed" && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button size="lg" onClick={() => handleComplete(selected.id)}><Check className="h-5 w-5" /> Mark done</Button>
                <Button size="lg" variant="outline" onClick={() => handleReopen(selected.id)}>Reopen</Button>
              </div>
            )}
            {selected.status === "done" && (
              <div className="mt-5 rounded-2xl bg-[#dce8d8] p-4 text-center">
                <p className="font-semibold text-[#14532d]">Done, with thanks to {selected.helper || "a kind neighbor"}.</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleReopen(selected.id)}>Reopen this post</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {notice && (
        <div className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md rounded-2xl bg-[#14532d] px-5 py-4 text-sm font-medium text-[#fdf8ee] shadow-2xl sm:left-auto" role="status">
          {notice}
        </div>
      )}
    </div>
  )
}
