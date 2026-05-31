import { Icon } from "@/components/ui/Icon";
import { parseWhatsIncluded } from "@/lib/resources";

/**
 * "What's inside this template" card (templates-02 AC#5, templates-06 AC#1).
 *
 * Renders a bulleted checklist when the description carries markdown-style bullet lines,
 * otherwise falls back to the plain paragraph. A metadata strip (Format / Last updated /
 * Downloads) runs below the checklist, matching the prototype's design/screens-main.jsx:638.
 * "Pages" is intentionally absent — no schema column (DEVIATIONS C7).
 */
export function WhatsIncluded({
  description,
  fileType,
  downloadCount,
  createdAt,
}: {
  description: string;
  fileType?: string;
  downloadCount?: number;
  createdAt?: string;
}) {
  const { intro, bullets } = parseWhatsIncluded(description);

  /** Format ISO date as "MMM YYYY" (e.g. "Jan 2025"). Falls back to the raw string. */
  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    } catch {
      return iso;
    }
  }

  const hasMetadata = fileType || downloadCount !== undefined || createdAt;

  return (
    <div className="rounded-lg border border-border bg-card-bg p-7">
      <h2 className="font-heading text-[1.1rem] font-bold tracking-[-0.01em] text-text">
        What&apos;s inside this template
      </h2>

      {bullets.length > 0 ? (
        <>
          {intro ? <p className="mt-2 font-body text-[0.92rem] leading-relaxed text-muted">{intro}</p> : null}
          <ul className="mt-4 flex flex-col">
            {bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border-b border-border py-3 last:border-none"
              >
                <span className="mt-0.5 inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-tag-safe-bg text-tag-safe-text">
                  <Icon name="check" size={13} stroke={2.4} />
                </span>
                <span className="font-body text-[0.92rem] text-text">{b}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 font-body text-[0.95rem] leading-relaxed text-muted">{intro}</p>
      )}

      {/* Metadata strip — Format / Last updated / Downloads (templates-06 AC#1 / DEVIATIONS B14) */}
      {hasMetadata && (
        <div
          className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 font-body text-[0.82rem] text-muted"
          data-testid="template-metadata-strip"
        >
          {fileType && (
            <span>
              <strong className="font-semibold text-text">Format:</strong>{" "}
              {fileType.toUpperCase()}
            </span>
          )}
          {createdAt && (
            <span>
              <strong className="font-semibold text-text">Last updated:</strong>{" "}
              {formatDate(createdAt)}
            </span>
          )}
          {downloadCount !== undefined && (
            <span>
              <strong className="font-semibold text-text">Downloads:</strong>{" "}
              {downloadCount.toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
