// ui.jsx — shared primitives + chrome (Navbar, Footer, Cards, Newsletter, Icons)

const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

/* ─────────────────────────── Router (tiny) ─────────────────────────── */
const RouterContext = createContext({ route: { name: "home", params: {} }, navigate: () => {} });

function useRouter() { return useContext(RouterContext); }

function parseHash() {
  const h = (window.location.hash || "#/").replace(/^#/, "");
  const parts = h.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home", params: {} };
  if (parts[0] === "blog" && parts.length === 1) return { name: "blog", params: {} };
  if (parts[0] === "blog" && parts[1] === "category" && parts[2]) return { name: "category", params: { slug: parts[2] } };
  if (parts[0] === "blog" && parts[1]) return { name: "article", params: { slug: parts[1] } };
  if (parts[0] === "templates" && parts.length === 1) return { name: "templates", params: {} };
  if (parts[0] === "templates" && parts[1]) return { name: "template", params: { slug: parts[1] } };
  if (parts[0] === "services") return { name: "services", params: {} };
  if (parts[0] === "about") return { name: "about", params: {} };
  if (parts[0] === "jobs" && parts.length === 1) return { name: "jobs", params: {} };
  if (parts[0] === "jobs" && parts[1]) return { name: "job", params: { id: parts[1] } };
  if (parts[0] === "experts" && parts.length === 1) return { name: "experts", params: {} };
  if (parts[0] === "experts" && parts[1]) return { name: "expert", params: { id: parts[1] } };
  if (parts[0] === "login") return { name: "login", params: {} };
  if (parts[0] === "register") return { name: "register", params: {} };
  if (parts[0] === "reset-password") return { name: "reset", params: {} };
  if (parts[0] === "dashboard" && parts[1]) return { name: "dashboard", params: { role: parts[1] } };
  if (parts[0] === "dashboard") return { name: "dashboard", params: {} };
  return { name: "home", params: {} };
}

function RouterProvider({ children }) {
  const [route, setRoute] = useState(parseHash());
  useEffect(() => {
    const onHash = () => { setRoute(parseHash()); window.scrollTo({ top: 0, behavior: "instant" }); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (path) => { window.location.hash = path.startsWith("#") ? path : "#" + path; };
  return <RouterContext.Provider value={{ route, navigate }}>{children}</RouterContext.Provider>;
}

function Link({ to, children, className, onClick, ...rest }) {
  const handle = (e) => {
    e.preventDefault();
    if (onClick) onClick(e);
    window.location.hash = to;
  };
  return <a href={"#" + to} className={className} onClick={handle} {...rest}>{children}</a>;
}

/* ─────────────────────────── Icons ─────────────────────────── */

function Icon({ name, size = 20, stroke = 1.6, className = "" }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round", className };
  switch (name) {
    case "search":   return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
    case "arrow":    return (<svg {...props}><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>);
    case "download": return (<svg {...props}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>);
    case "shield":   return (<svg {...props}><path d="M12 3 5 6v6c0 4.4 3 8 7 9 4-1 7-4.6 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/></svg>);
    case "clipboard":return (<svg {...props}><rect x="7" y="4" width="10" height="4" rx="1"/><path d="M7 6H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>);
    case "file":     return (<svg {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>);
    case "flask":    return (<svg {...props}><path d="M9 3h6"/><path d="M10 3v6L5 19a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 19l-5-10V3"/><path d="M7 14h10"/></svg>);
    case "layers":   return (<svg {...props}><path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 18l9 5 9-5"/></svg>);
    case "check":    return (<svg {...props}><path d="M20 6 9 17l-5-5"/></svg>);
    case "menu":     return (<svg {...props}><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>);
    case "close":    return (<svg {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>);
    case "calendar": return (<svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>);
    case "clock":    return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case "leaf":     return (<svg {...props}><path d="M11 20A7 7 0 0 1 4 13C4 8 8 4 14 4c4 0 6 1 6 1s-1 12-9 15c-2 .8-4 1-4 1z"/><path d="M2 22c5-5 6-8 12-13"/></svg>);
    case "mail":     return (<svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>);
    case "user":     return (<svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>);
    case "linkedin": return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.59 0 4.27 2.36 4.27 5.44v6.3zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>);
    case "twitter":  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>);
    case "briefcase":return (<svg {...props}><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>);
    case "map-pin":  return (<svg {...props}><path d="M12 21s-7-7-7-12a7 7 0 1 1 14 0c0 5-7 12-7 12z"/><circle cx="12" cy="9" r="3"/></svg>);
    case "star":     return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>);
    case "bookmark": return (<svg {...props}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>);
    case "trending": return (<svg {...props}><path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>);
    case "settings": return (<svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
    case "logout":   return (<svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>);
    case "plus":     return (<svg {...props}><path d="M12 5v14"/><path d="M5 12h14"/></svg>);
    case "eye":      return (<svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>);
    case "upload":   return (<svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>);
    case "filter":   return (<svg {...props}><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>);
    case "edit":     return (<svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
    case "verified": return (<svg {...props}><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>);
    case "trash":    return (<svg {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
    default: return null;
  }
}

/* ─────────────────────────── Brand ─────────────────────────── */

function Brand({ size = "md" }) {
  const fontSize = size === "lg" ? "1.35rem" : "1.15rem";
  return (
    <Link to="/" className="brand" style={{ fontSize }}>
      <span className="brand-dot"></span>
      <span>foodnme</span>
    </Link>
  );
}

/* ─────────────────────────── Navbar ─────────────────────────── */

function Navbar() {
  const { route } = useRouter();
  const modal = useModal();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = (n) => route.name === n || (n === "blog" && (route.name === "article" || route.name === "category"))
                                          || (n === "templates" && route.name === "template")
                                          || (n === "jobs" && route.name === "job")
                                          || (n === "experts" && route.name === "expert");
  const openConsult = () => { setMobileOpen(false); modal.open(); };
  return (
    <nav className={"nav " + (scrolled ? "scrolled" : "")}>
      <div className="container nav-inner">
        <Brand />
        <div className="nav-links">
          <Link to="/about" className={"nav-link " + (active("about") ? "active" : "")}>About Us</Link>
          <Link to="/blog" className={"nav-link " + (active("blog") ? "active" : "")}>Knowledge Hub</Link>
          <Link to="/templates" className={"nav-link " + (active("templates") ? "active" : "")}>Templates</Link>
          <Link to="/jobs" className={"nav-link " + (active("jobs") ? "active" : "")}>Jobs</Link>
          <Link to="/experts" className={"nav-link " + (active("experts") ? "active" : "")}>Experts</Link>
          <Link to="/services" className={"nav-link " + (active("services") ? "active" : "")}>Services</Link>
        </div>
        <div className="nav-cta-wrap">
          {user ? (
            <AccountMenu />
          ) : (
            <>
              <Link to="/login" className="nav-link" style={{ marginRight: 4 }}>Sign in</Link>
              <button className="btn btn-primary" onClick={openConsult}>Get a Consultation</button>
            </>
          )}
          <button className="mobile-nav-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <Icon name={mobileOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>
      <div className={"mobile-menu " + (mobileOpen ? "open" : "")}>
        <div className="container">
          <Link to="/about" onClick={() => setMobileOpen(false)}>About Us</Link>
          <Link to="/blog" onClick={() => setMobileOpen(false)}>Knowledge Hub</Link>
          <Link to="/templates" onClick={() => setMobileOpen(false)}>Templates</Link>
          <Link to="/jobs" onClick={() => setMobileOpen(false)}>Jobs</Link>
          <Link to="/experts" onClick={() => setMobileOpen(false)}>Experts</Link>
          <Link to="/services" onClick={() => setMobileOpen(false)}>Services</Link>
          {!user && <Link to="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>}
          {user && <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary btn-block" onClick={openConsult}>Get a Consultation</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────── Footer ─────────────────────────── */

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Brand size="lg" />
            <p style={{ marginTop: 14, fontSize: "0.9rem", color: "var(--color-muted)", lineHeight: 1.6, maxWidth: 320 }}>
              Practical resources for a safer food ecosystem. Built for food technology professionals across India and beyond.
            </p>
          </div>
          <div className="footer-col">
            <h5>Explore</h5>
            <Link to="/blog">Knowledge Hub</Link>
            <Link to="/templates">Templates</Link>
            <Link to="/jobs">Jobs</Link>
            <Link to="/experts">Experts</Link>
            <Link to="/services">Services</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="footer-col">
            <h5>Topics</h5>
            <Link to="/blog/category/food-safety">Food Safety</Link>
            <Link to="/blog/category/quality-control">Quality Control</Link>
            <Link to="/blog/category/regulatory">Regulatory</Link>
            <Link to="/blog/category/processing">Processing</Link>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <a href="mailto:hello@foodnme.in">hello@foodnme.in</a>
            <a href="#">LinkedIn</a>
            <a href="#">Newsletter</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 foodnme. All rights reserved.</span>
          <span>Made for the food-tech community in India.</span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── Newsletter banner (prominent, centered) ─────────────────────────── */

function NewsletterBanner({ heading, sub, source = "homepage", onSubmit }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | error | success

  const handle = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setState("error"); return; }
    setState("success");
    onSubmit && onSubmit({ email, source });
    setEmail("");
    setTimeout(() => setState("idle"), 3000);
  };

  return (
    <div className="newsletter-prominent">
      <div className="inner">
        <div className="badge">
          <span className="dot"></span>
          <span>Weekly Newsletter</span>
        </div>
        <h3>{heading || "Stay ahead in food technology."}</h3>
        <p className="lead">{sub || "One short email a week — practical guidance on food safety, QC, and regulatory compliance from working practitioners."}</p>
        <form className="form" onSubmit={handle} noValidate>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state !== "idle") setState("idle"); }}
          />
          <button type="submit">{state === "success" ? "Subscribed ✓" : "Subscribe"}</button>
        </form>
        <p className="caption">
          {state === "error" ? <span style={{ color: "var(--color-error)" }}>Please enter a valid email address.</span>
          : state === "success" ? <span style={{ color: "var(--color-tag-safe-text)" }}>Check your inbox — welcome aboard.</span>
          : "No spam. Unsubscribe anytime. Read by 4,200+ food-tech professionals."}
        </p>
        <div className="social-proof">
          <div className="avatars">
            <span>AM</span><span>VS</span><span>PI</span>
          </div>
          <span>Trusted by QA, R&D, and compliance teams across India.</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Consultation Modal (lead-gen) ─────────────────────────── */

const ModalContext = createContext({ open: () => {}, close: () => {} });
function useModal() { return useContext(ModalContext); }

function ConsultationModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const value = { open: () => setOpen(true), close: () => setOpen(false) };
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <ModalContext.Provider value={value}>
      {children}
      {open && <ConsultationModal onClose={() => setOpen(false)} />}
    </ModalContext.Provider>
  );
}

function ConsultationModal({ onClose }) {
  const SERVICE_OPTIONS = [
    "FSSAI Compliance", "HACCP Development", "Food Safety Documentation",
    "Product Development Guidance", "QMS Setup", "Audit Preparation & Support",
    "Not sure yet — let's discuss",
  ];
  const [form, setForm] = useState({ full_name: "", email: "", company: "", service: "", message: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (k, v) => { setForm({ ...form, [k]: v }); if (errors[k]) setErrors({ ...errors, [k]: null }); };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.full_name.trim()) err.full_name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Valid email required";
    if (!form.service) err.service = "Please pick one";
    if (!form.message.trim() || form.message.trim().length < 15) err.message = "A sentence or two helps us prepare";
    setErrors(err);
    if (Object.keys(err).length === 0) setSubmitted(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        {submitted ? (
          <div className="modal-success">
            <div className="check-circle"><Icon name="check" size={28} stroke={2.4} /></div>
            <p className="overline">Inquiry received</p>
            <h3 className="h-section" style={{ marginTop: 12, fontSize: "1.4rem" }}>Thanks, {form.full_name.split(" ")[0] || "there"}!</h3>
            <p className="body-lead" style={{ marginTop: 12, maxWidth: 380, margin: "12px auto 0" }}>
              We'll reach out within 24 hours — usually faster — to schedule a free 30-minute scoping call.
            </p>
            <button className="btn btn-secondary" style={{ marginTop: 28 }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <p className="overline">Free consultation</p>
              <h3 className="h-section" style={{ marginTop: 8 }}>Tell us about your food business.</h3>
              <p className="body" style={{ fontSize: "0.9rem", marginTop: 8 }}>30-minute scoping call. No commitment, no pitch.</p>
            </div>
            <div className="modal-body">
              <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="label">Full name *</label>
                    <input className="input" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Your name" />
                    {errors.full_name && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.full_name}</p>}
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 …" />
                  </div>
                </div>
                <div>
                  <label className="label">Work email *</label>
                  <input className="input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" />
                  {errors.email && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.email}</p>}
                </div>
                <div>
                  <label className="label">Company</label>
                  <input className="input" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label className="label">What do you need help with? *</label>
                  <select className="select" value={form.service} onChange={(e) => update("service", e.target.value)}>
                    <option value="">Pick a service…</option>
                    {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.service && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.service}</p>}
                </div>
                <div>
                  <label className="label">Tell us about your situation *</label>
                  <textarea className="textarea" rows="3" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Facility type, products, what's prompting this inquiry…" />
                  {errors.message && <p style={{ color: "var(--color-error)", fontSize: "0.72rem", marginTop: 4 }}>{errors.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary btn-large btn-block" style={{ marginTop: 4 }}>Request my consultation</button>
                <p className="caption" style={{ textAlign: "center" }}>We respond within 24 hours. Your details stay private.</p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Cards ─────────────────────────── */

function ArticleCard({ article, compact = false }) {
  const { CATEGORIES } = window.FN_DATA;
  const cat = CATEGORIES.find((c) => c.slug === article.category);
  const tagClass = "tag tag-" + (cat?.tag || "green");
  return (
    <Link to={`/blog/${article.slug}`} className="article-card">
      <div className="article-cover">
        <img src={article.cover} alt={article.title} loading="lazy" />
      </div>
      <div className="article-body">
        <div className="meta-row">
          <span className={tagClass}>{article.categoryLabel}</span>
          <span className="tag tag-neutral"><Icon name="clock" size={11} stroke={2} /> {article.readTime} min read</span>
        </div>
        <h3 className="h-card">{article.title}</h3>
        {!compact && <p className="excerpt">{article.excerpt}</p>}
        <div className="footer-row">
          <span>{article.author}</span>
          <span>{article.publishedAt}</span>
        </div>
      </div>
    </Link>
  );
}

function TemplateCard({ template, onDownload }) {
  const fileType = template.fileType || "PDF";
  const { TEMPLATE_CATEGORIES } = window.FN_DATA;
  const cat = TEMPLATE_CATEGORIES.find((c) => c.slug === template.category);
  const tagClass = "tag tag-" + (cat?.tag || "green");
  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDownload && onDownload(template);
  };
  return (
    <Link to={`/templates/${template.slug}`} className="template-card">
      <div className={"doc-icon " + fileType.toLowerCase()}>{fileType}</div>
      <div className="doc-actions">
        <button className="icon-btn" onClick={handleDownload} aria-label={`Download ${template.title}`}>
          <Icon name="download" size={15} stroke={2.2} />
          <span className="tip">Download template</span>
        </button>
      </div>
      <div className="tag-row">
        <span className={tagClass}>{template.categoryLabel}</span>
      </div>
      <h3 className="h-card">{template.title}</h3>
      <p className="desc">{template.description}</p>
      <div className="stat-row">
        <span>{template.pages} pages · {template.downloads.toLocaleString()} downloads</span>
        <span className="read-more">View<Icon name="arrow" size={12} stroke={2.4} /></span>
      </div>
    </Link>
  );
}

function ServiceCard({ service, onClick }) {
  return (
    <div className="service-card">
      <div className="service-icon"><Icon name={service.icon} size={22} /></div>
      <h3 className="h-card">{service.name}</h3>
      <p className="desc">{service.short}</p>
      <button className="btn btn-ghost" onClick={onClick}>Learn more</button>
    </div>
  );
}

/* ─────────────────────────── Pill filter row ─────────────────────────── */

function PillRow({ items, active, onChange }) {
  return (
    <div className="pill-row" role="tablist">
      {items.map((it) => (
        <button
          key={it.slug}
          className={"pill " + (active === it.slug ? "active" : "")}
          onClick={() => onChange(it.slug)}
          role="tab"
          aria-selected={active === it.slug}
        >
          {it.label}{it.count != null && <span className="count">· {it.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── Search input ─────────────────────────── */

function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="search-input">
      <Icon name="search" size={16} />
      <input className="input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ─────────────────────────── Stats row ─────────────────────────── */

function StatsRow({ stats }) {
  return (
    <div className="stats-row">
      {stats.map((s, i) => {
        const parsed = parseStat(s.num);
        return (
          <div className="stat-cell" key={i}>
            <div className="stat-num"><CountUp value={parsed.value} format={parsed.format} duration={1400 + i * 100} /></div>
            <div className="stat-label">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Breadcrumb ─────────────────────────── */

function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span className="current">{it.label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ─────────────────────────── Auth (fake, localStorage-backed) ─────────────────────────── */

const AuthContext = createContext({ user: null, signIn: () => {}, signOut: () => {}, register: () => {} });
function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("foodnme:user") || "null"); } catch (e) { return null; }
  });
  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem("foodnme:user", JSON.stringify(u));
    else localStorage.removeItem("foodnme:user");
  };
  const signIn = (email) => {
    // For prototype: derive a fake user from email and (optionally) role
    persist({ email, name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), role: "seeker", id: "u-1" });
  };
  const register = ({ email, name, role }) => {
    persist({ email, name, role, id: "u-" + Math.random().toString(36).slice(2, 8) });
  };
  const signOut = () => persist(null);
  return <AuthContext.Provider value={{ user, signIn, signOut, register }}>{children}</AuthContext.Provider>;
}

/* ─────────────────────────── Job Card ─────────────────────────── */

function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="job-card">
      <div className="job-card-top">
        <div className="company-logo" aria-hidden="true">{job.company_initial}</div>
        <div className="job-meta">
          <div className="company-name">{job.company_name}</div>
          <div className="job-posted">{job.posted} · {job.applications} applicants</div>
        </div>
        {job.featured && <span className="tag tag-accent" style={{ marginLeft: "auto" }}>Featured</span>}
      </div>
      <h3 className="h-card" style={{ marginTop: 14 }}>{job.title}</h3>
      <div className="job-card-meta-row">
        <span><Icon name="map-pin" size={14} stroke={1.8} /> {job.location}</span>
        <span><Icon name="briefcase" size={14} stroke={1.8} /> {job.job_type}</span>
        <span><Icon name="trending" size={14} stroke={1.8} /> {job.experience_level}</span>
      </div>
      <p className="job-desc">{job.description}</p>
      <div className="job-card-bottom">
        <div className="salary">₹{(job.salary_min / 100000).toFixed(1)}–{(job.salary_max / 100000).toFixed(1)} L<span className="salary-unit">/yr</span></div>
        <div className="skills-row">
          {job.skills.slice(0, 3).map((s) => <span key={s} className="tag tag-neutral">{s}</span>)}
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────── Expert Card ─────────────────────────── */

function ExpertCard({ expert }) {
  return (
    <Link to={`/experts/${expert.id}`} className="expert-card">
      <div className="expert-top">
        <div className="expert-avatar">{expert.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <h3 className="h-card" style={{ fontSize: "1rem" }}>{expert.name}</h3>
            {expert.featured && <Icon name="verified" size={15} stroke={2} className="muted" />}
          </div>
          <div className="expert-title">{expert.title}</div>
          <div className="expert-location"><Icon name="map-pin" size={12} stroke={1.8} /> {expert.location}</div>
        </div>
        <div className={"availability " + (expert.available ? "on" : "off")}>
          <span className="dot"></span>
          {expert.available ? "Available" : "Busy"}
        </div>
      </div>
      <p className="expert-bio">{expert.bio}</p>
      <div className="expert-tags">
        {expert.specializations.slice(0, 3).map((s) => <span key={s} className="tag tag-neutral">{s}</span>)}
      </div>
      <div className="expert-bottom">
        <div className="rating">
          <Icon name="star" size={14} className="star-icon" />
          <strong>{expert.rating}</strong>
          <span className="muted">({expert.reviews})</span>
        </div>
        <div className="expert-rate">{expert.rate}</div>
      </div>
    </Link>
  );
}

/* ─────────────────────────── Account chip (navbar) ─────────────────────────── */

function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  if (!user) return null;
  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="acct-wrap" ref={ref}>
      <button className="acct-btn" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}>
        <div className="acct-avatar">{initials}</div>
        <span className="acct-name">{user.name.split(" ")[0]}</span>
      </button>
      {open && (
        <div className="acct-menu" role="menu">
          <div className="acct-menu-header">
            <div className="acct-avatar lg">{initials}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{user.name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>{user.email}</div>
              <div style={{ marginTop: 4 }}><span className="tag tag-safe" style={{ fontSize: "0.6rem", padding: "3px 8px" }}>{ROLE_LABEL[user.role] || "Member"}</span></div>
            </div>
          </div>
          <Link to="/dashboard" onClick={() => setOpen(false)} className="acct-menu-item"><Icon name="user" size={15} stroke={1.8} /> Dashboard</Link>
          <Link to={user.role === "expert" ? "/dashboard/expert" : user.role === "employer" ? "/dashboard/employer" : "/dashboard/seeker"} onClick={() => setOpen(false)} className="acct-menu-item"><Icon name="settings" size={15} stroke={1.8} /> Settings</Link>
          <div className="acct-menu-divider"></div>
          <button onClick={() => { setOpen(false); signOut(); }} className="acct-menu-item danger"><Icon name="logout" size={15} stroke={1.8} /> Sign out</button>
        </div>
      )}
    </div>
  );
}

const ROLE_LABEL = { seeker: "Job Seeker", employer: "Employer", expert: "Expert" };

function Reveal({ children, delay = 0, className = "", as: Tag = "div", ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // If already in view on mount, reveal immediately
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      const id = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(id);
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const delayClass = delay > 0 ? ` reveal-delay-${delay}` : "";
  return <Tag ref={ref} className={`reveal${visible ? " is-visible" : ""}${delayClass} ${className}`} {...rest}>{children}</Tag>;
}

/* ─────────────────────────── Count-up number ─────────────────────────── */

function CountUp({ value, duration = 1400, format = (n) => n.toLocaleString(), className = "" }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting && !started) { setStarted(true); obs.unobserve(el); } }),
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setN(Math.round(ease(t) * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration]);

  return <span ref={ref} className={className}>{format(n)}</span>;
}

/* Parse a stat string like "120+", "4.2k", "85+" — returns {value, format} */
function parseStat(str) {
  const m = String(str).match(/^([\d.]+)(.*)$/);
  if (!m) return { value: 0, format: (n) => str };
  const raw = parseFloat(m[1]);
  const suffix = m[2] || "";
  if (suffix.toLowerCase().includes("k")) {
    const value = Math.round(raw * 1000);
    return { value, format: (n) => (n / 1000).toFixed(n >= 1000 ? 1 : 0) + "k" + suffix.replace(/k/i, "") };
  }
  return { value: Math.round(raw), format: (n) => n.toLocaleString() + suffix };
}

function Toast({ message, show }) {
  if (!show) return null;
  return <div className="toast"><span className="dot"></span>{message}</div>;
}

/* ─────────────────────────── EmptyState ─────────────────────────── */

function EmptyState({ variant = "search", title, message, action }) {
  const Illustration = () => {
    if (variant === "filter") return (
      <svg width="128" height="100" viewBox="0 0 128 100" fill="none" aria-hidden="true">
        <rect x="22" y="20" width="84" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="34" y="42" width="60" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="46" y="64" width="36" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="64" cy="86" r="3" fill="currentColor" />
        <circle cx="22" cy="23" r="2.5" fill="var(--color-accent)" opacity="0.6" />
        <circle cx="106" cy="23" r="2.5" fill="var(--color-secondary)" opacity="0.6" />
      </svg>
    );
    if (variant === "inbox") return (
      <svg width="128" height="100" viewBox="0 0 128 100" fill="none" aria-hidden="true">
        <rect x="22" y="32" width="84" height="50" rx="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M22 54 L48 54 L54 62 L74 62 L80 54 L106 54" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="64" cy="22" r="3" fill="var(--color-accent)" opacity="0.5" />
        <circle cx="46" cy="18" r="2" fill="var(--color-secondary)" opacity="0.4" />
        <circle cx="82" cy="18" r="2" fill="var(--color-primary)" opacity="0.3" />
      </svg>
    );
    // default — search
    return (
      <svg width="128" height="100" viewBox="0 0 128 100" fill="none" aria-hidden="true">
        <circle cx="56" cy="50" r="22" stroke="currentColor" strokeWidth="1.5" />
        <line x1="72" y1="66" x2="92" y2="86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="50" x2="64" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="108" cy="24" r="3" fill="var(--color-accent)" opacity="0.5" />
        <circle cx="22" cy="22" r="2" fill="var(--color-secondary)" opacity="0.4" />
        <circle cx="100" cy="82" r="2.5" fill="var(--color-primary)" opacity="0.3" />
      </svg>
    );
  };
  return (
    <div className="empty-state">
      <div className="empty-illo">
        <Illustration />
      </div>
      {title && <h3 className="empty-title">{title}</h3>}
      {message && <p className="empty-msg">{message}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

/* ─────────────────────────── Reading progress (for article detail) ─────────────────────────── */

function useReadingProgress(elementId, active = true) {
  useEffect(() => {
    if (!active) {
      document.documentElement.style.setProperty("--reading-progress", "0%");
      return;
    }
    const onScroll = () => {
      const el = document.getElementById(elementId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const pct = Math.max(0, Math.min(1, scrolled / Math.max(total, 1)));
      document.documentElement.style.setProperty("--reading-progress", (pct * 100) + "%");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.setProperty("--reading-progress", "0%");
    };
  }, [elementId, active]);
}

/* Export to window */
Object.assign(window, {
  RouterProvider, useRouter, Link,
  Icon, Brand, Navbar, Footer,
  NewsletterBanner, ArticleCard, TemplateCard, ServiceCard,
  PillRow, SearchInput, StatsRow, Breadcrumb, Toast,
  ConsultationModalProvider, useModal,
  Reveal, CountUp, parseStat,
  AuthProvider, useAuth, AccountMenu, ROLE_LABEL,
  JobCard, ExpertCard,
  EmptyState, useReadingProgress,
});
