// screens-main.jsx — Homepage, Services, Templates listing, Template detail

const { ARTICLES, TEMPLATES, SERVICES, STATS, CATEGORIES, TEMPLATE_CATEGORIES } = window.FN_DATA;

/* ════════════════════════════════════════════════════════════════════════
   SCREEN 1 — HOMEPAGE
   Variants (Tweaks): heroLayout = editorial | split | minimal
   ════════════════════════════════════════════════════════════════════════ */

function HomePage({ tweaks }) {
  const { navigate } = useRouter();
  const modal = useModal();
  const featuredArticle = ARTICLES.find((a) => a.featured) || ARTICLES[0];
  const featuredTemplate = [...TEMPLATES].sort((a, b) => b.downloads - a.downloads)[0];
  const featuredExpert = (window.FN_DATA.EXPERTS || []).find((e) => e.featured) || window.FN_DATA.EXPERTS[0];

  const scenarios = [
    {
      icon: "shield",
      hook: "Audit on Monday?",
      desc: "Download an audit-ready HACCP plan or supplier checklist in under a minute.",
      cta: "Browse templates",
      to: "/templates",
    },
    {
      icon: "file",
      hook: "Wondering about the new FSSAI rules?",
      desc: "Practical explainers on regulatory changes, written by working auditors.",
      cta: "Read the blog",
      to: "/blog",
    },
    {
      icon: "briefcase",
      hook: "Hiring a QC microbiologist?",
      desc: "Post a role to a curated network of food-tech professionals across India.",
      cta: "Explore jobs",
      to: "/jobs",
    },
    {
      icon: "verified",
      hook: "Need expert eyes on a problem?",
      desc: "Book a one-hour consult with an FSSAI auditor or processing specialist.",
      cta: "Find an expert",
      to: "/experts",
    },
  ];

  const testimonials = [
    {
      quote: "Before foodnme, we rebuilt our HACCP plan from scratch every audit cycle. Now we iterate on one good template — and pass the first time.",
      name: "Sneha P.",
      role: "QA Manager, mid-sized dairy",
      initials: "SP",
    },
    {
      quote: "The blog is the only place that writes about FSSAI changes the way a working auditor actually thinks about them. Saved me hours every month.",
      name: "Rohan I.",
      role: "Regulatory Lead, snacks brand",
      initials: "RI",
    },
  ];

  return (
    <div data-screen-label="01 Homepage">
      <HomepageHero variant={tweaks.heroLayout} />

      {/* "Built for" strip — sets context */}
      <section className="container">
        <Reveal>
          <div className="value-strip">
            <p className="overline" style={{ opacity: 1, color: "var(--color-text)" }}>For QA · QC · Regulatory · R&D teams</p>
            <p className="value-line">
              We share the templates, expertise, and people we use ourselves — so you don't have to rebuild from scratch.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Scenarios — engaging hook into each product */}
      <section className="section container">
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p className="overline">How foodnme helps</p>
            <h2 className="h-section" style={{ marginTop: 12, fontSize: "1.9rem" }}>Pick the thing you came here for.</h2>
          </div>
        </Reveal>
        <div className="grid-2 stagger-grid" style={{ gap: 20 }}>
          {scenarios.map((s, i) => (
            <Link key={i} to={s.to} className="scenario-card">
              <div className="scenario-icon">
                <Icon name={s.icon} size={20} stroke={1.8} />
              </div>
              <div className="scenario-body">
                <h3 className="h-card" style={{ fontSize: "1.1rem" }}>{s.hook}</h3>
                <p className="body" style={{ marginTop: 8, fontSize: "0.92rem" }}>{s.desc}</p>
              </div>
              <span className="scenario-cta">
                {s.cta}<Icon name="arrow" size={14} stroke={2.2} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured editorial — single full-bleed magazine moment */}
      <section className="section container">
        <Reveal><SectionHeader overline="This week's read" title="From the Knowledge Hub" link={{ label: "All articles", to: "/blog" }} /></Reveal>
        <Reveal delay={1}>
          <Link to={`/blog/${featuredArticle.slug}`} className="editorial-feature">
            <div className="editorial-image">
              <img src={featuredArticle.cover} alt={featuredArticle.title} />
            </div>
            <div className="editorial-content">
              <div className="tags-row" style={{ marginBottom: 14 }}>
                <span className="tag tag-accent">Featured</span>
                <span className="tag tag-green">{featuredArticle.categoryLabel}</span>
                <span className="tag tag-neutral"><Icon name="clock" size={11} stroke={2} /> {featuredArticle.readTime} min read</span>
              </div>
              <h2 className="h-display" style={{ fontSize: "clamp(1.7rem, 3vw, 2.2rem)", lineHeight: 1.15 }}>{featuredArticle.title}</h2>
              <p className="body-lead" style={{ marginTop: 16, fontSize: "1.02rem" }}>{featuredArticle.excerpt}</p>
              <div className="author-row" style={{ marginTop: 22 }}>
                <div className="author-avatar">{featuredArticle.author.split(" ").map((p) => p[0]).join("")}</div>
                <div>
                  <div className="author-name">{featuredArticle.author}</div>
                  <div className="author-meta">{featuredArticle.publishedAt} · {featuredArticle.authorRole}</div>
                </div>
                <span className="btn btn-ghost" style={{ marginLeft: "auto" }}>Read full piece</span>
              </div>
            </div>
          </Link>
        </Reveal>
      </section>

      {/* Testimonials / social proof — quiet but high-trust */}
      <section style={{ background: "var(--color-surface-light)", padding: "80px 0" }}>
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 44, maxWidth: 600, margin: "0 auto 44px" }}>
              <p className="overline">Why food-tech teams use foodnme</p>
              <h2 className="h-section" style={{ marginTop: 12, fontSize: "1.9rem" }}>"It just saves us time."</h2>
            </div>
          </Reveal>
          <div className="grid-2 stagger-grid" style={{ gap: 20 }}>
            {testimonials.map((t, i) => (
              <figure key={i} className="testimonial">
                <blockquote>
                  <span className="quote-mark" aria-hidden="true">“</span>
                  {t.quote}
                </blockquote>
                <figcaption>
                  <div className="author-avatar">{t.initials}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-meta">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
          <div style={{ marginTop: 48 }}>
            <StatsRow stats={STATS} />
          </div>
        </div>
      </section>

      {/* Featured this week — template + expert as paired hero cards */}
      <section className="section container">
        <Reveal><SectionHeader overline="Featured this week" title="Two things worth your time." /></Reveal>
        <div className="grid-2 stagger-grid" style={{ gap: 20 }}>
          <Link to={`/templates/${featuredTemplate.slug}`} className="feature-hero feature-hero-template">
            <div className="feature-tag">Most downloaded · {featuredTemplate.downloads.toLocaleString()}</div>
            <div className="doc-icon-large">{featuredTemplate.fileType}</div>
            <h3 className="h-section" style={{ fontSize: "1.3rem", marginTop: 18 }}>{featuredTemplate.title}</h3>
            <p className="body" style={{ marginTop: 8 }}>{featuredTemplate.description}</p>
            <div className="feature-footer">
              <span>{featuredTemplate.pages} pages · Updated {featuredTemplate.updatedAt}</span>
              <span className="btn btn-ghost">Download template</span>
            </div>
          </Link>
          {featuredExpert && (
            <Link to={`/experts/${featuredExpert.id}`} className="feature-hero feature-hero-expert">
              <div className="feature-tag">Featured expert · {featuredExpert.rating} ★ ({featuredExpert.reviews} reviews)</div>
              <div className="expert-detail-avatar" style={{ width: 72, height: 72, fontSize: "1.3rem", marginTop: 4 }}>{featuredExpert.avatar}</div>
              <h3 className="h-section" style={{ fontSize: "1.3rem", marginTop: 18 }}>{featuredExpert.name}</h3>
              <p className="body" style={{ marginTop: 4, color: "var(--color-muted)" }}>{featuredExpert.title} · {featuredExpert.experience_years} yrs</p>
              <p className="body" style={{ marginTop: 12 }}>{featuredExpert.bio}</p>
              <div className="feature-footer">
                <span className={"availability " + (featuredExpert.available ? "on" : "off")} style={{ padding: "4px 10px" }}>
                  <span className="dot"></span>{featuredExpert.available ? "Available" : "Busy"}
                </span>
                <span className="btn btn-ghost">View profile</span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section container">
        <Reveal>
          <div className="final-cta">
            <p className="overline" style={{ opacity: 1, color: "var(--color-primary)" }}>Need someone to look at it?</p>
            <h2 className="h-section" style={{ marginTop: 12, fontSize: "1.9rem" }}>Free 30-minute scoping call. No pitch, no commitment.</h2>
            <p className="body-lead" style={{ marginTop: 14, maxWidth: 540, margin: "14px auto 0" }}>
              Tell us your situation. We'll point you to the right template, expert, or service — even if that's somewhere else.
            </p>
            <div className="flex-gap-3" style={{ justifyContent: "center", marginTop: 26 }}>
              <button className="btn btn-primary btn-large" onClick={modal.open}>Book a consultation</button>
              <Link to="/services" className="btn btn-secondary btn-large">See all services</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Good to know — informational interlude */}
      <section className="section container">
        <Reveal>
          <div className="good-to-know">
            <div className="good-to-know-intro">
              <p className="overline">Good to know</p>
              <h2 className="h-section" style={{ marginTop: 12, fontSize: "1.9rem" }}>A few things about how foodnme works.</h2>
              <p className="body-lead" style={{ marginTop: 16 }}>
                A quick read before you go any deeper — most common questions answered here.
              </p>
              <Link to="/about" className="btn btn-ghost" style={{ marginTop: 18 }}>Read the full About page</Link>
            </div>
            <ul className="qa-list">
              {[
                {
                  q: "How do you decide which templates to publish?",
                  a: "We only ship templates we've used in real engagements ourselves. New additions go through a final audit by an FSSAI-certified reviewer before release."
                },
                {
                  q: "Who writes the articles?",
                  a: "Working auditors, QC managers, and process engineers. No general-purpose bloggers and no AI-generated content."
                },
                {
                  q: "How do you vet the experts?",
                  a: "We verify certifications, check references, and review at least three completed engagements before any expert goes live."
                },
                {
                  q: "Where are you based?",
                  a: "Mumbai. We're built for Indian food businesses first, but most of the resources work globally."
                },
                {
                  q: "Can I trust the jobs board?",
                  a: "Every posting goes through an admin review for legitimacy, scope, and compensation transparency before it goes live."
                },
              ].map((item, i) => (
                <li key={i} className="qa-item">
                  <div className="qa-num">0{i + 1}</div>
                  <div>
                    <h4 className="qa-q">{item.q}</h4>
                    <p className="qa-a">{item.a}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Newsletter */}
      <section className="section container">
        <Reveal><NewsletterBanner source="homepage" /></Reveal>
      </section>
    </div>
  );
}

function HomepageHero({ variant = "editorial" }) {
  const { navigate } = useRouter();
  const modal = useModal();
  if (variant === "split") {
    return (
      <section style={{ padding: "80px 0 100px", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <p className="overline">India's Food Technology Resource Hub</p>
            <h1 className="h-display" style={{ marginTop: 18 }}>
              Practical resources for a <em style={{ fontStyle: "italic", color: "var(--color-primary)" }}>safer</em> food ecosystem.
            </h1>
            <p className="body-lead" style={{ marginTop: 22, maxWidth: 540 }}>
              Field-tested HACCP plans, audit checklists, and expert articles for food safety, quality control, and regulatory teams across India.
            </p>
            <div className="flex-gap-3" style={{ marginTop: 28 }}>
              <button className="btn btn-primary btn-large" onClick={() => navigate("/templates")}>Browse templates</button>
              <button className="btn btn-secondary btn-large" onClick={() => navigate("/blog")}>Read the blog</button>
            </div>
          </div>
          <HeroVisualSplit />
        </div>
      </section>
    );
  }
  if (variant === "minimal") {
    return (
      <section style={{ padding: "120px 0 80px", textAlign: "center", position: "relative" }}>
        <div className="container container-narrow">
          <p className="overline">India's Food Technology Resource Hub</p>
          <h1 className="h-display" style={{ marginTop: 18 }}>
            Practical resources for a <em style={{ fontStyle: "italic", color: "var(--color-primary)" }}>safer</em> food ecosystem.
          </h1>
          <p className="body-lead" style={{ marginTop: 22, maxWidth: 580, marginInline: "auto" }}>
            Field-tested HACCP plans, audit checklists, and expert articles for food safety teams across India.
          </p>
          <div className="flex-gap-3" style={{ marginTop: 28, justifyContent: "center" }}>
            <button className="btn btn-primary btn-large" onClick={() => navigate("/templates")}>Browse templates</button>
            <button className="btn btn-secondary btn-large" onClick={() => navigate("/blog")}>Read the blog</button>
          </div>
        </div>
      </section>
    );
  }
  // editorial (default) — improved version
  return (
    <section className="hero-improved">
      <div className="hero-improved-bg">
        <div className="grid-lines"></div>
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </div>
      <div className="container hero-improved-inner">
        <div className="hero-improved-text">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(255,255,255,0.7)", border: "1px solid var(--color-border)", borderRadius: 999, fontFamily: "var(--font-heading)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)" }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--color-secondary)", boxShadow: "0 0 0 4px rgba(127,176,105,0.22)" }}></span>
            India's Food-Tech Resource Hub
          </div>
          <h1 className="h-display">
            Practical resources for a <em style={{ fontStyle: "italic", color: "var(--color-primary)", fontVariationSettings: '"opsz" 96' }}>safer</em> food ecosystem.
          </h1>
          <p className="body-lead" style={{ marginTop: 22 }}>
            Field-tested HACCP plans, audit checklists, and expert writing — built for food safety, QC, and regulatory teams who ship product on Monday morning.
          </p>
          <div className="flex-gap-3" style={{ marginTop: 32, flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-large" onClick={() => navigate("/templates")}>
              <Icon name="download" size={15} stroke={2.2} />Browse templates
            </button>
            <button className="btn btn-secondary btn-large" onClick={modal.open}>Book a consultation</button>
          </div>
          <div className="hero-improved-meta">
            <div className="stat">
              <span className="stat-num"><CountUp value={120} format={(n) => n + "+"} /></span>
              <span className="stat-label">Articles</span>
            </div>
            <div className="stat">
              <span className="stat-num"><CountUp value={48} /></span>
              <span className="stat-label">Templates</span>
            </div>
            <div className="stat">
              <span className="stat-num"><CountUp value={85} format={(n) => n + "+"} /></span>
              <span className="stat-label">Businesses Helped</span>
            </div>
            <div className="stat">
              <span className="stat-num"><CountUp value={4200} format={(n) => (n/1000).toFixed(1) + "k"} duration={1700} /></span>
              <span className="stat-label">Subscribers</span>
            </div>
          </div>
        </div>
        <HeroCollage />
      </div>
    </section>
  );
}

function HeroCollage() {
  return (
    <div className="hero-collage" aria-hidden="true">
      <div className="frame photo-1">
        <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80&auto=format&fit=crop" alt="" />
      </div>
      <div className="frame photo-2">
        <img src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80&auto=format&fit=crop" alt="" />
      </div>
      <div className="frame article-frame">
        <div className="tag-row">
          <span className="tag tag-green">HACCP</span>
        </div>
        <div className="title">HACCP Plan Template — Dairy Processing</div>
        <div className="meta">
          <span>28 pages</span>
          <span>1,840 downloads</span>
        </div>
      </div>
      <div className="frame stat-frame">
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.7rem", color: "var(--color-primary)", lineHeight: 1, letterSpacing: "-0.03em" }}>4.2k</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.66rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-muted)", marginTop: 6 }}>Subscribers</div>
      </div>
    </div>
  );
}

function HeroDecoEditorial() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", right: "-120px", top: "-80px", width: 380, height: 380, borderRadius: 999, background: "radial-gradient(circle at 35% 35%, rgba(127,176,105,0.18), transparent 65%)" }} />
      <div style={{ position: "absolute", right: "20%", top: "60%", width: 160, height: 160, borderRadius: 999, background: "radial-gradient(circle at 50% 50%, rgba(221,161,94,0.16), transparent 65%)" }} />
    </div>
  );
}

function HeroEditorialChips() {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 36, flexWrap: "wrap" }}>
      <span className="tag tag-neutral"><span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--color-secondary)" }}></span> Updated weekly</span>
      <span className="tag tag-green">120+ articles</span>
      <span className="tag tag-orange">48 templates</span>
      <span className="tag tag-neutral">FSSAI · HACCP · QC</span>
    </div>
  );
}

