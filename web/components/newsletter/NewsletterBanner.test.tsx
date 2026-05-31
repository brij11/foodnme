import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useEffect } from "react";

// Turnstile resolves immediately with a token so submit carries turnstile_token.
vi.mock("@/components/turnstile/Turnstile", () => ({
  Turnstile: ({ onVerify }: { onVerify: (t: string) => void }) => {
    useEffect(() => onVerify("test-token"), [onVerify]);
    return <div data-testid="turnstile" />;
  },
}));

import { NewsletterBanner } from "./NewsletterBanner";

function mockFetch(ok: boolean, body: unknown) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("NewsletterBanner", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("renders headline, subtext, caption, email field and Turnstile (AC#1-3,6,9)", () => {
    render(<NewsletterBanner source="homepage" headline="Stay sharp" subtext="Weekly tips" />);
    expect(screen.getByRole("heading", { name: "Stay sharp" })).toBeInTheDocument();
    expect(screen.getByText("Weekly tips")).toBeInTheDocument();
    expect(screen.getByText("No spam. Unsubscribe anytime.")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("type", "email");
    expect(screen.getByTestId("turnstile")).toBeInTheDocument();
  });

  it("rejects an invalid email client-side without calling the API", () => {
    const fetchFn = mockFetch(true, { ok: true });
    render(<NewsletterBanner source="homepage" />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "nope" } });
    fireEvent.submit(screen.getByRole("button", { name: /subscribe/i }).closest("form")!);
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("POSTs {email, source, turnstile_token} and shows success (AC#4,5,7)", async () => {
    const fetchFn = mockFetch(true, { ok: true });
    render(<NewsletterBanner source="blog" />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "qa@dairy.in" } });
    fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));
    await waitFor(() => expect(screen.getByText("Subscribed — check your inbox.")).toBeInTheDocument());
    expect(fetchFn).toHaveBeenCalledWith(
      "/api/newsletter",
      expect.objectContaining({ method: "POST" }),
    );
    const sentBody = JSON.parse((fetchFn.mock.calls[0]![1] as RequestInit).body as string);
    expect(sentBody).toEqual({ email: "qa@dairy.in", source: "blog", turnstile_token: "test-token" });
  });

  it("keeps input and shows inline error on API failure (AC#8)", async () => {
    mockFetch(false, { ok: false, error: { code: "x", message: "Server said no" } });
    render(<NewsletterBanner source="homepage" />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "qa@dairy.in" } });
    fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));
    await waitFor(() => expect(screen.getByText("Server said no")).toBeInTheDocument());
    expect(screen.getByLabelText(/email/i)).toHaveValue("qa@dairy.in");
  });

  it("mini variant renders a single-line footer form (AC#11)", () => {
    render(<NewsletterBanner source="footer" mini />);
    expect(screen.getByLabelText("Newsletter")).toHaveAttribute("type", "email");
    expect(screen.getByRole("button", { name: /subscribe/i })).toBeInTheDocument();
  });

  // story-templates-05 AC#3 / DEVIATIONS A4: full-width banner for templates listing
  it("renders for source='templates' with the custom headline and subtext (templates-05 AC#3)", () => {
    render(
      <NewsletterBanner
        source="templates"
        headline="Get notified when new templates are added."
        subtext="One short email a month with new and updated templates. No spam."
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Get notified when new templates are added." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("One short email a month with new and updated templates. No spam."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /subscribe/i })).toBeInTheDocument();
  });

  it("POSTs source='templates' to /api/newsletter (templates-05 AC#3)", async () => {
    const fetchFn = mockFetch(true, { ok: true });
    render(<NewsletterBanner source="templates" />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "qa@ftech.in" } });
    fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));
    await waitFor(() => expect(screen.getByText("Subscribed — check your inbox.")).toBeInTheDocument());
    const sentBody = JSON.parse((fetchFn.mock.calls[0]![1] as RequestInit).body as string);
    expect(sentBody.source).toBe("templates");
  });
});
