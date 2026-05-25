// app.jsx — root app, router, tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroLayout": "editorial",
  "cardDensity": "comfortable",
  "accent": "#DDA15E"
}/*EDITMODE-END*/;

function AppShell() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply accent color as a CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent", t.accent || "#DDA15E");
  }, [t.accent]);

  return (
    <AuthProvider>
      <RouterProvider>
        <ConsultationModalProvider>
          <div className="shell">
            <Navbar />
            <main>
              <ScreenRouter tweaks={t} />
            </main>
            <Footer />
          </div>
          <TweaksPanel>
            <TweakSection label="Homepage hero" />
            <TweakRadio
              label="Hero layout"
              value={t.heroLayout}
              options={["editorial", "split", "minimal"]}
              onChange={(v) => setTweak("heroLayout", v)}
            />
            <TweakSection label="Card grids" />
            <TweakRadio
              label="Density"
              value={t.cardDensity}
              options={["comfortable", "compact"]}
              onChange={(v) => setTweak("cardDensity", v)}
            />
            <TweakSection label="Accent color" />
            <TweakColor
              label="Featured / warm highlights"
              value={t.accent}
              options={["#DDA15E", "#7FB069", "#9A6F4C", "#B58A48"]}
              onChange={(v) => setTweak("accent", v)}
            />
          </TweaksPanel>
        </ConsultationModalProvider>
      </RouterProvider>
    </AuthProvider>
  );
}

function ScreenRouter({ tweaks }) {
  const { route } = useRouter();
  switch (route.name) {
    case "home":      return <HomePage tweaks={tweaks} />;
    case "blog":      return <BlogListingPage tweaks={tweaks} />;
    case "article":   return <ArticleDetailPage slug={route.params.slug} />;
    case "category":  return <CategoryPage slug={route.params.slug} tweaks={tweaks} />;
    case "templates": return <TemplatesListingPage />;
    case "template":  return <TemplateDetailPage slug={route.params.slug} />;
    case "services":  return <ServicesPage />;
    case "about":     return <AboutPage />;
    case "jobs":      return <JobsListingPage />;
    case "job":       return <JobDetailPage id={route.params.id} />;
    case "experts":   return <ExpertsListingPage />;
    case "expert":    return <ExpertDetailPage id={route.params.id} />;
    case "login":     return <LoginPage />;
    case "register":  return <RegisterPage />;
    case "reset":     return <ResetPasswordPage />;
    case "dashboard": return <DashboardPage role={route.params.role} />;
    default:          return <NotFound />;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AppShell />);