function HeroVisualSplit() {
  return (
    <div style={{ position: "relative", minHeight: 380 }}>
      {/* Stacked card preview */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "100%", maxWidth: 480 }}>
        <div className="card" style={{ position: "absolute", right: 24, top: 20, padding: 18, width: 280, transform: "rotate(-3deg)", boxShadow: "var(--shadow-elevated)" }}>
          <div className="tag tag-green" style={{ marginBottom: 10 }}>Food Safety</div>
          <div className="h-card" style={{ fontSize: "0.95rem", lineHeight: 1.35 }}>A practical HACCP rollout for small food businesses</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: "0.72rem", color: "var(--color-muted-2)" }}>
            <span>Aarti Menon</span><span>9 min read</span>
          </div>
        </div>
        <div className="card" style={{ position: "absolute", right: 100, top: 140, padding: 18, width: 280, transform: "rotate(2deg)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <span className="tag tag-green">HACCP</span>
          </div>
          <div className="h-card" style={{ fontSize: "0.95rem", lineHeight: 1.35 }}>HACCP Plan Template — Dairy Processing</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: "0.72rem", color: "var(--color-muted-2)" }}>
            <span>28 pages</span><span>1.8k downloads</span>
          </div>
        </div>
        <div className="card" style={{ position: "absolute", right: 40, top: 270, padding: 14, width: 220, boxShadow: "var(--shadow-elevated)", transform: "rotate(-1.5deg)" }}>
          <div className="stat-num" style={{ fontSize: "1.5rem" }}>120<span style={{ color: "var(--color-muted-2)", fontSize: "0.9rem" }}>+</span></div>
          <div className="stat-label" style={{ marginTop: 6, fontSize: "0.62rem" }}>Articles Published</div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ overline, title, link, align = "left" }) {
  return (
    <div style={{ display: "flex", justifyContent: align === "center" ? "center" : "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
      <div>
        <p className="overline">{overline}</p>
        <h2 className="h-section" style={{ marginTop: 10 }}>{title}</h2>
      </div>
      {link && <Link to={link.to} className="btn btn-ghost">{link.label}</Link>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SCREEN 5 — TEMPLATES LISTING (sidebar layout, consistent with Jobs/Experts)
   ════════════════════════════════════════════════════════════════════════ */

function TemplatesListingPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [activeFileTypes, setActiveFileTypes] = useState([]);
  const [sortBy, setSortBy] = useState("popular");
  const [downloadedSlug, setDownloadedSlug] = useState(null);

  const toggleFileType = (t) => setActiveFileTypes(activeFileTypes.includes(t) ? activeFileTypes.filter((v) => v !== t) : [...activeFileTypes, t]);

  const filtered = useMemo(() => {
    let arr = TEMPLATES.filter((t) =>
      (activeCat === "all" || t.category === activeCat) &&
      (activeFileTypes.length === 0 || activeFileTypes.includes(t.fileType)) &&
      (query === "" || t.title.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
    );
    if (sortBy === "popular") arr = [...arr].sort((a, b) => b.downloads - a.downloads);
    else if (sortBy === "recent") arr = arr; // already in recent order
    else if (sortBy === "shortest") arr = [...arr].sort((a, b) => a.pages - b.pages);
    return arr;
  }, [activeCat, query, activeFileTypes, sortBy]);

  const catsWithCounts = TEMPLATE_CATEGORIES.map((c) => ({
    ...c,
    count: c.slug === "all" ? TEMPLATES.length : TEMPLATES.filter((t) => t.category === c.slug).length,
  }));

  const handleDownload = (t) => {
    setDownloadedSlug(t.slug);
    setTimeout(() => setDownloadedSlug(null), 2400);
  };

  const clearAll = () => { setActiveCat("all"); setQuery(""); setActiveFileTypes([]); };

  return (
    <div data-screen-label="05 Templates Listing">
      <div className="container page-header">
        <p className="overline">Templates & Resources</p>
        <h1 className="h-display">Templates & Checklists</h1>
        <p className="sub">Download ready-to-use HACCP plans, audit checklists, SOPs, and compliance documents — built by practitioners, audited in the field.</p>
      </div>

      <div className="container">
        <div className="listing-layout">
          <aside className="listing-sidebar">
            <div className="filter-group">
              <h4>Search</h4>
              <div className="sidebar-search">
                <Icon name="search" size={16} />
                <input className="input" placeholder="Search templates…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
            <div className="filter-group">
              <h4>Category</h4>
              <div className="cat-list">
                {catsWithCounts.map((c) => (
                  <button
                    key={c.slug}
                    className={"cat-link " + (activeCat === c.slug ? "active" : "")}
                    onClick={() => setActiveCat(c.slug)}
                  >
                    <span>{c.label}</span>
                    <span className="cat-count">{c.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <h4>File format</h4>
              {["PDF", "DOCX"].map((t) => (
                <label key={t} className="checkbox-row">
                  <input type="checkbox" checked={activeFileTypes.includes(t)} onChange={() => toggleFileType(t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            <div className="filter-group">
              <button className="btn btn-secondary btn-small" style={{ width: "100%" }} onClick={clearAll}>Clear all filters</button>
            </div>
          </aside>

          <div>
            <div className="blog-content-head">
              <p className="result-count">
                <strong>{filtered.length}</strong> {filtered.length === 1 ? "template" : "templates"}
                {activeCat !== "all" && ` in ${catsWithCounts.find((c) => c.slug === activeCat).label}`}
                {query && ` matching "${query}"`}
              </p>
              <div className="sort-select">
                <span style={{ color: "var(--color-muted)", fontSize: "0.78rem" }}>Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="popular">Most downloaded</option>
                  <option value="recent">Most recent</option>
                  <option value="shortest">Shortest</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                variant="filter"
                title="No templates match your filters"
                message="Try clearing a filter or broadening your search — we add new templates every month."
                action={<button className="btn btn-secondary" onClick={clearAll}>Clear filters</button>}
              />
            ) : (
              <div className="grid-2 stagger-grid" style={{ gap: 20 }} key={activeCat + query + activeFileTypes.join(",") + sortBy}>
                {filtered.map((t) => <TemplateCard key={t.slug} template={t} onDownload={handleDownload} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="section container">
        <NewsletterBanner source="templates" heading="Get notified when new templates are added." sub="One short email a month with new and updated templates. No spam." />
      </section>

      <Toast show={!!downloadedSlug} message="Download started — check your downloads folder." />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SCREEN 6 — TEMPLATE DETAIL
   ════════════════════════════════════════════════════════════════════════ */

function TemplateDetailPage({ slug }) {
  const template = TEMPLATES.find((t) => t.slug === slug) || TEMPLATES[0];
  const cat = TEMPLATE_CATEGORIES.find((c) => c.slug === template.category);
  const tagClass = "tag tag-" + (cat?.tag || "green");
  const similar = TEMPLATES.filter((t) => t.slug !== template.slug && t.category === template.category).slice(0, 3);
  const fallback = TEMPLATES.filter((t) => t.slug !== template.slug).slice(0, 3 - similar.length);
  const similarCards = [...similar, ...fallback].slice(0, 3);

  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyState, setNotifyState] = useState("idle");
  const [downloaded, setDownloaded] = useState(false);

  const onDownload = () => { setDownloaded(true); setTimeout(() => setDownloaded(false), 2800); };
  const onNotify = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) { setNotifyState("error"); return; }
    setNotifyState("success"); setNotifyEmail("");
    setTimeout(() => setNotifyState("idle"), 3000);
  };

  return (
    <div data-screen-label="06 Template Detail">
      <div className="container" style={{ paddingTop: 32 }}>
        <Breadcrumb items={[
          { label: "Home", to: "/" },
          { label: "Templates", to: "/templates" },
          { label: template.categoryLabel },
        ]} />

        <div className="page-header" style={{ paddingTop: 0 }}>
          <div className="tags-row" style={{ marginBottom: 16 }}>
            <span className={tagClass}>{template.categoryLabel}</span>
            <span className="tag tag-neutral">{template.fileType} · {template.pages} pages</span>
          </div>
          <h1 className="h-section" style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.4rem)" }}>{template.title}</h1>
          <p className="sub" style={{ marginTop: 12 }}>{template.description}</p>
        </div>
      </div>

      <div className="container" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "flex-start" }}>
        <div className="template-detail-left">
          <div className="card">
            <h3 className="h-card">What's inside this template</h3>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
              {template.sections.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i === template.sections.length - 1 ? "none" : "1px solid var(--color-border)" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--color-tag-safe-bg)", color: "var(--color-tag-safe-text)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="check" size={13} stroke={2.4} />
                  </span>
                  <span style={{ fontSize: "0.92rem", color: "var(--color-text)" }}>{s}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 18, marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--color-border)", fontSize: "0.82rem", color: "var(--color-muted)", flexWrap: "wrap" }}>
              <span><strong style={{ color: "var(--color-text)" }}>Format:</strong> {template.fileType}</span>
              <span><strong style={{ color: "var(--color-text)" }}>Pages:</strong> {template.pages}</span>
              <span><strong style={{ color: "var(--color-text)" }}>Last updated:</strong> {template.updatedAt}</span>
              <span><strong style={{ color: "var(--color-text)" }}>Downloads:</strong> {template.downloads.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 28, background: "var(--color-surface-light)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
            <p className="overline">Customization</p>
            <h3 className="h-card" style={{ marginTop: 8 }}>Need a custom version for your facility?</h3>
            <p className="body" style={{ margin: "8px 0 18px", fontSize: "0.92rem" }}>We adapt any template to your specific processes, products, and regulatory scope. Typical turnaround: 5 business days.</p>
            <Link to="/services#inquiry" className="btn btn-secondary">Request customization</Link>
          </div>
        </div>

        <aside className="template-detail-right" style={{ position: "sticky", top: 90 }}>
          <div className="card" style={{ padding: 28 }}>
            <div className={"doc-icon " + template.fileType.toLowerCase()} style={{ width: 56, height: 72, marginBottom: 20 }}>{template.fileType}</div>
            <button className="btn btn-primary btn-block btn-large" onClick={onDownload}>
              <Icon name="download" size={16} stroke={2.2} /> {downloaded ? "Download started ✓" : "Download template"}
            </button>
            <div style={{ marginTop: 22, paddingTop: 22, borderTop: "1px solid var(--color-border)" }}>
              <p className="caption" style={{ marginBottom: 10 }}>Get notified when this template is revised</p>
              <form onSubmit={onNotify} style={{ display: "flex", gap: 8 }} noValidate>
                <input className="input" type="email" placeholder="you@company.com" value={notifyEmail}
                  style={{ padding: "10px 12px", fontSize: "0.82rem" }}
                  onChange={(e) => { setNotifyEmail(e.target.value); if (notifyState !== "idle") setNotifyState("idle"); }} />
                <button className="btn btn-secondary btn-small" type="submit">{notifyState === "success" ? "✓" : "Notify"}</button>
              </form>
              {notifyState === "error" && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 6 }}>Enter a valid email.</p>}
              {notifyState === "success" && <p style={{ color: "var(--color-tag-safe-text)", fontSize: "0.72rem", marginTop: 6 }}>You'll be the first to know.</p>}
            </div>
          </div>
        </aside>
      </div>

      <section className="section container">
        <Reveal><SectionHeader overline="Related" title="Similar templates" /></Reveal>
        <div className="grid-3 stagger-grid">
          {similarCards.map((t) => <TemplateCard key={t.slug} template={t} onDownload={() => {}} />)}
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) {
          .template-detail-left, .template-detail-right { grid-column: 1; }
          .container > div[style*="grid-template-columns: 1.4fr 1fr"] { grid-template-columns: 1fr !important; }
          .template-detail-right { position: static !important; }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SCREEN 7 — SERVICES
   ════════════════════════════════════════════════════════════════════════ */

function ServicesPage() {
  const [form, setForm] = useState({ full_name: "", email: "", company: "", service: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (k, v) => { setForm({ ...form, [k]: v }); if (errors[k]) setErrors({ ...errors, [k]: null }); };
  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.full_name.trim()) err.full_name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Valid email required";
    if (!form.message.trim() || form.message.trim().length < 20) err.message = "Please share at least a sentence or two";
    setErrors(err);
    if (Object.keys(err).length === 0) {
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setForm({ full_name: "", email: "", company: "", service: "", message: "" }); }, 4500);
    }
  };

  const steps = [
    { num: 1, title: "Submit inquiry", desc: "Tell us about your facility, products, and challenges." },
    { num: 2, title: "Discovery call", desc: "30-minute scoping conversation, free of cost." },
    { num: 3, title: "Proposal & plan", desc: "Written scope with deliverables and timeline." },
    { num: 4, title: "Implementation", desc: "On-site, remote, or hybrid execution support." },
  ];

  return (
    <div data-screen-label="07 Services">
      <section style={{ padding: "88px 0 40px", position: "relative", overflow: "hidden" }}>
        <HeroDecoEditorial />
        <div className="container" style={{ position: "relative", maxWidth: 920 }}>
          <p className="overline">Consulting Services</p>
          <h1 className="h-display" style={{ marginTop: 18 }}>Food Technology Consulting.</h1>
          <p className="body-lead" style={{ marginTop: 22, maxWidth: 620 }}>
            Audit-ready documentation, HACCP rollouts, and FSSAI compliance support for food manufacturers, FBOs, and growing food brands.
          </p>
          <div className="flex-gap-3" style={{ marginTop: 28 }}>
            <a href="#inquiry" className="btn btn-primary btn-large">Request a free consultation</a>
            <a href="#how-it-works" className="btn btn-secondary btn-large">How it works</a>
          </div>
        </div>
      </section>

      <section className="section container">
        <Reveal><SectionHeader overline="Services" title="What we help with" /></Reveal>
        <div className="grid-3 stagger-grid">
          {SERVICES.map((s) => <ServiceCard key={s.slug} service={s} onClick={() => document.getElementById("inquiry").scrollIntoView({ behavior: "smooth" })} />)}
        </div>
      </section>

      {/* Credibility */}
      <section style={{ background: "var(--color-surface-light)", padding: "72px 0" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ aspectRatio: "1 / 1", borderRadius: "var(--radius-lg)", overflow: "hidden", maxWidth: 320, background: "var(--color-card-bg)" }}>
              <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80&auto=format&fit=crop" alt="Founder portrait" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h4 className="h-card" style={{ marginTop: 18 }}>Aarti Menon</h4>
            <p className="caption" style={{ marginTop: 4 }}>Founder · FSSAI Auditor · 12 years</p>
          </div>
          <div>
            <p className="overline">About the founder</p>
            <h2 className="h-section" style={{ marginTop: 12, fontSize: "1.6rem" }}>Twelve years auditing, implementing, and teaching food safety systems.</h2>
            <p className="body-lead" style={{ marginTop: 18 }}>
              I've helped 85+ Indian food businesses — from co-packers to category leaders — build documentation systems that survive third-party audits and scale with the business.
            </p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["FSSAI Accredited Auditor", "GFSI Trained — FSSC 22000", "BSc + MSc Food Technology", "Trainer at NIFTEM workshops"].map((c) => (
                <li key={c} style={{ display: "flex", gap: 8, fontSize: "0.88rem", color: "var(--color-muted)" }}>
                  <Icon name="check" size={16} stroke={2.2} className="muted" />{c}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
              <div><div className="stat-num" style={{ fontSize: "1.7rem" }}><CountUp value={85} format={(n) => n + "+"} /></div><div className="stat-label">Clients helped</div></div>
              <div><div className="stat-num" style={{ fontSize: "1.7rem" }}><CountUp value={12} /></div><div className="stat-label">Years experience</div></div>
              <div><div className="stat-num" style={{ fontSize: "1.7rem" }}><CountUp value={40} format={(n) => n + "+"} /></div><div className="stat-label">FSSAI audits</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section container">
        <Reveal><SectionHeader overline="Process" title="How it works" /></Reveal>
        <div className="stepper stagger-grid">
          {steps.map((s) => (
            <div className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquiry" className="section container">
        <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "48px", maxWidth: 820, margin: "0 auto" }}>
          <p className="overline">Start a conversation</p>
          <h2 className="h-section" style={{ marginTop: 12 }}>Tell us about your food business.</h2>
          <p className="body-lead" style={{ marginTop: 12, marginBottom: 32 }}>
            We respond within 24 hours. The first scoping call is on us — no commitment, no pitch.
          </p>
          {submitted && (
            <div style={{ background: "var(--color-tag-safe-bg)", color: "var(--color-tag-safe-text)", padding: "18px 22px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--color-secondary)", marginBottom: 24, fontSize: "0.92rem" }}>
              ✓ Inquiry received. We'll reach out within 24 hours — usually faster.
            </div>
          )}
          <form className="form-grid" onSubmit={submit} noValidate>
            <div>
              <label className="label">Full name</label>
              <input className="input" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
              {errors.full_name && <p style={{ color: "var(--color-error)", fontSize: "0.74rem", marginTop: 6 }}>{errors.full_name}</p>}
            </div>
            <div>
              <label className="label">Business email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              {errors.email && <p style={{ color: "var(--color-error)", fontSize: "0.74rem", marginTop: 6 }}>{errors.email}</p>}
            </div>
            <div>
              <label className="label">Company name</label>
              <input className="input" value={form.company} onChange={(e) => update("company", e.target.value)} />
            </div>
            <div>
              <label className="label">Service needed</label>
              <select className="select" value={form.service} onChange={(e) => update("service", e.target.value)}>
                <option value="">Select a service…</option>
                {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </select>
            </div>
            <div className="full">
              <label className="label">Describe your challenge</label>
              <textarea className="textarea" rows="5" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="What kind of facility, products, and what's prompting this inquiry?" />
              {errors.message && <p style={{ color: "var(--color-error)", fontSize: "0.74rem", marginTop: 6 }}>{errors.message}</p>}
            </div>
            <div className="full">
              <button type="submit" className="btn btn-primary btn-large btn-block">Send my inquiry</button>
              <p className="caption" style={{ marginTop: 12, textAlign: "center" }}>We respond within 24 hours. No commitment required.</p>
            </div>
          </form>
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) {
          section > .container[style*="grid-template-columns: 1fr 1.4fr"] { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 640px) {
          section > div[style*="padding: \\"48px\\""] { padding: 28px !important; }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { HomePage, TemplatesListingPage, TemplateDetailPage, ServicesPage, SectionHeader, HeroDecoEditorial, AboutPage });

/* ════════════════════════════════════════════════════════════════════════
   ABOUT US
   ════════════════════════════════════════════════════════════════════════ */

function AboutPage() {
  const modal = useModal();
  const offerings = [
    { icon: "file", title: "Knowledge Hub", desc: "Practical, field-tested articles on food safety, QC, regulatory, and processing.", link: "/blog", linkLabel: "Read the blog" },
    { icon: "clipboard", title: "Templates", desc: "HACCP plans, audit checklists, SOPs, and compliance docs — used by 300+ facilities.", link: "/templates", linkLabel: "Browse templates" },
    { icon: "briefcase", title: "Jobs Board", desc: "Curated food-tech roles in QA, R&D, regulatory, and processing across India.", link: "/jobs", linkLabel: "See open roles" },
    { icon: "verified", title: "Expert Directory", desc: "Vetted auditors, consultants, and scientists for short consults or longer engagements.", link: "/experts", linkLabel: "Find an expert" },
  ];

  const values = [
    { title: "Practical over theoretical", desc: "Every resource is built from the field, not the textbook. If an auditor wouldn't approve it, we don't publish it." },
    { title: "Curated, not crowdsourced", desc: "We don't accept submissions. Every template, expert, and job listing is hand-picked or vetted by us before going live." },
    { title: "Quietly opinionated", desc: "We don't list everything. We list what works. A short, curated catalog beats an exhaustive one." },
  ];

  return (
    <div data-screen-label="16 About">
      {/* Hero */}
      <section style={{ padding: "88px 0 56px", position: "relative", overflow: "hidden" }}>
        <HeroDecoEditorial />
        <div className="container" style={{ position: "relative", maxWidth: 820 }}>
          <p className="overline">About foodnme</p>
          <h1 className="h-display" style={{ marginTop: 18 }}>
            We built this for the people who actually <em style={{ fontStyle: "italic", color: "var(--color-primary)", fontVariationSettings: '"opsz" 96' }}>run</em> food businesses.
          </h1>
          <p className="body-lead" style={{ marginTop: 22, maxWidth: 640 }}>
            foodnme is a knowledge platform for food technology professionals across India. We publish practical resources, run a vetted expert directory, and operate a curated jobs board — all in one place.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="container">
        <StatsRow stats={[
          { num: "120+", label: "Articles Published" },
          { num: "48",   label: "Templates" },
          { num: "85+",  label: "Businesses Helped" },
          { num: "4.2k", label: "Newsletter Subscribers" },
        ]} />
      </section>

      {/* Mission */}
      <section className="section container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 56, alignItems: "flex-start" }} className="about-mission">
          <div>
            <p className="overline">Our mission</p>
            <h2 className="h-section" style={{ marginTop: 12 }}>A safer, smarter Indian food ecosystem.</h2>
          </div>
          <div>
            <p className="body-lead">
              Food safety in India is more complicated than it needs to be. SOPs that auditors won't accept. HACCP plans that no one on the floor reads. Compliance binders that gather dust between renewals.
            </p>
            <p className="body-lead" style={{ marginTop: 16 }}>
              We started foodnme to fix that — by sharing the templates we use in our own consulting practice, writing the guides we wished existed, and connecting the practitioners we trust with the businesses that need them.
            </p>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section style={{ background: "var(--color-surface-light)", padding: "72px 0" }}>
        <div className="container">
          <Reveal><SectionHeader overline="What we do" title="Four products, one focus" /></Reveal>
          <div className="grid-2 stagger-grid" style={{ gap: 20 }}>
            {offerings.map((o, i) => (
              <div key={i} className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--color-card-bg)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text)" }}>
                  <Icon name={o.icon} size={22} />
                </div>
                <h3 className="h-card" style={{ fontSize: "1.15rem" }}>{o.title}</h3>
                <p className="body" style={{ fontSize: "0.92rem", margin: 0, flex: 1 }}>{o.desc}</p>
                <Link to={o.link} className="btn btn-ghost" style={{ alignSelf: "flex-start", marginTop: 4 }}>{o.linkLabel}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="section container">
        <Reveal><SectionHeader overline="Who's behind this" title="A small team, by design." /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 56, alignItems: "center" }} className="about-mission">
          <div>
            <div style={{ aspectRatio: "1 / 1", borderRadius: "var(--radius-lg)", overflow: "hidden", maxWidth: 360, background: "var(--color-surface-light)" }}>
              <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80&auto=format&fit=crop" alt="Founder portrait" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
          <div>
            <p className="overline">Founder</p>
            <h3 className="h-section" style={{ fontSize: "1.5rem", marginTop: 8 }}>Aarti Menon</h3>
            <p style={{ color: "var(--color-muted)", marginTop: 4 }}>FSSAI Lead Auditor · 12 years</p>
            <p className="body-lead" style={{ marginTop: 18 }}>
              foodnme is a solo operation — built and maintained out of Mumbai. I've audited and consulted for 85+ Indian food businesses over the past decade, from co-packers to category leaders.
            </p>
            <p className="body" style={{ marginTop: 14 }}>
              The platform grew from a habit: every time a client asked me for "that one template I use", I'd dig it out, redact it, and email it over. Eventually it made more sense to just publish them. The articles, the jobs board, and the expert directory followed for similar reasons — each filling a gap I kept running into.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary"><Icon name="linkedin" size={13} /> LinkedIn</a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary"><Icon name="twitter" size={13} /> Twitter</a>
              <a href="mailto:hello@foodnme.in" className="btn btn-secondary"><Icon name="mail" size={13} stroke={2} /> hello@foodnme.in</a>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: "var(--color-surface-light)" }}>
        <div className="container">
          <Reveal><SectionHeader overline="How we work" title="Three things we won't compromise on" /></Reveal>
          <div className="grid-3 stagger-grid">
            {values.map((v, i) => (
              <div key={i} style={{ background: "var(--color-card-bg)", padding: 28, borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "8px", background: "var(--color-surface-light)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.78rem", color: "var(--color-text)", marginBottom: 16 }}>
                  0{i + 1}
                </div>
                <h4 className="h-card" style={{ fontSize: "1.05rem" }}>{v.title}</h4>
                <p className="body" style={{ marginTop: 8, fontSize: "0.92rem" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section container">
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <p className="overline">Get in touch</p>
          <h2 className="h-section" style={{ marginTop: 12 }}>Need help with food safety, QC, or compliance?</h2>
          <p className="body-lead" style={{ marginTop: 14 }}>
            Book a free 30-minute scoping call. We'll point you to the right template, expert, or service — even if that means sending you elsewhere.
          </p>
          <div className="flex-gap-3" style={{ justifyContent: "center", marginTop: 24 }}>
            <button className="btn btn-primary btn-large" onClick={modal.open}>Book a consultation</button>
            <Link to="/services" className="btn btn-secondary btn-large">See all services</Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) {
          .about-mission { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  );
}
