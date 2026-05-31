import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { Button } from "./Button";
import { Tag } from "./Tag";
import { Input, Textarea, Select } from "./form";
import { Alert } from "./Alert";
import { Card } from "./Card";
import { Badge } from "./Badge";

describe("Button (AC#3)", () => {
  it("renders all three variants", () => {
    const { rerender } = render(<Button variant="primary">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");
    rerender(<Button variant="outline">Go</Button>);
    expect(screen.getByRole("button").className).toContain("border-border");
    // Ghost: arrow-grow-on-hover (DEVIATIONS B5, story-homepage-11); no bare underline class.
    rerender(<Button variant="ghost">Go</Button>);
    const ghost = screen.getByRole("button");
    expect(ghost.className).toContain("text-primary");
    expect(ghost.className).toContain("after:content-");
    // No standalone "underline" token — affordance is trailing arrow, not text decoration
    expect(ghost.className).not.toMatch(/(?<![:\w])underline(?!-)/u);
  });

  it("applies sizes and disabled state", () => {
    const { rerender } = render(<Button size="sm">x</Button>);
    expect(screen.getByRole("button").className).toContain("text-[0.72rem]");
    rerender(<Button size="lg" disabled>x</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.className).toContain("disabled:bg-border");
  });

  it("defaults type=button (avoids accidental form submit)", () => {
    render(<Button>x</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});

describe("Tag (AC#4)", () => {
  it.each(["green", "safe", "orange", "neutral", "accent"] as const)(
    "renders the %s variant",
    (variant) => {
      render(<Tag variant={variant}>{variant}</Tag>);
      expect(screen.getByText(variant)).toBeInTheDocument();
    },
  );

  it("maps fill variants to their token classes", () => {
    const { rerender } = render(<Tag variant="green">g</Tag>);
    expect(screen.getByText("g")).toHaveClass("bg-tag-green-bg", "text-tag-green-text");
    rerender(<Tag variant="orange">o</Tag>);
    expect(screen.getByText("o")).toHaveClass("bg-tag-orange-bg", "text-tag-orange-text");
  });
});

describe("Form controls error state (AC#5)", () => {
  it("Input shows error message and marks aria-invalid", () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.className).toContain("border-error");
    expect(screen.getByText("Invalid email")).toHaveAttribute("id", input.getAttribute("aria-describedby")!);
  });

  it("Textarea + Select accept the error prop", () => {
    const { rerender } = render(<Textarea label="Msg" error="Too short" />);
    expect(screen.getByLabelText("Msg")).toHaveAttribute("aria-invalid", "true");
    rerender(
      <Select label="Pick" error="Required">
        <option value="">—</option>
      </Select>,
    );
    expect(screen.getByLabelText("Pick")).toHaveAttribute("aria-invalid", "true");
  });

  it("renders a clean (non-error) field without aria-invalid", () => {
    render(<Input label="Name" />);
    expect(screen.getByLabelText("Name")).not.toHaveAttribute("aria-invalid");
  });
});

describe("primitives a11y — Axe-core (AC#6)", () => {
  it("a gallery of every primitive has zero serious/critical violations", async () => {
    const { container } = render(
      <main>
        <h1>Primitives</h1>
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Tag variant="green">Food Safety</Tag>
        <Tag variant="accent">Featured</Tag>
        <Card>Card body</Card>
        <Badge>PDF</Badge>
        <Alert tone="success">Saved.</Alert>
        <Alert tone="error">Something went wrong.</Alert>
        <Input label="Full name" />
        <Textarea label="Message" />
        <Select label="Service">
          <option value="haccp">HACCP</option>
        </Select>
      </main>,
    );
    const results = await axe.run(container, {
      resultTypes: ["violations"],
    });
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toHaveLength(0);
  });
});
