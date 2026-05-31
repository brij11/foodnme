import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { AccountMenu } from "./AccountMenu";

// story-homepage-11: AccountMenu Settings item (DEVIATIONS B4)

const noop = vi.fn();

describe("AccountMenu (story-homepage-11 — DEVIATIONS B4)", () => {
  it("renders Dashboard, Settings, and Sign out menu items (AC#3)", () => {
    render(
      <AccountMenu
        user={{ name: "Sam Patel", email: "sam@foodnme.test", role: "expert" }}
        onSignOut={noop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /Dashboard/ })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: /Settings/ })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: /Sign out/ })).toBeInTheDocument();
  });

  it("Settings routes to /dashboard/expert for expert role (AC#3)", () => {
    render(
      <AccountMenu
        user={{ name: "Sam Patel", email: "sam@foodnme.test", role: "expert" }}
        onSignOut={noop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    const settings = screen.getByRole("menuitem", { name: /Settings/ });
    expect(settings).toHaveAttribute("href", "/dashboard/expert");
  });

  it("Settings routes to /dashboard/employer for employer role (AC#3)", () => {
    render(
      <AccountMenu
        user={{ name: "Ria Mehta", email: "ria@foodnme.test", role: "employer" }}
        onSignOut={noop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    const settings = screen.getByRole("menuitem", { name: /Settings/ });
    expect(settings).toHaveAttribute("href", "/dashboard/employer");
  });

  it("Settings routes to /dashboard/seeker for seeker role (AC#3)", () => {
    render(
      <AccountMenu
        user={{ name: "Dev Kumar", email: "dev@foodnme.test", role: "seeker" }}
        onSignOut={noop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    const settings = screen.getByRole("menuitem", { name: /Settings/ });
    expect(settings).toHaveAttribute("href", "/dashboard/seeker");
  });

  it("Settings item has the settings icon (AC#3)", () => {
    render(
      <AccountMenu
        user={{ name: "Sam Patel", email: "sam@foodnme.test", role: "expert" }}
        onSignOut={noop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    const settings = screen.getByRole("menuitem", { name: /Settings/ });
    // Icon renders an svg inside the link
    expect(settings.querySelector("svg")).toBeTruthy();
  });

  it("Settings item is positioned between Dashboard and Sign out (AC#3)", () => {
    render(
      <AccountMenu
        user={{ name: "Sam Patel", email: "sam@foodnme.test", role: "expert" }}
        onSignOut={noop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    const menu = screen.getByRole("menu");
    const items = within(menu).getAllByRole("menuitem");
    const labels = items.map((el) => el.textContent?.replace(/\s+/g, " ").trim() ?? "");
    const dashboardIdx = labels.findIndex((l) => /Dashboard/.test(l));
    const settingsIdx = labels.findIndex((l) => /Settings/.test(l));
    const signOutIdx = labels.findIndex((l) => /Sign out/.test(l));
    expect(dashboardIdx).toBeLessThan(settingsIdx);
    expect(settingsIdx).toBeLessThan(signOutIdx);
  });
});
