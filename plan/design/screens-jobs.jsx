// screens-jobs.jsx — Jobs Listing, Job Detail, Apply Flow

/* ════════════════════════════════════════════════════════════════════════
   JOBS LISTING
   ════════════════════════════════════════════════════════════════════════ */

function JobsListingPage() {
  const { JOBS, JOB_TYPES, EXPERIENCE_LEVELS } = window.FN_DATA;
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState([]);
  const [activeLevels, setActiveLevels] = useState([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [salaryMin, setSalaryMin] = useState(0);
  const [sortBy, setSortBy] = useState("recent");

  const toggle = (arr, val, setter) => setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const filtered = useMemo(() => {
    let arr = JOBS.filter((j) =>
      (query === "" || j.title.toLowerCase().includes(query.toLowerCase()) || j.company_name.toLowerCase().includes(query.toLowerCase()) || j.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))) &&
      (activeTypes.length === 0 || activeTypes.includes(j.job_type)) &&
      (activeLevels.length === 0 || activeLevels.includes(j.experience_level)) &&
      (!remoteOnly || j.remote) &&
      (j.salary_max >= salaryMin)
    );
    if (sortBy === "salary") arr = [...arr].sort((a, b) => b.salary_max - a.salary_max);
    return arr;
  }, [JOBS, query, activeTypes, activeLevels, remoteOnly, salaryMin, sortBy]);

  const clearAll = () => { setQuery(""); setActiveTypes([]); setActiveLevels([]); setRemoteOnly(false); setSalaryMin(0); };

  return (
    <div data-screen-label="11 Jobs Listing">
      <div className="container page-header">
        <p className="overline">FoodTech Jobs</p>
        <h1 className="h-display">Find your next food-tech role</h1>
        <p className="sub">Curated openings in food safety, quality, R&D, regulatory, and processing — across India.</p>
      </div>

      <div className="container">
        <div className="listing-layout">
          <aside className="listing-sidebar">
            <div className="filter-group">
              <h4>Search</h4>
              <div className="sidebar-search">
                <Icon name="search" size={16} />
                <input className="input" placeholder="Job title, company, skill…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
            <div className="filter-group">
              <h4>Job type</h4>
              {JOB_TYPES.map((t) => (
                <label key={t} className="checkbox-row">
                  <input type="checkbox" checked={activeTypes.includes(t)} onChange={() => toggle(activeTypes, t, setActiveTypes)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h4>Experience level</h4>
              {EXPERIENCE_LEVELS.map((t) => (
                <label key={t} className="checkbox-row">
                  <input type="checkbox" checked={activeLevels.includes(t)} onChange={() => toggle(activeLevels, t, setActiveLevels)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h4>Salary (min)</h4>
              <div className="range-row">
                <input type="range" min="0" max="2000000" step="100000" value={salaryMin} onChange={(e) => setSalaryMin(parseInt(e.target.value))} />
                <div className="range-display">₹{(salaryMin / 100000).toFixed(1)} L/yr+</div>
              </div>
            </div>
            <div className="filter-group">
              <h4>Remote</h4>
              <label className="checkbox-row">
                <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
                <span>Remote-friendly only</span>
              </label>
            </div>
            <div className="filter-group">
              <button className="btn btn-secondary btn-small" style={{ width: "100%" }} onClick={clearAll}>Clear all filters</button>
            </div>
          </aside>

          <div>
            <div className="blog-content-head">
              <p className="result-count"><strong>{filtered.length}</strong> {filtered.length === 1 ? "job" : "jobs"} matching</p>
              <div className="sort-select">
                <span style={{ color: "var(--color-muted)", fontSize: "0.78rem" }}>Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="recent">Most recent</option>
                  <option value="salary">Highest salary</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                variant="filter"
                title="No jobs match your filters"
                message="Try broadening your salary range, removing a job type, or clearing your search."
                action={<button className="btn btn-secondary" onClick={clearAll}>Clear filters</button>}
              />
            ) : (
              <div className="stagger-grid" style={{ display: "flex", flexDirection: "column", gap: 16 }} key={JSON.stringify({ query, activeTypes, activeLevels, remoteOnly, salaryMin, sortBy })}>
                {filtered.map((j) => <JobCard key={j.id} job={j} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="section container">
        <NewsletterBanner source="jobs" heading="Get new jobs in your inbox." sub="One short email a week with curated openings — vetted by us." />
      </section>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   JOB DETAIL
   ════════════════════════════════════════════════════════════════════════ */

function JobDetailPage({ id }) {
  const { JOBS } = window.FN_DATA;
  const job = JOBS.find((j) => j.id === id);
  if (!job) return <NotFound />;
  const similar = JOBS.filter((j) => j.id !== id && j.experience_level === job.experience_level).slice(0, 3);

  const [applyOpen, setApplyOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div data-screen-label="12 Job Detail">
      <div className="container" style={{ paddingTop: 32 }}>
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Jobs", to: "/jobs" }, { label: job.title }]} />
      </div>

      <div className="container">
        <div className="job-detail-layout">
          <div className="job-detail-content">
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
              <div className="company-logo" style={{ width: 64, height: 64, fontSize: "1.1rem" }}>{job.company_initial}</div>
              <div>
                <div style={{ fontSize: "0.92rem", color: "var(--color-muted)", marginBottom: 6 }}>{job.company_name}</div>
                <h1 className="h-section" style={{ fontSize: "1.9rem" }}>{job.title}</h1>
              </div>
              {job.featured && <span className="tag tag-accent" style={{ marginLeft: "auto" }}>Featured</span>}
            </div>

            <div className="job-card-meta-row" style={{ marginTop: 0 }}>
              <span><Icon name="map-pin" size={14} stroke={1.8} /> {job.location}</span>
              <span><Icon name="briefcase" size={14} stroke={1.8} /> {job.job_type}</span>
              <span><Icon name="trending" size={14} stroke={1.8} /> {job.experience_level}</span>
              <span><Icon name="clock" size={14} stroke={1.8} /> Posted {job.posted}</span>
            </div>

            <div style={{ marginTop: 36 }}>
              <h2 className="h-section" style={{ fontSize: "1.3rem" }}>About the role</h2>
              <p className="body-lead" style={{ marginTop: 14, color: "var(--color-text)" }}>
                {job.description} You'll work cross-functionally with R&D, supply chain, and production to keep the lines compliant and the products safe. We have an established QA team and a culture of documentation that makes audits something we look forward to, not something we dread.
              </p>

              <h3 className="h-card" style={{ marginTop: 32, fontSize: "1.1rem" }}>What you'll do</h3>
              <ul className="req-list">
                <li><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>Own the HACCP plan and lead annual review cycles.</li>
                <li><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>Run the internal audit program and CAPA tracking system.</li>
                <li><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>Manage third-party audits (FSSC 22000, customer audits, FSSAI).</li>
                <li><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>Mentor a team of 4 quality analysts and a junior auditor.</li>
              </ul>

              <h3 className="h-card" style={{ marginTop: 32, fontSize: "1.1rem" }}>Who we're looking for</h3>
              <ul className="req-list">
                <li><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>{job.experience_level === "Entry-level" ? "0-2" : job.experience_level === "Mid-level" ? "3-6" : "7+"} years in food QA / QC roles.</li>
                <li><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>BSc or MSc in Food Technology, Microbiology, or related.</li>
                <li><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>Working knowledge of FSSAI regulations and at least one GFSI scheme.</li>
                <li><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>Track record running corrective-action programs end-to-end.</li>
              </ul>

              <h3 className="h-card" style={{ marginTop: 32, fontSize: "1.1rem" }}>Skills</h3>
              <div className="tags-row" style={{ marginTop: 12 }}>
                {job.skills.map((s) => <span key={s} className="tag tag-neutral">{s}</span>)}
              </div>
            </div>
          </div>

          <aside className="job-detail-aside">
            <div className="salary" style={{ fontSize: "1.6rem", letterSpacing: "-0.02em" }}>
              ₹{(job.salary_min / 100000).toFixed(1)}–{(job.salary_max / 100000).toFixed(1)} L
              <span className="salary-unit" style={{ fontSize: "0.86rem", marginLeft: 6 }}>per year</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
              <button className="btn btn-primary btn-large btn-block" onClick={() => setApplyOpen(true)}>Apply for this job</button>
              <button className="btn btn-secondary btn-block" onClick={() => setSaved(!saved)}>
                <Icon name="bookmark" size={14} stroke={2} /> {saved ? "Saved" : "Save for later"}
              </button>
            </div>
            <ul className="detail-meta-list" style={{ marginTop: 24 }}>
              <li><span className="label">Job type</span><span className="value">{job.job_type}</span></li>
              <li><span className="label">Location</span><span className="value">{job.location}</span></li>
              <li><span className="label">Experience</span><span className="value">{job.experience_level}</span></li>
              <li><span className="label">Applicants</span><span className="value">{job.applications}</span></li>
              <li><span className="label">Posted</span><span className="value">{job.posted}</span></li>
            </ul>
            <p style={{ fontSize: "0.76rem", color: "var(--color-muted-2)", marginTop: 18, textAlign: "center" }}>
              ⓘ Applications reviewed weekly. You'll hear from us within 7 days.
            </p>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section container">
          <Reveal><SectionHeader overline="Similar roles" title="Other openings you might like" /></Reveal>
          <div className="stagger-grid" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {similar.map((j) => <JobCard key={j.id} job={j} />)}
          </div>
        </section>
      )}

      {applyOpen && <ApplyModal job={job} onClose={() => setApplyOpen(false)} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   APPLY MODAL
   ════════════════════════════════════════════════════════════════════════ */

function ApplyModal({ job, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    resume: null,
    cover: "",
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
    if (!form.resume) err.resume = "Attach a resume (PDF or DOCX)";
    if (!form.cover.trim() || form.cover.trim().length < 30) err.cover = "Share why you're a fit — at least 2-3 sentences";
    setErrors(err);
    if (Object.keys(err).length === 0) setSubmitted(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ maxWidth: 620 }}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        {submitted ? (
          <div className="modal-success">
            <div className="check-circle"><Icon name="check" size={28} stroke={2.4} /></div>
            <p className="overline">Application submitted</p>
            <h3 className="h-section" style={{ marginTop: 12, fontSize: "1.4rem" }}>You're in.</h3>
            <p className="body-lead" style={{ marginTop: 12, maxWidth: 380, margin: "12px auto 0" }}>
              We've sent <strong>{job.company_name}</strong> your application for <strong>{job.title}</strong>. You'll hear back within 7 days.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28 }}>
              <Link to="/dashboard/seeker" className="btn btn-secondary" onClick={onClose}>Track in dashboard</Link>
              <button className="btn btn-primary" onClick={onClose}>Browse more jobs</button>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <p className="overline">Apply to</p>
              <h3 className="h-section" style={{ marginTop: 6, fontSize: "1.3rem" }}>{job.title}</h3>
              <p className="body" style={{ fontSize: "0.86rem", marginTop: 6 }}>{job.company_name} · {job.location}</p>
            </div>
            <div className="modal-body">
              <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="label">Full name *</label>
                    <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} />
                    {errors.name && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" placeholder="+91 …" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input className="input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                  {errors.email && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.email}</p>}
                </div>
                <div>
                  <label className="label">Resume *</label>
                  <ResumeUpload value={form.resume} onChange={(file) => update("resume", file)} />
                  {errors.resume && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.resume}</p>}
                </div>
                <div>
                  <label className="label">Cover note *</label>
                  <textarea className="textarea" rows="4" placeholder="Why are you a good fit for this role?" value={form.cover} onChange={(e) => update("cover", e.target.value)} />
                  {errors.cover && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.cover}</p>}
                </div>
                <button type="submit" className="btn btn-primary btn-large btn-block">Submit application</button>
                <p className="caption" style={{ textAlign: "center" }}>Your application goes directly to {job.company_name}.</p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResumeUpload({ value, onChange }) {
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) onChange(f);
  };
  const remove = () => onChange(null);
  if (value) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--color-tag-safe-bg)", border: "1.5px solid var(--color-secondary)", borderRadius: "var(--radius-md)" }}>
        <Icon name="file" size={18} stroke={1.8} className="muted" />
        <div style={{ flex: 1, minWidth: 0, fontSize: "0.88rem", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value.name || "resume.pdf"} <span style={{ color: "var(--color-muted-2)", fontSize: "0.74rem" }}>· {((value.size || 245000) / 1024).toFixed(0)} KB</span>
        </div>
        <button type="button" onClick={remove} style={{ background: "transparent", border: 0, color: "var(--color-muted)", cursor: "pointer", padding: 4 }}><Icon name="close" size={16} /></button>
      </div>
    );
  }
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "24px 14px", background: "var(--color-surface-light)", border: "1.5px dashed var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
      <Icon name="upload" size={22} stroke={1.6} className="muted" />
      <div style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--color-text)" }}>Click to upload resume</div>
      <div style={{ fontSize: "0.74rem", color: "var(--color-muted-2)" }}>PDF or DOCX · Up to 5 MB</div>
      <input type="file" accept=".pdf,.docx" hidden onChange={handleFile} />
    </label>
  );
}

Object.assign(window, { JobsListingPage, JobDetailPage, ApplyModal });
