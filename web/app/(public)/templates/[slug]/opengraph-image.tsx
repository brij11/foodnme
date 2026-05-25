import { ImageResponse } from "next/og";
import { getResourceBySlug, parseWhatsIncluded } from "@/lib/resources";
import { templateCategoryLabel } from "@/lib/categories";

// Per-template OG card (TECHNICAL-REQUIREMENTS.md §7.3): title + category over the brand palette.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "foodnme template";

export default async function OpengraphImage({ params }: { params: { slug: string } }) {
  const template = await getResourceBySlug(params.slug);
  const title = template?.title ?? "foodnme";
  const category = template ? templateCategoryLabel(template.category) : "Templates";
  const intro = template ? (parseWhatsIncluded(template.description).intro ?? "") : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FCFCF8",
          padding: "72px",
          borderTop: "16px solid #4C7C59",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#283618", letterSpacing: 2 }}>
          {category.toUpperCase()} · TEMPLATE
        </div>
        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: "#283618", lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 28, color: "#5f6b53", maxWidth: 760 }}>{intro}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 32, fontWeight: 800, color: "#283618" }}>
            <div style={{ width: 14, height: 14, borderRadius: 999, background: "#DDA15E" }} />
            foodnme
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
