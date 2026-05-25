// screens-blog.jsx — Blog listing, Article detail, Category page

const { ARTICLES: _ARTICLES, CATEGORIES: _CATS, TEMPLATES: _TEMPLATES } = window.FN_DATA;

/* ════════════════════════════════════════════════════════════════════════
   SCREEN 2 — BLOG LISTING (sidebar layout — scales to many categories)
   ════════════════════════════════════════════════════════════════════════ */

function BlogListingPage({ tweaks }) {
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(6);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    let arr = _ARTICLES.filter((a) =>
      (activeCat === "all" || a.category === activeCat) &&
      (query === "" || a.title.toLowerCase().includes(query.toLowerCase()) || a.excerpt.toLowerCase().includes(query.toLowerCase()))
    );
    if (sortBy === "read-time") arr = [...arr].sort((a, b) => a.readTime - b.readTime);
    return arr;
  }, [activeCat, query, sortBy]);

  const catsWithCounts = _CATS.map((c) => ({
    ...c,
    count: c.slug === "all" ? _ARTICLES.length : _ARTICLES.filter((a) => a.category === c.slug).length,
  }));

  const featured = _ARTICLES.find((a) => a.featured) || _ARTICLES[0];
  const popularTags = ["HACCP", "FSSAI", "Allergens", "Sampling", "Validation", "Labeling", "Microbiology", "Thermal"];

  const selectCat = (slug) => { setActiveCat(slug); setVisibleCount(6); setDrawerOpen(false); };

  return (
    <div data-screen-label="02 Blog Listing">
      <div className="container page-header">
        <p className="overline">Knowledge Hub</p>
        <h1 className="h-display">Food Technology Blog</h1>
        <p className="sub">Field-tested writing on food safety, quality control, regulatory compliance, and processing — by practitioners, for practitioners.</p>
      </div>

      {/* Featured editorial slot only when no filter is active */}
      {activeCat === "all" && query === "" && (
        <div className="container" style={{ marginBottom: 48 }}>
          <FeaturedArticle article={featured} />
        </div>
      )}

      <div className="container">
        <div className="blog-layout">
          {/* Sidebar */}
          <aside className="blog-sidebar">
            <div className="sidebar-block">
              <h4>Search</h4>
              <div className="sidebar-search">
                <Icon name="search" size={16} />
                <input className="input" placeholder="Search articles…" value={query} onChange={(e) => { setQuery(e.target.value); setVisibleCount(6); }} />
              </div>
            </div>
            <div className="sidebar-block">
              <h4>Browse by topic</h4>
              <div className="cat-list">
                {catsWithCounts.map((c) => (
                  <button
                    key={c.slug}
                    className={"cat-link " + (activeCat === c.slug ? "active" : "")}
                    onClick={() => selectCat(c.slug)}
                  >
                    <span>{c.label}</span>
                    <span className="cat-count">{c.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="sidebar-block">
              <h4>Popular tags</h4>
              <div className="popular-tag-row">
                {popularTags.map((t) => (
                  <span key={t} className="tag tag-neutral" onClick={() => setQuery(t.toLowerCase())}>{t}</span>
                ))}
              </div>
            </div>
            <div className="sidebar-block">
              <NewsletterMini />
            </div>
          </aside>

          {/* Main column */}
          <div>
            {/* Mobile filter row */}
            <div className="mobile-filter-bar">
              <button onClick={() => setDrawerOpen(true)}>
                <span>{catsWithCounts.find((c) => c.slug === activeCat)?.label || "All Topics"}</span>
                <Icon name="arrow" size={14} stroke={2} />
              </button>
              <div className="search-input" style={{ flex: 1, maxWidth: "none" }}>
                <Icon name="search" size={16} />
                <input className="input" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>

            <div className="blog-content-head">
              <p className="result-count">
                <strong>{filtered.length}</strong> {filtered.length === 1 ? "article" : "articles"}
                {activeCat !== "all" && ` in ${catsWithCounts.find((c) => c.slug === activeCat).label}`}
                {query && ` matching "${query}"`}
              </p>
              <div className="sort-select">
                <span style={{ color: "var(--color-muted)", fontSize: "0.78rem" }}>Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="recent">Most recent</option>
                  <option value="read-time">Shortest read</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                variant="search"
                title={query ? `No articles match "${query}"` : "No articles in this filter"}
                message="Try a different topic, clear your search, or browse all articles."
                action={<button className="btn btn-secondary" onClick={() => { setActiveCat("all"); setQuery(""); }}>Clear filters</button>}
              />
            ) : (
              <>
                <div className={"grid-2 stagger-grid " + (tweaks?.cardDensity === "compact" ? "density-compact" : "")} style={{ gap: 24 }} key={activeCat + query + sortBy}>
                  {filtered.slice(0, visibleCount).map((a) => <ArticleCard key={a.slug} article={a} compact={tweaks?.cardDensity === "compact"} />)}
                </div>
                {visibleCount < filtered.length && (
                  <div style={{ textAlign: "center", marginTop: 40 }}>
                    <button className="btn btn-secondary btn-large" onClick={() => setVisibleCount(visibleCount + 6)}>
                      Load more ({filtered.length - visibleCount} more)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <FilterDrawer
          cats={catsWithCounts}
          activeCat={activeCat}
          onSelect={selectCat}
          tags={popularTags}
          onTagClick={(t) => { setQuery(t.toLowerCase()); setDrawerOpen(false); }}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      <section className="section container">
        <NewsletterBanner source="blog" heading="Get new articles every week." sub="One short email a week — practical guidance, no fluff." />
      </section>
    </div>
  );
}

function NewsletterMini() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setState("error"); return; }
    setState("success"); setEmail("");
    setTimeout(() => setState("idle"), 3000);
  };
  return (
    <div style={{ background: "var(--color-surface-light)", borderRadius: "var(--radius-lg)", padding: 20, border: "1px solid var(--color-border)" }}>
      <p className="overline" style={{ fontSize: "0.62rem" }}>Newsletter</p>
      <h5 className="h-card" style={{ marginTop: 8, fontSize: "0.96rem" }}>Get new articles weekly</h5>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }} noValidate>
        <input className="input" type="email" placeholder="you@company.com" value={email} onChange={(e) => { setEmail(e.target.value); if (state !== "idle") setState("idle"); }} style={{ fontSize: "0.82rem", padding: "10px 12px" }} />
        <button className="btn btn-primary btn-small" type="submit" style={{ width: "100%" }}>
          {state === "success" ? "Subscribed ✓" : "Subscribe"}
        </button>
      </form>
      {state === "error" && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 6 }}>Enter a valid email.</p>}
    </div>
  );
}

