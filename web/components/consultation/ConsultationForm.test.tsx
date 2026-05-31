/**
 * story-homepage-10 — ConsultationForm: centered check-circle success state (AC 4, AC 5).
 *
 * Tests:
 *  - Success state renders a centered check-circle layout (not a left-border banner)
 *  - Success state copy is present
 *  - ConsultationModal dialog has motion-safe:animate-modal-pop (AC 1, 2)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { useEffect } from "react";

// Turnstile resolves immediately
vi.mock("@/components/turnstile/Turnstile", () => ({
  Turnstile: ({ onVerify }: { onVerify: (t: string) => void }) => {
    useEffect(() => onVerify("test-token"), [onVerify]);
    return <div data-testid="turnstile" />;
  },
}));

import { ConsultationForm } from "./ConsultationForm";
import { ConsultationModal } from "./ConsultationModal";

function mockFetch(ok: boolean, body: unknown) {
  const fn = vi.fn().mockResolvedValue({ ok, json: async () => body });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("ConsultationForm success state (story-homepage-10 AC#4)", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("on success renders centered check-circle layout, not a left-border banner (AC#4)", async () => {
    mockFetch(true, { ok: true });
    render(<ConsultationForm onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Priya Sharma" } });
    fireEvent.change(screen.getByLabelText(/business email/i), { target: { value: "priya@amul.in" } });
    fireEvent.change(screen.getByLabelText(/what do you need help with/i), {
      target: { value: "We need help with ISO 22000 audit prep for our new dairy plant." },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /request consultation/i }));
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    const statusEl = screen.getByRole("status");
    // Heading text
    expect(screen.getByText(/inquiry received/i)).toBeInTheDocument();
    // Should NOT have left-border banner class
    expect(statusEl.className).not.toContain("border-l-4");
    // Should be centered
    expect(statusEl.className).toContain("text-center");
  });

  it("check-circle container is present in the success state (AC#4)", async () => {
    mockFetch(true, { ok: true });
    render(<ConsultationForm onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Priya Sharma" } });
    fireEvent.change(screen.getByLabelText(/business email/i), { target: { value: "priya@amul.in" } });
    fireEvent.change(screen.getByLabelText(/what do you need help with/i), {
      target: { value: "We need help with ISO 22000 audit prep for our new dairy plant." },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /request consultation/i }));
    });

    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    // The SVG check icon rendered by <Icon name="check" />
    const svg = document.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});

describe("ConsultationModal dialog animation (story-homepage-10 AC#1, AC#2)", () => {
  it("dialog has motion-safe:animate-modal-pop class (AC#1, AC#2)", () => {
    render(<ConsultationModal onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("motion-safe:animate-modal-pop");
  });
});
