// screens-dashboard.jsx — Role-based dashboards (Job Seeker / Employer / Expert)

const { JOBS: _JOBS, EXPERTS: _EXPERTS, SPECIALIZATIONS: _SPECS } = window.FN_DATA;

function DashboardPage({ role: routeRole }) {
  const { user, signOut } = useAuth();
  const { navigate } = useRouter();
  const role = routeRole || user?.role || "seeker";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  if (!user) return <div className="container" style={{ padding: 64 }}><p className="body-lead">Redirecting to sign in…</p></div>;

  return (
    <div data-screen-label="15 Dashboard">
      <div className="container">
        <div className="dashboard-layout">
          <DashboardSidebar user={user} role={role} onSignOut={signOut} />
          <div className="dashboard-content">
            {role === "seeker"   && <SeekerDashboard user={user} />}
            {role === "employer" && <EmployerDashboard user={user} />}
            {role === "expert"   && <ExpertDashboard user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSidebar({ user, role, onSignOut }) {
  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const navItems = {
    seeker: [
      { icon: "trending", label: "Overview", view: "overview" },
      { icon: "briefcase", label: "Applications", view: "applications" },
      { icon: "bookmark", label: "Saved jobs", view: "saved" },
      { icon: "user", label: "Profile", view: "profile" },
    ],
    employer: [
      { icon: "trending", label: "Overview", view: "overview" },
      { icon: "briefcase", label: "Posted jobs", view: "posted" },
      { icon: "user", label: "Applicants", view: "applicants" },
      { icon: "plus", label: "Post new job", view: "post" },
    ],
    expert: [
      { icon: "trending", label: "Overview", view: "overview" },
      { icon: "user", label: "Profile", view: "profile" },
      { icon: "mail", label: "Inquiries", view: "inquiries" },
      { icon: "settings", label: "Availability", view: "availability" },
    ],
  };
  const items = navItems[role] || navItems.seeker;

  return (
    <aside className="dashboard-sidebar">
      <div className="user-block">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="acct-avatar lg">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-muted)" }}>{ROLE_LABEL[role] || "Member"}</div>
          </div>
        </div>
      </div>
      <div className="dashboard-nav">
        {items.map((it) => (
          <button key={it.view} className={"" /* active state could be wired up */}>
            <Icon name={it.icon} size={16} stroke={1.8} />{it.label}
          </button>
        ))}
        <div style={{ height: 1, background: "var(--color-border)", margin: "12px 0" }}></div>
        <Link to="/" className="dashboard-nav-link-wrap">
          <button><Icon name="leaf" size={16} stroke={1.8} /> Back to site</button>
        </Link>
        <button onClick={onSignOut} style={{ color: "var(--color-error)" }}><Icon name="logout" size={16} stroke={1.8} /> Sign out</button>
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   JOB SEEKER DASHBOARD
   ════════════════════════════════════════════════════════════════════════ */

function SeekerDashboard({ user }) {
  const applications = _JOBS.slice(0, 4).map((j, i) => ({
    job: j,
    status: ["submitted", "reviewed", "interview", "rejected"][i % 4],
    applied: ["2 days ago", "5 days ago", "1 week ago", "2 weeks ago"][i % 4],
  }));
  const saved = _JOBS.slice(4, 7);

  const statusMap = {
    submitted: { label: "Submitted", cls: "status-pending" },
    reviewed:  { label: "Reviewed",  cls: "status-active" },
    interview: { label: "Interview", cls: "status-active" },
    rejected:  { label: "Closed",    cls: "status-closed" },
  };

  return (
    <>
      <h1>Welcome back, {user.name.split(" ")[0]}.</h1>
      <p>Here's a snapshot of your job search.</p>

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="label">Applications</div>
          <div className="value">{applications.length}</div>
          <div className="delta">+2 this week</div>
        </div>
        <div className="dash-stat">
          <div className="label">Saved jobs</div>
          <div className="value">{saved.length}</div>
          <div className="delta">+1 this week</div>
        </div>
        <div className="dash-stat">
          <div className="label">Profile views</div>
          <div className="value">28</div>
          <div className="delta">+12% vs. last week</div>
        </div>
        <div className="dash-stat">
          <div className="label">Match score</div>
          <div className="value">82%</div>
          <div className="delta">Strong fit</div>
        </div>
      </div>

      <h2 className="h-section" style={{ fontSize: "1.2rem", marginTop: 40, marginBottom: 16 }}>Your applications</h2>
      <div>
        {applications.map((a) => (
          <div key={a.job.id} className="app-row">
            <div className="company-logo">{a.job.company_initial}</div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-text)", fontSize: "0.95rem" }}>{a.job.title}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: 3 }}>{a.job.company_name} · Applied {a.applied}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className={"status-pill " + statusMap[a.status].cls}>{statusMap[a.status].label}</span>
              <Link to={`/jobs/${a.job.id}`} className="btn btn-secondary btn-small">View</Link>
            </div>
          </div>
        ))}
      </div>

      <h2 className="h-section" style={{ fontSize: "1.2rem", marginTop: 40, marginBottom: 16 }}>Saved jobs</h2>
      <div>
        {saved.map((j) => (
          <div key={j.id} className="app-row">
            <div className="company-logo">{j.company_initial}</div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-text)", fontSize: "0.95rem" }}>{j.title}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: 3 }}>{j.company_name} · ₹{(j.salary_min / 100000).toFixed(1)}–{(j.salary_max / 100000).toFixed(1)} L/yr</div>
            </div>
            <Link to={`/jobs/${j.id}`} className="btn btn-primary btn-small">Apply</Link>
          </div>
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   EMPLOYER DASHBOARD
   ════════════════════════════════════════════════════════════════════════ */

function EmployerDashboard({ user }) {
  const [showPost, setShowPost] = useState(false);
  const myJobs = [
    { id: "mj-1", title: "QC Microbiologist", status: "active", applicants: 24, posted: "5 days ago" },
    { id: "mj-2", title: "Production Supervisor — Snacks", status: "active", applicants: 18, posted: "1 week ago" },
    { id: "mj-3", title: "R&D Food Technologist", status: "pending", applicants: 0, posted: "1 day ago" },
    { id: "mj-4", title: "Regulatory Affairs Lead", status: "closed", applicants: 47, posted: "2 months ago" },
  ];

  const statusLabel = { active: "Active", pending: "Pending review", closed: "Closed" };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>Employer dashboard</h1>
          <p>Manage your job postings and review applicants.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowPost(true)}>
          <Icon name="plus" size={15} stroke={2.4} /> Post a new job
        </button>
      </div>

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="label">Active listings</div>
          <div className="value">2</div>
          <div className="delta">No change</div>
        </div>
        <div className="dash-stat">
          <div className="label">Total applicants</div>
          <div className="value">89</div>
          <div className="delta">+12 this week</div>
        </div>
        <div className="dash-stat">
          <div className="label">Pending review</div>
          <div className="value">14</div>
          <div className="delta">Review needed</div>
        </div>
        <div className="dash-stat">
          <div className="label">Avg. time to hire</div>
          <div className="value">12d</div>
          <div className="delta">-3d vs. avg</div>
        </div>
      </div>

      <h2 className="h-section" style={{ fontSize: "1.2rem", marginTop: 40, marginBottom: 16 }}>Your job postings</h2>
      <div>
        {myJobs.map((j) => (
          <div key={j.id} className="dash-job-row">
            <div>
              <div className="title">{j.title}</div>
              <div className="sub">Posted {j.posted}</div>
            </div>
            <div className="applicants">{j.applicants}<span>applicants</span></div>
            <span className={"status-pill status-" + j.status}>{statusLabel[j.status]}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-secondary btn-small"><Icon name="eye" size={12} stroke={2} /></button>
              <button className="btn btn-secondary btn-small"><Icon name="edit" size={12} stroke={2} /></button>
              <button className="btn btn-secondary btn-small" style={{ color: "var(--color-error)" }}><Icon name="trash" size={12} stroke={2} /></button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="h-section" style={{ fontSize: "1.2rem", marginTop: 40, marginBottom: 16 }}>Recent applicants</h2>
      <div>
        {[
          { name: "Anjali Sharma", role: "QC Microbiologist", applied: "2 hours ago", score: 92 },
          { name: "Rahul Verma", role: "QC Microbiologist", applied: "5 hours ago", score: 87 },
          { name: "Sneha Patil", role: "Production Supervisor — Snacks", applied: "1 day ago", score: 78 },
        ].map((a, i) => (
          <div key={i} className="app-row">
            <div className="acct-avatar" style={{ width: 40, height: 40, fontSize: "0.78rem" }}>{a.name.split(" ").map((p) => p[0]).join("")}</div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-text)", fontSize: "0.95rem" }}>{a.name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: 3 }}>{a.role} · Applied {a.applied}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: a.score > 85 ? "var(--color-tag-safe-text)" : "var(--color-text)", fontSize: "0.86rem" }}>{a.score}% match</div>
              <button className="btn btn-primary btn-small">View profile</button>
            </div>
          </div>
        ))}
      </div>

      {showPost && <PostJobModal onClose={() => setShowPost(false)} />}
    </>
  );
}

function PostJobModal({ onClose }) {
  const { JOB_TYPES, EXPERIENCE_LEVELS } = window.FN_DATA;
  const [form, setForm] = useState({ title: "", location: "", job_type: "", experience: "", salary_min: "", salary_max: "", description: "", skills: "" });
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
    if (!form.title.trim()) err.title = "Required";
    if (!form.location.trim()) err.location = "Required";
    if (!form.job_type) err.job_type = "Pick one";
    if (!form.experience) err.experience = "Pick one";
    if (!form.description.trim() || form.description.trim().length < 50) err.description = "Min 50 characters";
    setErrors(err);
    if (Object.keys(err).length === 0) setSubmitted(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ maxWidth: 640 }}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        {submitted ? (
          <div className="modal-success">
            <div className="check-circle"><Icon name="check" size={28} stroke={2.4} /></div>
            <p className="overline">Job submitted for review</p>
            <h3 className="h-section" style={{ marginTop: 12, fontSize: "1.4rem" }}>Pending admin approval</h3>
            <p className="body-lead" style={{ marginTop: 12, maxWidth: 380, margin: "12px auto 0" }}>
              We review new postings within 24 hours. You'll get an email once your role is live.
            </p>
            <button className="btn btn-secondary" style={{ marginTop: 28 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <p className="overline">New posting</p>
              <h3 className="h-section" style={{ marginTop: 6, fontSize: "1.3rem" }}>Post a job</h3>
              <p className="body" style={{ fontSize: "0.86rem", marginTop: 4 }}>Posts go through a short admin review before going live.</p>
            </div>
            <div className="modal-body">
              <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label">Job title *</label>
                  <input className="input" placeholder="e.g. QC Microbiologist" value={form.title} onChange={(e) => update("title", e.target.value)} />
                  {errors.title && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.title}</p>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="label">Location *</label>
                    <input className="input" placeholder="City, state" value={form.location} onChange={(e) => update("location", e.target.value)} />
                    {errors.location && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.location}</p>}
                  </div>
                  <div>
                    <label className="label">Job type *</label>
                    <select className="select" value={form.job_type} onChange={(e) => update("job_type", e.target.value)}>
                      <option value="">Select…</option>
                      {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.job_type && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.job_type}</p>}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="label">Experience *</label>
                    <select className="select" value={form.experience} onChange={(e) => update("experience", e.target.value)}>
                      <option value="">Select…</option>
                      {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {errors.experience && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.experience}</p>}
                  </div>
                  <div>
                    <label className="label">Min salary (₹/yr)</label>
                    <input className="input" placeholder="500000" value={form.salary_min} onChange={(e) => update("salary_min", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Max salary (₹/yr)</label>
                    <input className="input" placeholder="800000" value={form.salary_max} onChange={(e) => update("salary_max", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea className="textarea" rows="4" placeholder="Role overview, responsibilities, ideal background…" value={form.description} onChange={(e) => update("description", e.target.value)} />
                  {errors.description && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.description}</p>}
                </div>
                <div>
                  <label className="label">Skills (comma-separated)</label>
                  <input className="input" placeholder="HACCP, FSSAI, Microbiology" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-large btn-block">Submit for review</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   EXPERT DASHBOARD
   ════════════════════════════════════════════════════════════════════════ */

function ExpertDashboard({ user }) {
  const [available, setAvailable] = useState(true);
  const [specs, setSpecs] = useState(["Food Safety", "HACCP", "Auditing"]);
  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const toggleSpec = (s) => setSpecs(specs.includes(s) ? specs.filter((x) => x !== s) : [...specs, s]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>Expert dashboard</h1>
          <p>Keep your profile fresh, manage inquiries, and toggle availability.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "var(--color-card-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
          <span className={"availability " + (available ? "on" : "off")} style={{ padding: 0, background: "transparent" }}>
            <span className="dot"></span>{available ? "Available for work" : "Not available"}
          </span>
          <button onClick={() => setAvailable(!available)} className={"toggle-switch " + (available ? "on" : "")}>
            <span className="knob"></span>
          </button>
        </div>
      </div>

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="label">Profile views</div>
          <div className="value">142</div>
          <div className="delta">+24% this month</div>
        </div>
        <div className="dash-stat">
          <div className="label">Inquiries</div>
          <div className="value">8</div>
          <div className="delta">+3 unread</div>
        </div>
        <div className="dash-stat">
          <div className="label">Avg. rating</div>
          <div className="value">4.9</div>
          <div className="delta">38 reviews</div>
        </div>
        <div className="dash-stat">
          <div className="label">Active engagements</div>
          <div className="value">2</div>
          <div className="delta">1 ending soon</div>
        </div>
      </div>

      <h2 className="h-section" style={{ fontSize: "1.2rem", marginTop: 40, marginBottom: 16 }}>Profile editor</h2>
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 24 }}>
          <div className="expert-detail-avatar" style={{ width: 80, height: 80, fontSize: "1.5rem" }}>{initials}</div>
          <div>
            <button className="btn btn-secondary btn-small"><Icon name="upload" size={13} stroke={2} /> Change photo</button>
            <p style={{ fontSize: "0.74rem", color: "var(--color-muted-2)", marginTop: 8 }}>JPG or PNG · Up to 2 MB</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <label className="label">Display name</label>
            <input className="input" defaultValue={user.name} />
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" defaultValue="FSSAI Lead Auditor" />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" defaultValue="Mumbai · India" />
          </div>
          <div>
            <label className="label">Years experience</label>
            <input className="input" type="number" defaultValue="12" />
          </div>
          <div>
            <label className="label">Hourly rate</label>
            <input className="input" defaultValue="₹6,000/hr" />
          </div>
          <div>
            <label className="label">Contact email</label>
            <input className="input" type="email" defaultValue={user.email} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Bio</label>
            <textarea className="textarea" rows="3" defaultValue="Twelve years auditing and implementing food safety systems for Indian food businesses. Trainer at NIFTEM workshops." />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Specializations (click to toggle)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {_SPECS.map((s) => (
                <button key={s} type="button" onClick={() => toggleSpec(s)} className={"tag " + (specs.includes(s) ? "tag-safe" : "tag-neutral")} style={{ cursor: "pointer", border: specs.includes(s) ? "1.5px solid var(--color-secondary)" : "1.5px solid transparent" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary">Cancel</button>
          <button className="btn btn-primary">Save changes</button>
        </div>
      </div>

      <h2 className="h-section" style={{ fontSize: "1.2rem", marginTop: 40, marginBottom: 16 }}>Recent inquiries</h2>
      <div>
        {[
          { name: "Kiran Mehta", company: "Spice Co.", type: "Project engagement", time: "2 hours ago", unread: true },
          { name: "Rohini Das", company: "Beverages Inc.", type: "Hourly consult", time: "1 day ago", unread: true },
          { name: "Anjali Sharma", company: "—", type: "Just want to chat", time: "3 days ago", unread: false },
        ].map((q, i) => (
          <div key={i} className="app-row" style={{ background: q.unread ? "var(--color-tag-safe-bg)" : "#fff" }}>
            <div className="acct-avatar" style={{ width: 40, height: 40, fontSize: "0.78rem" }}>{q.name.split(" ").map((p) => p[0]).join("")}</div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-text)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8 }}>
                {q.name}
                {q.unread && <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--color-primary)" }}></span>}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: 3 }}>{q.company} · {q.type} · {q.time}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-secondary btn-small">View</button>
              <button className="btn btn-primary btn-small">Reply</button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .toggle-switch {
          width: 40px; height: 22px;
          background: var(--color-border);
          border-radius: 999px;
          border: 0;
          position: relative;
          cursor: pointer;
          transition: background 200ms ease;
        }
        .toggle-switch.on { background: var(--color-primary); }
        .toggle-switch .knob {
          position: absolute;
          top: 3px; left: 3px;
          width: 16px; height: 16px;
          border-radius: 999px;
          background: #fff;
          transition: left 200ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
        }
        .toggle-switch.on .knob { left: 21px; }
      `}</style>
    </>
  );
}

Object.assign(window, { DashboardPage });
