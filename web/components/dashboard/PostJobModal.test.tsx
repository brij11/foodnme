/**
 * story-homepage-10 — PostJobModal: two-state form→success view + modal-pop animation (AC 3, 5).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { useEffect } from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

// Turnstile resolves immediately with a token so submit can proceed
vi.mock("@/components/turnstile/Turnstile", () => ({
  Turnstile: ({ onVerify }: { onVerify: (t: string) => void }) => {
    useEffect(() => {
      onVerify("test-turnstile-token");
    }, [onVerify]);
    return <div data-testid="turnstile" />;
  },
}));

import { PostJobModal } from "./PostJobModal";

const VALID_FIELDS = {
  title: "QA Lead",
  company_name: "Amul Foods",
  location: "Anand, GJ",
  expires_at: "2099-12-31", // far future for the date refine
  description:
    "Lead QA for dairy processing lines. Responsible for ISO 22000 audit preparation and team leadership.",
  job_type: "Full-time",
  experience_level: "Mid-level",
};

function mockFetch(ok: boolean, body: unknown) {
  const fn = vi.fn().mockResolvedValue({ ok, json: async () => body });
  vi.stubGlobal("fetch", fn);
  return fn;
}

async function fillAndSubmit() {
  // Wait for Turnstile mock to fire (useEffect)
  await waitFor(() => expect(screen.getByTestId("turnstile")).toBeInTheDocument());

  fireEvent.change(screen.getByLabelText(/job title/i), { target: { value: VALID_FIELDS.title } });
  fireEvent.change(screen.getByLabelText(/company name/i), {
    target: { value: VALID_FIELDS.company_name },
  });
  fireEvent.change(screen.getByLabelText(/location/i), { target: { value: VALID_FIELDS.location } });
  fireEvent.change(screen.getByLabelText(/expires on/i), {
    target: { value: VALID_FIELDS.expires_at },
  });
  fireEvent.change(screen.getByLabelText(/description/i), {
    target: { value: VALID_FIELDS.description },
  });
  const selects = screen.getAllByRole("combobox");
  fireEvent.change(selects[0]!, { target: { value: VALID_FIELDS.job_type } });
  fireEvent.change(selects[1]!, { target: { value: VALID_FIELDS.experience_level } });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /submit for review/i }));
  });
}

describe("PostJobModal (story-homepage-10 AC#3, AC#5)", () => {
  beforeEach(() => vi.unstubAllGlobals());

  function renderModal(onClose = vi.fn()) {
    return { onClose, ...render(<PostJobModal onClose={onClose} />) };
  }

  it("renders the form in idle state (AC#5 — no regression)", async () => {
    renderModal();
    await waitFor(() => expect(screen.getByTestId("turnstile")).toBeInTheDocument());
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit for review/i })).toBeInTheDocument();
    expect(screen.queryByText(/your job is under review/i)).toBeNull();
  });

  it("dialog has motion-safe:animate-modal-pop class (AC#1, AC#2)", () => {
    renderModal();
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("motion-safe:animate-modal-pop");
  });

  it("on successful submit shows check-circle success state with admin-review copy (AC#3)", async () => {
    mockFetch(true, { ok: true });
    renderModal();
    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText(/your job is under review/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/our team will review your posting/i)).toBeInTheDocument();
    // The form is gone
    expect(screen.queryByLabelText(/job title/i)).toBeNull();
  });

  it("success state does not immediately close — auto-closes after 3 s (AC#3)", async () => {
    mockFetch(true, { ok: true });
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { onClose } = renderModal();
    await fillAndSubmit();

    await waitFor(() => expect(screen.getByText(/your job is under review/i)).toBeInTheDocument());
    // onClose NOT yet called
    expect(onClose).not.toHaveBeenCalled();

    // Advance timers by 3 s — auto-close fires
    act(() => vi.advanceTimersByTime(3000));
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("Escape key closes the modal (AC#5 — no regression)", async () => {
    const { onClose } = renderModal();
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking the close button (X) closes the modal (AC#5 — no regression)", async () => {
    const { onClose } = renderModal();
    await waitFor(() => expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
