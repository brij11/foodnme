import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * Asserts the page has zero critical/serious Axe-core violations
 * (TECHNICAL-REQUIREMENTS.md §1, §10 accessibility gate).
 */
export async function expectNoSeriousA11yViolations(page: Page) {
  // The card-grid fade-up stagger animates opacity 0→1 (UI-DESIGN-HANDOFF.md §4.10). Scanning
  // mid-fade yields transient low-contrast false positives — the settled DOM is what ships and
  // is the contract under test. Wait for any `.animate-fade-up` element to reach full opacity
  // (resolves immediately when there are none). Falls through after the timeout so a genuinely
  // stuck animation still gets scanned (and would fail loudly).
  await page
    .waitForFunction(
      () => Array.from(document.querySelectorAll(".animate-fade-up")).every((el) => getComputedStyle(el).opacity === "1"),
      undefined,
      { timeout: 5000 },
    )
    .catch(() => {});

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
