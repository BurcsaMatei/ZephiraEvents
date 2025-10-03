// components/blog/BlogCard.tsx

// ==============================
// Imports
// ==============================
import { withBase } from "../../lib/config";
import { formatDateISOtoRo as formatDateRo } from "../../lib/dates";
import type { Post } from "../../types/blog";
import Card from "../Card";

// ==============================
// Types
// ==============================
type Props = {
  post: Post;
  basePath?: string;
};

// ==============================
// Utils
// ==============================
function joinPath(base: string, slug: string): string {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const s = slug.startsWith("/") ? slug.slice(1) : slug;
  return `${b}/${s}`;
}

// ==============================
// Component
// ==============================
export default function BlogCard({ post, basePath = "/blog" }: Props) {
  const hrefPath = joinPath(basePath, post.slug);
  const href = withBase(hrefPath);

  // acceptă și "cover" (din ArticlesPreview) pe lângă "coverImage"
  const coverSrc = post.coverImage ?? (post as unknown as { cover?: string }).cover;
  const image =
    typeof coverSrc === "string" && coverSrc.length > 0
      ? {
          src: withBase(coverSrc),
          alt: post.title,
          // raport 4:3 pentru a evita "incorrect aspect ratio"
          width: 800,
          height: 600,
          // grilă: 4 col ≥1024px (~25vw), 2 col ≥640px (~50vw), altfel 100vw
          sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
        }
      : undefined;

  const meta = (
    <>
      <time dateTime={post.date}>{formatDateRo(post.date)}</time>
      {post.tags?.length ? (
        <>
          {" · "}
          <span>{post.tags[0]}</span>
        </>
      ) : null}
    </>
  );

  return (
    <Card
      title={post.title}
      href={href}
      meta={meta}
      excerpt={post.excerpt ?? ""}
      {...(image ? { image } : {})}
      mediaRatio="4/3"
    />
  );
}
