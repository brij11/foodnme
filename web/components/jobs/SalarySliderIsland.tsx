"use client";

import { useState } from "react";

/**
 * Client island: interactive salary slider with a live LPA readout (DEVIATIONS D9 / story-jobs-16).
 * Replaces the static fallback in JobsFilterSidebar when JS is available.
 * Carries a hidden `salary_min` input so the parent GET form submits the value correctly.
 */
export function SalarySliderIsland({ initialValue = 0 }: { initialValue?: number }) {
  const [value, setValue] = useState(initialValue);
  const lpa = (value / 100000).toFixed(1);
  const display = value === 0 ? "Any salary" : `₹${lpa} L/yr+`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span
          aria-live="polite"
          aria-atomic="true"
          className="font-body text-[0.82rem] font-semibold text-text"
          data-testid="salary-readout"
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        name="salary_min"
        min={0}
        max={2000000}
        step={100000}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Minimum salary"
        aria-valuetext={display}
        className="w-full accent-primary"
      />
    </div>
  );
}
