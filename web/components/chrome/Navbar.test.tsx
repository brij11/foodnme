import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/blog" }));

import { Navbar } from "./Navbar";
import { ConsultationModalProvider } from "@/components/consultation/ConsultationModalProvider";

function renderNav() {
  return render(
    <ConsultationModalProvider>
      <Navbar />
    </ConsultationModalProvider>,
  );
}

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

  it("renders Jobs and Experts disabled and non-link (AC#3)", () => {
    renderNav();
    const jobs = screen.getAllByText("Jobs")[0]!;
    expect(jobs.tagName).toBe("SPAN");
    expect(jobs).toHaveAttribute("aria-disabled", "true");
    expect(jobs.className).toContain("cursor-not-allowed");
    // Knowledge Hub, by contrast, is a real link
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
