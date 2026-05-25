import Image from "next/image";

/**
 * `<Image>` for MDX bodies (blog-03 AC). Renders next/image at a fixed editorial aspect
 * with an optional caption. Width/height are required by next/image; we use a responsive
 * intrinsic size inside the 720px article column.
 */
export function MdxImage({ src, alt, caption }: { src: string; alt?: string; caption?: string }) {
  return (
    <figure className="my-8">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-surface-light">
        <Image src={src} alt={alt ?? ""} fill sizes="(max-width: 720px) 100vw, 720px" className="object-cover" />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center font-body text-[0.78rem] text-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
