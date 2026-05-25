import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * Asserts the page has zero critical/serious Axe-core violations
 * (TECHNICAL-REQUIREMENTS.md §1, §10 accessibility gate).
 */
export async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(
    serious,
    `Axe critical/serious violations: ${JSON.stringify(
      serious.map((v) => ({ id: v.id, nodes: v.nodes.length })),
      null,
      2,
    )}`,
  ).toEqual([]);
}
