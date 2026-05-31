import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/navigation — the form reads searchParams and pushes on success.
const push = vi.fn();
const refresh = vi.fn();
const searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => searchParams,
}));

// Mock the Supabase browser client so we can assert how the form drives session
// persistence (story-auth-09 AC#2, #3) without a real Supabase connection.
const signInWithPassword = vi.fn();
const createClient = vi.fn(() => ({
  auth: { signInWithPassword, resend: vi.fn() },
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: (arg?: unknown) => createClient(arg),
}));

import LoginPage from "./page";

describe("Login form — Keep me signed in (story-auth-09)", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    signInWithPassword.mockReset();
    signInWithPassword.mockResolvedValue({ error: null });
    createClient.mockClear();
  });

  function getCheckbox() {
    return screen.getByRole("checkbox", {
      name: /keep me signed in for 30 days/i,
    }) as HTMLInputElement;
  }

  it("renders the 'Keep me signed in for 30 days' checkbox, checked by default (AC#1)", () => {
    render(<LoginPage />);
    const checkbox = getCheckbox();
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.type).toBe("checkbox");
    expect(checkbox.checked).toBe(true);
  });

  it("renders the checkbox between the password field and the submit button (AC#1)", () => {
    render(<LoginPage />);
    const checkbox = getCheckbox();
    const password = screen.getByLabelText("Password");
    const submit = screen.getByRole("button", { name: /^sign in$/i });

    // DOM order: password → checkbox → submit.
    const pos = (el: Element) =>
      Array.prototype.indexOf.call(
        el.ownerDocument.querySelectorAll("*"),
        el,
      );
    expect(pos(password)).toBeLessThan(pos(checkbox));
    expect(pos(checkbox)).toBeLessThan(pos(submit));
  });

  it("requests a persistent session when checked (default) (AC#2)", async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@company.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "hunter2pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(createClient).toHaveBeenCalled());
    expect(createClient).toHaveBeenCalledWith({ persistent: true });
  });

  it("requests a standard (non-persistent) session when unchecked (AC#3)", async () => {
    render(<LoginPage />);
    fireEvent.click(getCheckbox());
    expect(getCheckbox().checked).toBe(false);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@company.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "hunter2pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(createClient).toHaveBeenCalled());
    expect(createClient).toHaveBeenCalledWith({ persistent: false });
  });

  it("keeps the faithful login pieces — Forgot link, terms footer, single h1 (AC#4)", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /forgot\?/i })).toBeInTheDocument();
    expect(screen.getByText(/by signing in, you agree to our/i)).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome back");
  });
});
