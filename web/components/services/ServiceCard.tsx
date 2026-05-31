import { Icon } from "@/components/ui/Icon";
import type { Service } from "@/lib/services";

/**
 * Services-page card (UI-DESIGN-HANDOFF.md §4.1). Per the green-rebalance, the icon and the
 * overline are **dark olive** (`--color-text`), NOT primary green — green is reserved for
 * actionable elements. "Learn more" jumps to the inquiry form (`#inquiry`, services-02).
 *
 * "Learn more" uses the ghost-button treatment: green text + trailing → that grows on hover,
 * no underline — per prototype .btn-ghost (plan/design/styles.css:230-241, DEVIATIONS D6).
 */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group flex h-full flex-col rounded-lg border border-border bg-card-bg p-6 transition hover:-translate-y-[2px] hover:border-[#d8d3bf] hover:shadow-card">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-surface-light text-text">
        <Icon name={service.icon} size={22} stroke={1.8} />
      </div>
      <p className="font-heading text-[0.62rem] font-bold uppercase tracking-[0.14em] text-text">
        {service.overline}
      </p>
      <h3 className="mt-1.5 font-heading text-[1.05rem] font-bold tracking-[-0.01em] text-text">
        {service.name}
      </h3>
      <p className="mt-2 font-body text-[0.88rem] leading-relaxed text-muted">{service.short}</p>
      {/* Ghost-button treatment: transparent bg, primary text, arrow grows 4px right on hover */}
      <a
        href="#inquiry"
        className="mt-4 self-start font-heading text-[0.8rem] font-bold text-primary after:ml-1.5 after:inline-block after:content-['→'] after:transition-transform after:duration-200 hover:text-primary-deep hover:after:translate-x-1"
      >
        Learn more
      </a>
    </div>
  );
}
