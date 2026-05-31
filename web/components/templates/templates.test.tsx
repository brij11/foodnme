/**
 * templates.test.tsx — unit tests for template components.
 *
 * Covers:
 *   - TemplateCard (story-templates-01 / templates-02)
 *   - WhatsIncluded metadata strip (story-templates-06 AC#1)
 *   - TemplateDownloadPanel notify success/error states (story-templates-06 AC#2)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { useEffect } from "react";
import axe from "axe-core";
import { TemplateCard } from "./TemplateCard";
import type { Resource } from "@/lib/resources";

// ───────────────────────────────────────────────────────────────────────────────
// Shared mocks
// ───────────────────────────────────────────────────────────────────────────────

// Turnstile resolves immediately with a test token so notify form can proceed
vi.mock("@/components/turnstile/Turnstile", () => ({
  Turnstile: ({ onVerify }: { onVerify: (t: string) => void }) => {
    useEffect(() => {
      onVerify("test-turnstile-token");
    }, [onVerify]);
    return <div data-testid="turnstile" />;
  },
}));

// ───────────────────────────────────────────────────────────────────────────────
// TemplateCard (templates-01 §3.2)
// ───────────────────────────────────────────────────────────────────────────────

const template: Resource = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "HACCP Plan Template — Dairy Processing",
  slug: "haccp-plan-template-dairy",
  description: "Complete HACCP plan structure with hazard analysis and monitoring forms.",
  category: "haccp",
  file_type: "docx",
  is_free: true,
  download_count: 1840,
};

describe("TemplateCard (templates-01 §3.2)", () => {
  it("renders category tag, file-format badge, title, description, downloads + View; links whole card to detail", () => {
    render(<TemplateCard template={template} />);
    expect(screen.getByText("HACCP")).toBeInTheDocument(); // category label (rotation)
    expect(screen.getByText("DOCX")).toBeInTheDocument(); // file-format badge, uppercased
    expect(
      screen.getByRole("heading", { name: /HACCP Plan Template — Dairy Processing/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Complete HACCP plan structure/)).toBeInTheDocument();
    expect(screen.getByText("1,840 downloads")).toBeInTheDocument();
    expect(screen.getByText("View")).toBeInTheDocument();
    // whole-card stretched link → detail page
    expect(screen.getByRole("link", { name: /View HACCP Plan Template/ })).toHaveAttribute(
      "href",
      "/templates/haccp-plan-template-dairy",
    );
  });

  it("has a download icon-button and never shows a 'Free' badge (AC#7)", () => {
    render(<TemplateCard template={template} />);
    expect(
      screen.getByRole("button", { name: /Download HACCP Plan Template/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/free/i)).not.toBeInTheDocument();
  });

  it("has no serious a11y violations — download control is a sibling, not nested in the card link", async () => {
    const { container } = render(<TemplateCard template={template} />);
    const results = await axe.run(container, { resultTypes: ["violations"] });
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toHaveLength(0);
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// WhatsIncluded metadata strip (story-templates-06 AC#1 / DEVIATIONS B14)
// ───────────────────────────────────────────────────────────────────────────────

import { WhatsIncluded } from "./WhatsIncluded";

const bulletDescription = `Overview paragraph.\n- Section one\n- Section two\n- Section three`;
const plainDescription = "A plain description with no bullet points.";

describe("WhatsIncluded metadata strip (templates-06 AC#1)", () => {
  it("renders metadata strip with Format, Last updated, Downloads when all props provided", () => {
    render(
      <WhatsIncluded
        description={bulletDescription}
        fileType="docx"
        downloadCount={1840}
        createdAt="2025-01-15T00:00:00Z"
      />,
    );
    const strip = screen.getByTestId("template-metadata-strip");
    expect(strip).toBeInTheDocument();
    expect(strip).toHaveTextContent("Format:");
    expect(strip).toHaveTextContent("DOCX");
    expect(strip).toHaveTextContent("Last updated:");
    expect(strip).toHaveTextContent("Downloads:");
    expect(strip).toHaveTextContent("1,840");
  });

  it("omits Pages entirely (DEVIATIONS C7 — no schema column)", () => {
    render(
      <WhatsIncluded
        description={bulletDescription}
        fileType="pdf"
        downloadCount={500}
        createdAt="2025-03-01T00:00:00Z"
      />,
    );
    const strip = screen.getByTestId("template-metadata-strip");
    expect(strip).not.toHaveTextContent("Pages");
  });

  it("omits metadata strip entirely when no metadata props provided", () => {
    render(<WhatsIncluded description={plainDescription} />);
    expect(screen.queryByTestId("template-metadata-strip")).not.toBeInTheDocument();
  });

  it("renders metadata strip even with plain (non-bulleted) description", () => {
    render(
      <WhatsIncluded
        description={plainDescription}
        fileType="xlsx"
        downloadCount={99}
      />,
    );
    const strip = screen.getByTestId("template-metadata-strip");
    expect(strip).toHaveTextContent("XLSX");
    expect(strip).toHaveTextContent("99");
  });

  it("renders bullet checklist correctly", () => {
    render(
      <WhatsIncluded
        description={bulletDescription}
        fileType="docx"
        downloadCount={100}
      />,
    );
    expect(screen.getByText("Section one")).toBeInTheDocument();
    expect(screen.getByText("Section two")).toBeInTheDocument();
    expect(screen.getByText("Section three")).toBeInTheDocument();
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// TemplateDownloadPanel — notify on revision (story-templates-06 AC#2 / DEVIATIONS B15)
// ───────────────────────────────────────────────────────────────────────────────

import { TemplateDownloadPanel } from "./TemplateDownloadPanel";

describe("TemplateDownloadPanel notify affordance (templates-06 AC#2)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders an email input, a Notify submit button, and the caption", () => {
    render(<TemplateDownloadPanel templateId="tid-1" fileType="docx" />);
    expect(screen.getByTestId("notify-email-input")).toBeInTheDocument();
    expect(screen.getByTestId("notify-submit-btn")).toBeInTheDocument();
    expect(screen.getByText(/Get notified when this template is revised/i)).toBeInTheDocument();
  });

  it("shows error microcopy when submitting an invalid email (AC#2)", async () => {
    render(<TemplateDownloadPanel templateId="tid-1" fileType="docx" />);
    const input = screen.getByTestId("notify-email-input");
    const btn = screen.getByTestId("notify-submit-btn");

    fireEvent.change(input, { target: { value: "not-an-email" } });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId("notify-error")).toBeInTheDocument();
      expect(screen.getByTestId("notify-error")).toHaveTextContent("Enter a valid email.");
    });
  });

  it("shows success microcopy \"You'll be the first to know.\" on successful submit (AC#2)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      }),
    );

    render(<TemplateDownloadPanel templateId="tid-1" fileType="docx" />);
    const input = screen.getByTestId("notify-email-input");
    const btn = screen.getByTestId("notify-submit-btn");

    fireEvent.change(input, { target: { value: "test@example.com" } });
    await act(async () => {
      fireEvent.click(btn);
    });

    await waitFor(() => {
      expect(screen.getByTestId("notify-success")).toBeInTheDocument();
      expect(screen.getByTestId("notify-success")).toHaveTextContent(
        "You'll be the first to know.",
      );
    });
  });

  it("shows generic error microcopy on server error (AC#2)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ ok: false, error: { message: "Server error." } }),
      }),
    );

    render(<TemplateDownloadPanel templateId="tid-1" fileType="docx" />);
    const input = screen.getByTestId("notify-email-input");
    const btn = screen.getByTestId("notify-submit-btn");

    fireEvent.change(input, { target: { value: "test@example.com" } });
    await act(async () => {
      fireEvent.click(btn);
    });

    await waitFor(() => {
      expect(screen.getByTestId("notify-error")).toBeInTheDocument();
      expect(screen.getByTestId("notify-error")).toHaveTextContent("Server error.");
    });
  });

  it("POSTs to /api/newsletter with source='template-notify' (AC#3 — reuses email-capture path)", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<TemplateDownloadPanel templateId="tid-abc" fileType="pdf" />);
    const input = screen.getByTestId("notify-email-input");
    const btn = screen.getByTestId("notify-submit-btn");

    fireEvent.change(input, { target: { value: "notifier@example.com" } });
    await act(async () => {
      fireEvent.click(btn);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/newsletter",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"source":"template-notify"'),
        }),
      );
    });
  });

  it("has no serious a11y violations", async () => {
    const { container } = render(<TemplateDownloadPanel templateId="tid-1" fileType="docx" />);
    const results = await axe.run(container, { resultTypes: ["violations"] });
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toHaveLength(0);
  });
});
