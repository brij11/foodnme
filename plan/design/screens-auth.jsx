// screens-auth.jsx — Login, Register (with role picker), Reset Password

function AuthSidePanel({ context }) {
  const features = context === "register" ? [
    "Build a profile recruiters actually find",
    "Apply with one click using your saved resume",
    "Track applications and saved jobs in one place",
    "Get curated job alerts every week",
  ] : context === "reset" ? [
    "We'll email you a secure reset link",
    "Links expire in 30 minutes",
    "Never reused — every request issues a fresh link",
  ] : [
    "100+ active job listings across India",
    "Vetted experts available for short engagements",
    "Templates, articles, and weekly newsletter",
    "Trusted by 4,200+ food-tech professionals",
  ];
  return (
    <div className="auth-side">
      <div className="auth-side-inner">
        <Brand size="lg" />
        <h2>{context === "register" ? "Join the food-tech community." : context === "reset" ? "Forgot your password?" : "Welcome back to foodnme."}</h2>
        <p>{context === "register"
          ? "Create a free account to post jobs, build an expert profile, or apply with one click."
          : context === "reset"
          ? "Enter the email address you registered with and we'll send you a secure reset link."
          : "Sign in to manage applications, post jobs, or update your expert profile."}
        </p>
        <ul>
          {features.map((f, i) => (
            <li key={i}>
              <Icon name="check" size={18} stroke={2.4} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─────────────────────────── LOGIN ─────────────────────────── */

function LoginPage() {
  const { signIn } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = "Valid email required";
    if (!password || password.length < 6) err.password = "Min 6 characters";
    setErrors(err);
    if (Object.keys(err).length === 0) {
      signIn(email);
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-page" data-screen-label="08 Login">
      <AuthSidePanel context="login" />
      <div className="auth-form-side">
        <div className="auth-form-inner">
          <p className="overline">Sign in</p>
          <h1>Welcome back</h1>
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
          <form className="auth-form" onSubmit={submit} noValidate>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@company.com" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: null }); }} />
              {errors.email && <p style={{ color: "var(--color-error)", fontSize: "0.74rem", marginTop: 6 }}>{errors.email}</p>}
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="label" style={{ margin: 0 }}>Password</span>
                <Link to="/reset-password" style={{ fontSize: "0.74rem", color: "var(--color-primary)", fontWeight: 600 }}>Forgot?</Link>
              </div>
              <input className="input" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: null }); }} />
              {errors.password && <p style={{ color: "var(--color-error)", fontSize: "0.74rem", marginTop: 6 }}>{errors.password}</p>}
            </div>
            <label className="checkbox-row" style={{ marginTop: 4 }}>
              <input type="checkbox" defaultChecked /> Keep me signed in for 30 days
            </label>
            <button type="submit" className="btn btn-primary btn-large btn-block">Sign in</button>
          </form>
          <p className="auth-footer">By signing in, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── REGISTER ─────────────────────────── */

function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });
  const [errors, setErrors] = useState({});

  const update = (k, v) => { setForm({ ...form, [k]: v }); if (errors[k]) setErrors({ ...errors, [k]: null }); };

  const stepOne = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Valid email required";
    if (!form.password || form.password.length < 6) err.password = "Min 6 characters";
    setErrors(err);
    if (Object.keys(err).length === 0) setStep(2);
  };

  const stepTwo = () => {
    if (!form.role) { setErrors({ role: "Pick one to continue" }); return; }
    register(form);
    navigate("/dashboard/" + form.role);
  };

  const roles = [
    { value: "seeker",   title: "Job Seeker", desc: "Apply to roles, save jobs, get alerts.", icon: "search" },
    { value: "employer", title: "Employer",   desc: "Post jobs, manage applicants, hire.",     icon: "briefcase" },
    { value: "expert",   title: "Expert",      desc: "Showcase your profile, take engagements.", icon: "verified" },
  ];

  return (
    <div className="auth-page" data-screen-label="09 Register">
      <AuthSidePanel context="register" />
      <div className="auth-form-side">
        <div className="auth-form-inner">
          <p className="overline">Create account — Step {step} of 2</p>
          <h1>{step === 1 ? "Your details" : "Pick your role"}</h1>
          <p>{step === 1 ? <>Already have an account? <Link to="/login">Sign in</Link></> : "You can change this later from your profile."}</p>

          {step === 1 && (
            <form className="auth-form" onSubmit={stepOne} noValidate>
              <div>
                <label className="label">Full name</label>
                <input className="input" placeholder="Your name" value={form.name} onChange={(e) => update("name", e.target.value)} />
                {errors.name && <p style={{ color: "var(--color-error)", fontSize: "0.74rem", marginTop: 6 }}>{errors.name}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                {errors.email && <p style={{ color: "var(--color-error)", fontSize: "0.74rem", marginTop: 6 }}>{errors.email}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="At least 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} />
                {errors.password && <p style={{ color: "var(--color-error)", fontSize: "0.74rem", marginTop: 6 }}>{errors.password}</p>}
              </div>
              <button type="submit" className="btn btn-primary btn-large btn-block">Continue</button>
            </form>
          )}

          {step === 2 && (
            <>
              <div className="auth-form" style={{ gap: 20 }}>
                <div>
                  <div className="role-grid">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        className={"role-card " + (form.role === r.value ? "selected" : "")}
                        onClick={() => update("role", r.value)}
                      >
                        <div className="role-icon"><Icon name={r.icon} size={18} stroke={1.8} /></div>
                        <h4>{r.title}</h4>
                        <p>{r.desc}</p>
                      </button>
                    ))}
                  </div>
                  {errors.role && <p style={{ color: "var(--color-error)", fontSize: "0.74rem", marginTop: 8 }}>{errors.role}</p>}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button type="button" className="btn btn-primary btn-large" style={{ flex: 1 }} onClick={stepTwo}>Create account</button>
                </div>
              </div>
            </>
          )}

          <p className="auth-footer">By creating an account, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── RESET PASSWORD ─────────────────────────── */

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email"); return; }
    setError(""); setSubmitted(true);
  };

  return (
    <div className="auth-page" data-screen-label="10 Reset Password">
      <AuthSidePanel context="reset" />
      <div className="auth-form-side">
        <div className="auth-form-inner">
          <p className="overline">Password reset</p>
          <h1>{submitted ? "Check your inbox" : "Reset your password"}</h1>
          {submitted ? (
            <>
              <p style={{ marginTop: 10 }}>If an account exists for <strong>{email}</strong>, you'll receive a reset link within a minute.</p>
              <p style={{ marginTop: 10, fontSize: "0.85rem", color: "var(--color-muted)" }}>The link expires in 30 minutes. Didn't get it? Check spam, or <button onClick={() => setSubmitted(false)} style={{ background: "transparent", border: 0, color: "var(--color-primary)", fontWeight: 600, cursor: "pointer", padding: 0 }}>try again</button>.</p>
              <Link to="/login" className="btn btn-secondary" style={{ marginTop: 28, display: "inline-flex" }}>Back to sign in</Link>
            </>
          ) : (
            <>
              <p>Enter the email tied to your account.</p>
              <form className="auth-form" onSubmit={submit} noValidate>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="you@company.com" value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }} />
                  {error && <p style={{ color: "var(--color-error)", fontSize: "0.74rem", marginTop: 6 }}>{error}</p>}
                </div>
                <button type="submit" className="btn btn-primary btn-large btn-block">Send reset link</button>
              </form>
              <p className="auth-footer">Remembered it? <Link to="/login">Sign in</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage, RegisterPage, ResetPasswordPage });
