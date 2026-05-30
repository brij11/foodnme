import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/blog",
  useRouter: () => ({ push, refresh }),
}));

// Controllable Supabase session (story-homepage-09).
let mockUser: { email: string; user_metadata: Record<string, unknown> } | null = null;
const signOutMock = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: mockUser } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: signOutMock,
    },
  }),
}));

import { Navbar } from "./Navbar";
import { ConsultationModalProvider } from "@/components/consultation/ConsultationModalProvider";

function renderNav() {
  return render(
    <ConsultationModalProvider>
      <Navbar />
    </ConsultationModalProvider>,
  );
}

beforeEach(() => {
  mockUser = null;
  push.mockClear();
  refresh.mockClear();
  signOutMock.mockClear();
});

describe("Navbar (homepage-02)", () => {
  it("renders the six §2.1 items in order with the dark-olive logo (AC#1,2)", () => {
    renderNav();
    const desktop = screen.getAllByText("foodnme")[0]!;
    // logo uses text-text (dark olive), never text-primary
    expect(desktop.className).toContain("text-text");
    expect(desktop.className).not.toContain("text-primary");
    for (const label of ["About Us", "Knowledge Hub", "Templates", "Jobs", "Experts", "Services"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("links Jobs and Experts now that their Sprint-2 surfaces exist (AC#3 rollout)", () => {
    renderNav();
    // The nav shape never changed; the items went live when /jobs (jobs-01) and /experts
    // (experts-01) shipped — see the §2.1 rollout note.
    expect(screen.getAllByText("Jobs")[0]!.closest("a")).toHaveAttribute("href", "/jobs");
    expect(screen.getAllByText("Experts")[0]!.closest("a")).toHaveAttribute("href", "/experts");
    const hub = screen.getAllByText("Knowledge Hub")[0]!;
    expect(hub.closest("a")).toHaveAttribute("href", "/blog");
  });

  it("marks the active route (Knowledge Hub on /blog) with the underline (AC#4)", () => {
    renderNav();
    const hub = screen.getAllByText("Knowledge Hub")[0]!;
    expect(hub.className).toContain("after:bg-primary");
  });

  it("'Get a Consultation' CTA opens the consultation modal (AC#5)", () => {
    renderNav();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /get a consultation/i })[0]!);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/tell us about your food business/i)).toBeInTheDocument();
  });

  it("hosts the reading-progress edge bound to --reading-progress (AC#8)", () => {
    const { container } = renderNav();
    const nav = container.querySelector("nav")!;
    expect(nav.className).toContain("after:w-[var(--reading-progress,0%)]");
  });
});

describe("Navbar auth region (story-homepage-09)", () => {
  it("signed out: shows a 'Sign in' link to /login (AC#1)", async () => {
    mockUser = null;
    renderNav();
    const signIn = await screen.findAllByRole("link", { name: "Sign in" });
    expect(signIn[0]).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
  });

  it("signed in: account button + dropdown with name, email, role, Dashboard, Sign out (AC#2,3)", async () => {
    mockUser = { email: "sam@foodnme.test", user_metadata: { full_name: "Sam Patel", role: "expert" } };
    renderNav();

    const acct = await screen.findByRole("button", { name: "Account menu" });
    expect(acct).toHaveAttribute("aria-expanded", "false");
    // 'Sign in' link is gone once authenticated.
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();

    fireEvent.click(acct);
    expect(acct).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu");
    expect(within(menu).getByText("Sam Patel")).toBeInTheDocument();
    expect(within(menu).getByText("sam@foodnme.test")).toBeInTheDocument();
    expect(within(menu).getByText("Expert")).toBeInTheDocument(); // role badge
    expect(within(menu).getByRole("menuitem", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(within(menu).getByRole("menuitem", { name: /Sign out/ })).toBeInTheDocument();
  });

  it("signed in: Escape closes the dropdown (AC#5)", async () => {
    mockUser = { email: "sam@foodnme.test", user_metadata: { full_name: "Sam Patel", role: "seeker" } };
    renderNav();
    const acct = await screen.findByRole("button", { name: "Account menu" });
    fireEvent.click(acct);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("Sign out calls Supabase sign-out and returns home (AC#4)", async () => {
    mockUser = { email: "sam@foodnme.test", user_metadata: { full_name: "Sam Patel", role: "seeker" } };
    renderNav();
    const acct = await screen.findByRole("button", { name: "Account menu" });
    fireEvent.click(acct);
    fireEvent.click(screen.getByRole("menuitem", { name: /Sign out/ }));
    await waitFor(() => expect(signOutMock).toHaveBeenCalled());
    expect(push).toHaveBeenCalledWith("/");
  });
});
