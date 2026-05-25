// screens-experts.jsx — Experts Listing, Expert Detail, Contact Modal

/* ════════════════════════════════════════════════════════════════════════
   EXPERTS LISTING
   ════════════════════════════════════════════════════════════════════════ */

function ExpertsListingPage() {
  const { EXPERTS, SPECIALIZATIONS } = window.FN_DATA;
  const [query, setQuery] = useState("");
  const [activeSpecs, setActiveSpecs] = useState([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  const toggle = (arr, val, setter) => setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const filtered = useMemo(() => {
    let arr = EXPERTS.filter((e) =>
      (query === "" || e.name.toLowerCase().includes(query.toLowerCase()) || e.title.toLowerCase().includes(query.toLowerCase()) || e.specializations.some((s) => s.toLowerCase().includes(query.toLowerCase()))) &&
      (activeSpecs.length === 0 || activeSpecs.some((s) => e.specializations.includes(s))) &&
      (!availableOnly || e.available) &&
      (!featuredOnly || e.featured)
    );
    if (sortBy === "rating") arr = [...arr].sort((a, b) => b.rating - a.rating);
    else if (sortBy === "experience") arr = [...arr].sort((a, b) => b.experience_years - a.experience_years);
    return arr;
  }, [EXPERTS, query, activeSpecs, availableOnly, featuredOnly, sortBy]);

  const clearAll = () => { setQuery(""); setActiveSpecs([]); setAvailableOnly(false); setFeaturedOnly(false); };

  return (
    <div data-screen-label="13 Experts Listing">
      <div className="container page-header">
        <p className="overline">Expert Directory</p>
        <h1 className="h-display">Vetted food-technology experts</h1>
        <p className="sub">Auditors, consultants, R&D scientists, and regulatory specialists available for short engagements and longer projects.</p>
      </div>

      <div className="container">
        <div className="listing-layout">
          <aside className="listing-sidebar">
            <div className="filter-group">
              <h4>Search</h4>
              <div className="sidebar-search">
                <Icon name="search" size={16} />
                <input className="input" placeholder="Name, expertise, role…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
            <div className="filter-group">
              <h4>Quick filters</h4>
              <label className="checkbox-row">
                <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
                <span>Available right now</span>
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
                <span>Verified experts only</span>
              </label>
            </div>
            <div className="filter-group">
              <h4>Specialization</h4>
              <div style={{ maxHeight: 280, overflowY: "auto", paddingRight: 6, marginRight: -6 }}>
                {SPECIALIZATIONS.map((s) => (
                  <label key={s} className="checkbox-row">
                    <input type="checkbox" checked={activeSpecs.includes(s)} onChange={() => toggle(activeSpecs, s, setActiveSpecs)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <button className="btn btn-secondary btn-small" style={{ width: "100%" }} onClick={clearAll}>Clear all filters</button>
            </div>
          </aside>

          <div>
            <div className="blog-content-head">
              <p className="result-count"><strong>{filtered.length}</strong> {filtered.length === 1 ? "expert" : "experts"} found</p>
              <div className="sort-select">
                <span style={{ color: "var(--color-muted)", fontSize: "0.78rem" }}>Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="rating">Top rated</option>
                  <option value="experience">Most experienced</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                variant="filter"
                title="No experts match your filters"
                message="Try removing a specialization, toggling availability off, or clearing your search."
                action={<button className="btn btn-secondary" onClick={clearAll}>Clear filters</button>}
              />
            ) : (
              <div className="grid-2 stagger-grid" style={{ gap: 16 }} key={JSON.stringify({ query, activeSpecs, availableOnly, featuredOnly, sortBy })}>
                {filtered.map((e) => <ExpertCard key={e.id} expert={e} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="section container">
        <NewsletterBanner source="experts" heading="Featured experts every month." sub="Curated profiles in your inbox once a month. No spam." />
      </section>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   EXPERT DETAIL
   ════════════════════════════════════════════════════════════════════════ */

function ExpertDetailPage({ id }) {
  const { EXPERTS } = window.FN_DATA;
  const expert = EXPERTS.find((e) => e.id === id);
  if (!expert) return <NotFound />;
  const similar = EXPERTS.filter((e) => e.id !== id && e.specializations.some((s) => expert.specializations.includes(s))).slice(0, 3);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div data-screen-label="14 Expert Detail">
      <div className="container" style={{ paddingTop: 32 }}>
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Experts", to: "/experts" }, { label: expert.name }]} />
      </div>

      <div className="container">
        <div className="expert-detail-hero">
          <div className="expert-detail-avatar">{expert.avatar}</div>
          <div className="expert-detail-meta">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1>{expert.name}</h1>
              {expert.featured && <span className="tag tag-safe"><Icon name="verified" size={11} stroke={2.4} /> Verified</span>}
            </div>
            <div className="title">{expert.title}</div>
            <div className="location"><Icon name="map-pin" size={14} stroke={1.8} /> {expert.location}</div>
            <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap" }}>
              <div className="rating"><Icon name="star" size={16} className="star-icon" /><strong>{expert.rating}</strong> <span className="muted">({expert.reviews} reviews)</span></div>
              <div style={{ fontSize: "0.86rem", color: "var(--color-muted)" }}><strong style={{ color: "var(--color-text)" }}>{expert.experience_years} years</strong> experience</div>
              <div className={"availability " + (expert.available ? "on" : "off")}><span className="dot"></span>{expert.available ? "Available" : "Not available"}</div>
            </div>
          </div>
          <div className="expert-detail-actions">
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em" }}>{expert.rate}</div>
            <button className="btn btn-primary" onClick={() => setContactOpen(true)} disabled={!expert.available}>
              <Icon name="mail" size={15} stroke={2} /> Contact {expert.name.split(" ")[0]}
            </button>
            {!expert.available && <p style={{ fontSize: "0.74rem", color: "var(--color-muted-2)" }}>Currently on engagement</p>}
          </div>
        </div>

        <div className="job-detail-layout" style={{ marginTop: 32 }}>
          <div className="job-detail-content">
            <h2 className="h-section" style={{ fontSize: "1.3rem" }}>About</h2>
            <p className="body-lead" style={{ marginTop: 14, color: "var(--color-text)" }}>{expert.bio}</p>
            <p className="body" style={{ marginTop: 14 }}>
              Over the past {expert.experience_years} years, {expert.name.split(" ")[0]} has worked with food businesses ranging from co-packers to category leaders. Engagements include audit preparation, system design, training, and on-site implementation.
            </p>

            <h3 className="h-card" style={{ marginTop: 32, fontSize: "1.1rem" }}>Specializations</h3>
            <div className="tags-row" style={{ marginTop: 12 }}>
              {expert.specializations.map((s) => <span key={s} className="tag tag-outline-green">{s}</span>)}
            </div>

            <h3 className="h-card" style={{ marginTop: 32, fontSize: "1.1rem" }}>Certifications</h3>
            <ul className="req-list">
              {expert.certifications.map((c) => (
                <li key={c}><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>{c}</li>
              ))}
            </ul>

            <h3 className="h-card" style={{ marginTop: 32, fontSize: "1.1rem" }}>Engagement types</h3>
            <div className="grid-3" style={{ marginTop: 14, gap: 12 }}>
              {[
                { title: "Hourly consult", desc: "30-60 min calls for specific questions.", price: expert.rate },
                { title: "Project engagement", desc: "Defined scope, 2-6 week timeline.", price: "Project-based" },
                { title: "Retainer", desc: "Ongoing support, 4-20 hrs/month.", price: "From ₹40,000/mo" },
              ].map((p, i) => (
                <div key={i} className="card" style={{ padding: 18 }}>
                  <h4 className="h-card" style={{ fontSize: "0.95rem" }}>{p.title}</h4>
                  <p className="body" style={{ fontSize: "0.84rem", margin: "8px 0 14px" }}>{p.desc}</p>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-text)", fontSize: "0.92rem" }}>{p.price}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="job-detail-aside">
            <h4 className="h-card" style={{ fontSize: "0.95rem", marginBottom: 14 }}>Quick stats</h4>
            <ul className="detail-meta-list" style={{ marginTop: 0 }}>
              <li><span className="label">Experience</span><span className="value">{expert.experience_years} years</span></li>
              <li><span className="label">Rating</span><span className="value">{expert.rating} / 5.0</span></li>
              <li><span className="label">Reviews</span><span className="value">{expert.reviews}</span></li>
              <li><span className="label">Rate</span><span className="value">{expert.rate}</span></li>
              <li><span className="label">Location</span><span className="value">{expert.location.split(" · ")[0]}</span></li>
              <li><span className="label">Response time</span><span className="value">&lt; 24 hours</span></li>
            </ul>
            <button className="btn btn-secondary btn-block" style={{ marginTop: 18 }}>
              <Icon name="bookmark" size={14} stroke={2} /> Save profile
            </button>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section container">
          <Reveal><SectionHeader overline="Similar experts" title="You might also like" /></Reveal>
          <div className="grid-2 stagger-grid" style={{ gap: 16 }}>
            {similar.map((e) => <ExpertCard key={e.id} expert={e} />)}
          </div>
        </section>
      )}

      {contactOpen && <ContactExpertModal expert={expert} onClose={() => setContactOpen(false)} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CONTACT EXPERT MODAL
   ════════════════════════════════════════════════════════════════════════ */

function ContactExpertModal({ expert, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: "",
    engagement: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const update = (k, v) => { setForm({ ...form, [k]: v }); if (errors[k]) setErrors({ ...errors, [k]: null }); };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Valid email required";
    if (!form.engagement) err.engagement = "Pick an option";
    if (!form.message.trim() || form.message.trim().length < 20) err.message = "Tell us more about your need";
    setErrors(err);
    if (Object.keys(err).length === 0) setSubmitted(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ maxWidth: 580 }}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        {submitted ? (
          <div className="modal-success">
            <div className="check-circle"><Icon name="check" size={28} stroke={2.4} /></div>
            <p className="overline">Inquiry sent</p>
            <h3 className="h-section" style={{ marginTop: 12, fontSize: "1.4rem" }}>Reaching out to {expert.name.split(" ")[0]}</h3>
            <p className="body-lead" style={{ marginTop: 12, maxWidth: 380, margin: "12px auto 0" }}>
              {expert.name} typically responds within 24 hours. We'll loop you in once they reply.
            </p>
            <button className="btn btn-secondary" style={{ marginTop: 28 }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal-header" style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div className="expert-avatar" style={{ width: 56, height: 56, fontSize: "1.05rem" }}>{expert.avatar}</div>
              <div>
                <p className="overline">Contact</p>
                <h3 className="h-section" style={{ marginTop: 4, fontSize: "1.2rem" }}>{expert.name}</h3>
                <p className="body" style={{ fontSize: "0.82rem", marginTop: 2 }}>{expert.title}</p>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="label">Your name *</label>
                    <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} />
                    {errors.name && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input className="input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                    {errors.email && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">Company</label>
                  <input className="input" placeholder="Optional" value={form.company} onChange={(e) => update("company", e.target.value)} />
                </div>
                <div>
                  <label className="label">Engagement type *</label>
                  <select className="select" value={form.engagement} onChange={(e) => update("engagement", e.target.value)}>
                    <option value="">Select…</option>
                    <option value="hourly">Hourly consult (30-60 min)</option>
                    <option value="project">Project engagement (2-6 weeks)</option>
                    <option value="retainer">Retainer (ongoing)</option>
                    <option value="other">Just want to chat</option>
                  </select>
                  {errors.engagement && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.engagement}</p>}
                </div>
                <div>
                  <label className="label">What do you need help with? *</label>
                  <textarea className="textarea" rows="4" placeholder="Share your facility, products, and what you're hoping to accomplish." value={form.message} onChange={(e) => update("message", e.target.value)} />
                  {errors.message && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary btn-large btn-block">Send inquiry</button>
                <p className="caption" style={{ textAlign: "center" }}>{expert.name.split(" ")[0]} typically responds within 24 hours.</p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ExpertsListingPage, ExpertDetailPage, ContactExpertModal });
