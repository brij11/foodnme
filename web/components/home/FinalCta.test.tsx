import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConsultationModalProvider } from "@/components/consultation/ConsultationModalProvider";
import { FinalCta } from "./FinalCta";

describe("FinalCta (story-homepage-05 #8)", () => {
  it("renders the CTA heading + Book a consultation + See all services (AC#12)", () => {
    render(
      <ConsultationModalProvider>
        <FinalCta />
      </ConsultationModalProvider>,
    );
    expect(
      screen.getByRole("heading", { name: /Free 30-minute scoping call/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Book a consultation/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /See all services/ })).toHaveAttribute(
      "href",
      "/services",
    );
  });
});