function FilterDrawer({ cats, activeCat, onSelect, tags, onTagClick, onClose }) {
  return (
    <>
      <div className="filter-drawer-backdrop" onClick={onClose}></div>
      <div className="filter-drawer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h4 className="h-card">Browse by topic</h4>
          <button onClick={onClose} className="modal-close" style={{ position: "static" }}><Icon name="close" size={18} /></button>
        </div>
        <div className="cat-list" style={{ marginBottom: 24 }}>
          {cats.map((c) => (
            <button key={c.slug} className={"cat-link " + (activeCat === c.slug ? "active" : "")} onClick={() => onSelect(c.slug)}>
              <span>{c.label}</span>
              <span className="cat-count">{c.count}</span>
            </button>
          ))}
        </div>
        <h4 className="h-card" style={{ fontSize: "0.92rem", marginBottom: 12 }}>Popular tags</h4>
        <div className="popular-tag-row">
          {tags.map((t) => <span className="tag tag-neutral" key={t} onClick={() => onTagClick(t)}>{t}</span>)}
        </div>
      </div>
    </>
  );
}

function FeaturedArticle({ article }) {
  const { CATEGORIES } = window.FN_DATA;
  const cat = CATEGORIES.find((c) => c.slug === article.category);
  const tagClass = "tag tag-" + (cat?.tag || "green");
  return (
    <Link to={`/blog/${article.slug}`} className="featured-article">
      <div className="featured-cover">
        <img src={article.cover} alt={article.title} />
      </div>
      <div className="featured-body">
        <div className="tags-row">
          <span className="tag tag-accent">Featured</span>
          <span className={tagClass}>{article.categoryLabel}</span>
          <span className="tag tag-neutral"><Icon name="clock" size={11} stroke={2} /> {article.readTime} min read</span>
        </div>
        <h2 className="h-section" style={{ marginTop: 18, fontSize: "1.8rem" }}>{article.title}</h2>
        <p className="body-lead" style={{ marginTop: 14 }}>{article.excerpt}</p>
        <div className="author-row">
          <div className="author-avatar">{article.author.split(" ").map((p) => p[0]).join("")}</div>
          <div>
            <div className="author-name">{article.author}</div>
            <div className="author-meta">{article.publishedAt} · {article.authorRole}</div>
          </div>
        </div>
      </div>
      <style>{`
        .featured-article {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 0;
          background: var(--color-card-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }
        .featured-article:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-card);
          border-color: #d8d3bf;
        }
        .featured-cover {
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: var(--color-surface-light);
        }
        .featured-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 600ms ease; }
        .featured-article:hover .featured-cover img { transform: scale(1.03); }
        .featured-body { padding: 40px; display: flex; flex-direction: column; justify-content: center; }
        @media (max-width: 800px) {
          .featured-article { grid-template-columns: 1fr; }
          .featured-cover { aspect-ratio: 16 / 9; }
          .featured-body { padding: 28px; }
        }
      `}</style>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SCREEN 4 — CATEGORY FILTER PAGE
   Same sidebar layout as Blog Listing, with the chosen category pre-selected.
   ════════════════════════════════════════════════════════════════════════ */

function CategoryPage({ slug, tweaks }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(6);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setVisibleCount(6); }, [slug]);

  const cat = _CATS.find((c) => c.slug === slug);
  if (!cat) return <NotFound />;

  const filtered = useMemo(() => {
    let arr = _ARTICLES.filter((a) =>
      a.category === slug &&
      (query === "" || a.title.toLowerCase().includes(query.toLowerCase()))
    );
    if (sortBy === "read-time") arr = [...arr].sort((a, b) => a.readTime - b.readTime);
    return arr;
  }, [slug, query, sortBy]);

  const catsWithCounts = _CATS.map((c) => ({
    ...c,
    count: c.slug === "all" ? _ARTICLES.length : _ARTICLES.filter((a) => a.category === c.slug).length,
  }));

  const popularTags = ["HACCP", "FSSAI", "Allergens", "Sampling", "Validation", "Labeling"];

  const navTo = (s) => { window.location.hash = s === "all" ? "/blog" : `/blog/category/${s}`; setDrawerOpen(false); };

  return (
    <div data-screen-label="04 Category">
      <div className="container" style={{ paddingTop: 32 }}>
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Blog", to: "/blog" }, { label: cat.label }]} />
        <div className="page-header" style={{ paddingTop: 0 }}>
          <p className="overline">{cat.label}</p>
          <h1 className="h-display">{cat.label} articles</h1>
          <p className="sub">{filtered.length} {filtered.length === 1 ? "article" : "articles"} on {cat.label.toLowerCase()} — sorted by recency.</p>
        </div>
      </div>

      <div className="container">
        <div className="blog-layout">
          <aside className="blog-sidebar">
            <div className="sidebar-block">
              <h4>Search</h4>
              <div className="sidebar-search">
                <Icon name="search" size={16} />
                <input className="input" placeholder={`Search ${cat.label.toLowerCase()}…`} value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
            <div className="sidebar-block">
              <h4>Browse by topic</h4>
              <div className="cat-list">
                {catsWithCounts.map((c) => (
                  <button key={c.slug} className={"cat-link " + (c.slug === slug ? "active" : "")} onClick={() => navTo(c.slug)}>
                    <span>{c.label}</span>
                    <span className="cat-count">{c.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="sidebar-block">
              <h4>Popular tags</h4>
              <div className="popular-tag-row">
                {popularTags.map((t) => <span key={t} className="tag tag-neutral" onClick={() => setQuery(t.toLowerCase())}>{t}</span>)}
              </div>
            </div>
            <div className="sidebar-block">
              <NewsletterMini />
            </div>
          </aside>

          <div>
            <div className="mobile-filter-bar">
              <button onClick={() => setDrawerOpen(true)}>
                <span>{cat.label}</span>
                <Icon name="arrow" size={14} stroke={2} />
              </button>
              <div className="search-input" style={{ flex: 1, maxWidth: "none" }}>
                <Icon name="search" size={16} />
                <input className="input" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>

            <div className="blog-content-head">
              <p className="result-count">
                <strong>{filtered.length}</strong> {filtered.length === 1 ? "article" : "articles"} in {cat.label}
                {query && ` matching "${query}"`}
              </p>
              <div className="sort-select">
                <span style={{ color: "var(--color-muted)", fontSize: "0.78rem" }}>Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="recent">Most recent</option>
                  <option value="read-time">Shortest read</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                variant="search"
                title={`No ${cat.label.toLowerCase()} articles match`}
                message={query ? `Try clearing your search or browsing related categories.` : "This category has no articles yet — check back soon."}
                action={<button className="btn btn-secondary" onClick={() => setQuery("")}>Clear search</button>}
              />
            ) : (
              <>
                <div className={"grid-2 stagger-grid " + (tweaks?.cardDensity === "compact" ? "density-compact" : "")} style={{ gap: 24 }} key={slug + query + sortBy}>
                  {filtered.slice(0, visibleCount).map((a) => <ArticleCard key={a.slug} article={a} />)}
                </div>
                {visibleCount < filtered.length && (
                  <div style={{ textAlign: "center", marginTop: 40 }}>
                    <button className="btn btn-secondary btn-large" onClick={() => setVisibleCount(visibleCount + 6)}>Load more</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <FilterDrawer
          cats={catsWithCounts}
          activeCat={slug}
          onSelect={navTo}
          tags={popularTags}
          onTagClick={(t) => { setQuery(t.toLowerCase()); setDrawerOpen(false); }}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      <section className="section container">
        <NewsletterBanner source="category" />
      </section>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SCREEN 3 — ARTICLE DETAIL  (the deep screen — extra polish)
   ════════════════════════════════════════════════════════════════════════ */

function ArticleDetailPage({ slug }) {
  const article = _ARTICLES.find((a) => a.slug === slug);
  if (!article) return <NotFound />;
  const cat = _CATS.find((c) => c.slug === article.category);
  const tagClass = "tag tag-" + (cat?.tag || "green");

  const related = _ARTICLES.filter((a) => a.slug !== slug && a.category === article.category).slice(0, 3);
  const fallback = _ARTICLES.filter((a) => a.slug !== slug).slice(0, 3 - related.length);
  const relatedArticles = [...related, ...fallback].slice(0, 3);

  useReadingProgress("article-body", true);

  return (
    <div data-screen-label="03 Article Detail">
      <div className="container" style={{ paddingTop: 32 }}>
        <Breadcrumb items={[
          { label: "Home", to: "/" },
          { label: "Blog", to: "/blog" },
          { label: article.categoryLabel, to: `/blog/category/${article.category}` },
        ]} />
      </div>

      <article className="container">
        <header style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div className="tags-row" style={{ justifyContent: "center", marginBottom: 22 }}>
            <span className={tagClass}>{article.categoryLabel}</span>
            <span className="tag tag-neutral"><Icon name="clock" size={11} stroke={2} /> {article.readTime} min read</span>
          </div>
          <h1 className="h-display" style={{ fontSize: "clamp(2rem, 4.4vw, 3.2rem)", marginBottom: 0 }}>{article.title}</h1>
          <p className="body-lead" style={{ marginTop: 22, fontSize: "1.15rem" }}>{article.excerpt}</p>
          <HeaderAuthorChip article={article} />
        </header>

        <div className="article-hero-cover">
          <img src={article.cover} alt={article.title} />
        </div>

        <div id="article-body" className="article-content" style={{ marginTop: 56 }}>
          <ArticleBody article={article} />

          {/* Tags row */}
          <div className="tags-row" style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--color-border)" }}>
            <span className="caption" style={{ marginRight: 8 }}>Tagged:</span>
            {article.tags.map((t) => <span className="tag tag-outline-green" key={t}>{t}</span>)}
          </div>

          {/* Share row */}
          <ShareRow article={article} />
        </div>
      </article>

      {/* Author bio (prominent) */}
      <section className="container">
        <div className="article-content" style={{ marginTop: 56 }}>
          <AuthorBioCard article={article} />
        </div>
      </section>

      {/* Related articles */}
      <section className="section container">
        <Reveal><SectionHeader overline="Keep reading" title="You might also like" /></Reveal>
        <div className="grid-3 stagger-grid">
          {relatedArticles.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </div>
      </section>

      <section className="section container">
        <NewsletterBanner source="article" />
      </section>
    </div>
  );
}

function ArticleBody({ article }) {
  // Generate realistic body content. The actual paragraphs vary by category to feel real.
  const intro = {
    "food-safety": "Most HACCP failures in small Indian food businesses are not knowledge gaps — they are documentation gaps. Audit findings I see repeatedly: missing verification records, vague monitoring procedures, and CCP determinations that look reverse-engineered.",
    "regulatory": "FSSAI rolled out three substantive changes in 2026 that affect renewal timelines, product categorization, and labeling. Most of these flew under the radar. Here is what you need to act on now.",
    "quality-control": "A shelf-life study is only as good as the rigor behind it. Auditors do not penalize you for shorter shelf-life claims — they penalize claims you cannot defend.",
    "processing": "Process validation is one of those words that sounds heavier than it is. Strip it down: you are demonstrating, with evidence, that your process consistently delivers a product within specification.",
    "industry-insights": "Two trends define Indian food-tech capital deployment in 2026: a clear shift from D2C food brands to B2B ingredient and infrastructure plays, and a quiet emergence of cell-cultured protein companies hitting commercial milestones.",
  };

  return (
    <>
      <p className="lede">{intro[article.category] || article.excerpt}</p>

      <p>
        This piece walks through the practical workflow we use in client engagements — the same shortcuts that have helped 40+ food businesses pass third-party audits without the customary six-month documentation marathon. Read it once for context, then use it as a checklist.
      </p>

      <h2>The shortest path that still holds up</h2>
      <p>
        Every system in this category — HACCP, GMP, QMS — has a common spine: scope, hazard analysis, controls, monitoring, verification, and review. If you can name your facility's answer to each of these in one paragraph, you are 80% of the way to a defensible system.
      </p>
      <p>
        The mistake we see in over-engineered systems is treating documentation as the deliverable. It is not. The deliverable is <strong>a working set of habits</strong> that the documentation describes. Build the habits first, then write down what you actually do.
      </p>

      <blockquote>
        The audit is not the goal. The goal is a kitchen that runs the same way on a Tuesday at 3pm as it does on a Saturday at 11am — with or without the founder in the room.
      </blockquote>

      <h2>Scoping: where most plans go wrong</h2>
      <p>
        Scope creep in HACCP and QMS plans is the single biggest predictor of an unmaintained system. We see plans built around <em>aspirational</em> facility states — six lines instead of two, three SKUs instead of one — and then collapse under their own weight when the facility actually grows.
      </p>
      <p>
        Scope to <strong>what you do today</strong>. Add an annual review where you decide whether scope expansion is warranted. Most facilities are better served by deepening their current plan than broadening it.
      </p>

      <h3>A practical scoping checklist</h3>
      <ul>
        <li>Products: list SKUs by category, not brand name.</li>
        <li>Processes: write each as a verb — "pasteurize at 72°C for 15s", not "thermal treatment".</li>
        <li>Lines: physically map them. Pen and paper, then formalize.</li>
        <li>People: name the role, not the person. Roles outlast tenure.</li>
        <li>Exclusions: write them down. Auditors prefer explicit out-of-scope statements.</li>
      </ul>

      <div className="pull-quote">
        Most small facilities only need 12-18 SOPs. If yours is creeping past 30, you are documenting tasks that should be training, not procedures.
      </div>

      <h2>Hazard analysis without the spreadsheet hell</h2>
      <p>
        The 4×4 likelihood-severity matrix works fine. The real lift is in the <em>justification column</em> — auditors are not checking your math, they are checking your reasoning. A short, defensible paragraph beats a 200-row spreadsheet every time.
      </p>
      <p>
        For each identified hazard, answer three questions in plain language: How likely is it given our process? How bad would it be? What is already controlling it? If your existing controls are doing the work, the hazard does not need to be elevated to a CCP — even if the matrix suggests it does.
      </p>

      <h2>Documentation that lives in the workflow</h2>
      <p>
        The best food safety documentation is the kind operators barely notice they are using — short SOPs that fit on a single laminated card, monitoring logs that take 15 seconds to complete, and verification forms that auditors can read in under a minute.
      </p>
      <p>
        We have moved most of our client documentation off paper entirely. A shared <code>monitoring-log.xlsx</code> in a tablet at the line, automatic timestamping, and a weekly export to the QA folder beats a clipboard binder every time — for the operator <em>and</em> for the auditor.
      </p>

      <div className="in-article-cta">
        <div>
          <p className="overline">Template</p>
          <p className="body" style={{ fontSize: "0.96rem", marginTop: 4 }}>Get the HACCP Plan Template with all monitoring forms and verification logs.</p>
        </div>
        <Link to="/templates/haccp-plan-template-dairy" className="btn btn-primary">Download →</Link>
      </div>

      <h2>Closing thoughts</h2>
      <p>
        Build the system you can actually run. Document the habits you have, not the ones you wish you had. Schedule a real annual review — and treat it as the most important meeting on your calendar. The certificate on your wall is a side effect of doing this work well; do not let it become the point.
      </p>
    </>
  );
}

function HeaderAuthorChip({ article }) {
  const { AUTHORS } = window.FN_DATA;
  const author = AUTHORS[article.author] || { name: article.author, linkedin: "#", twitter: "#" };
  const initials = author.name.split(" ").map((p) => p[0]).join("");
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
      <div className="header-author-chip">
        <div className="author-avatar">{initials}</div>
        <div className="info">
          <div className="author-name">{author.name}</div>
          <div className="author-meta">{article.publishedAt} · {article.authorRole}</div>
        </div>
        <div className="socials">
          <a href={author.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${author.name} on LinkedIn`} onClick={(e) => e.stopPropagation()}>
            <Icon name="linkedin" size={14} />
          </a>
          <a href={author.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${author.name} on Twitter`} onClick={(e) => e.stopPropagation()}>
            <Icon name="twitter" size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

function AuthorBioCard({ article }) {
  const { AUTHORS } = window.FN_DATA;
  const author = AUTHORS[article.author] || {
    name: article.author,
    role: article.authorRole,
    bio: `${article.authorRole}. Writes practical, audit-ready guidance for food safety and QA teams.`,
    linkedin: "#", twitter: "#", articleCount: 1,
  };
  const initials = author.name.split(" ").map((p) => p[0]).join("");
  return (
    <div className="author-bio-card">
      <div className="author-bio-avatar">{initials}</div>
      <div className="author-bio-content">
        <p className="overline">About the author</p>
        <h4>{author.name}</h4>
        <div className="role">{author.role}</div>
        <p className="bio">{author.bio}</p>
        <div className="author-actions">
          <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin" aria-label={`${author.name} on LinkedIn`}>
            <Icon name="linkedin" size={16} />
          </a>
          <a href={author.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter" aria-label={`${author.name} on Twitter`}>
            <Icon name="twitter" size={16} />
          </a>
          <span className="author-divider"></span>
          <span className="meta-pill"><Icon name="file" size={13} stroke={2} /> {author.articleCount} articles</span>
          <span className="meta-pill"><Icon name="mail" size={13} stroke={2} /> hello@foodnme.in</span>
        </div>
      </div>
    </div>
  );
}

function ShareRow({ article }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
      <span className="caption">Share this article:</span>
      <button className="btn btn-secondary btn-small" onClick={copy}>{copied ? "Copied ✓" : "Copy link"}</button>
      <button className="btn btn-secondary btn-small"><Icon name="linkedin" size={13} /> LinkedIn</button>
      <button className="btn btn-secondary btn-small"><Icon name="twitter" size={13} /> Twitter</button>
      <button className="btn btn-secondary btn-small"><Icon name="mail" size={13} stroke={2} /> Email</button>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
      <p className="overline">404</p>
      <h1 className="h-display" style={{ marginTop: 16 }}>Page not found</h1>
      <p className="body-lead" style={{ marginTop: 16 }}>That page doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-primary btn-large" style={{ marginTop: 24, display: "inline-flex" }}>Back home</Link>
    </div>
  );
}

Object.assign(window, { BlogListingPage, ArticleDetailPage, CategoryPage, FeaturedArticle, NotFound });
