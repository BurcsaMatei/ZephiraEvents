// pages/blog/[slug].tsx

// ==============================
// Imports
// ==============================
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";

import Appear from "../../components/animations/Appear";
import RelatedPosts from "../../components/blog/RelatedPosts";
import Breadcrumbs from "../../components/Breadcrumbs";
import IntroSection from "../../components/sections/IntroSection";
import Seo from "../../components/Seo";
import Img from "../../components/ui/Img";
import { getAllPosts, getPostBySlug } from "../../lib/blogData";
import { absoluteOgImage, absoluteUrl, SEO_DEFAULTS } from "../../lib/config";
import { formatDateISOtoRo } from "../../lib/dates";
import { coverCaption, coverFigure } from "../../styles/blogPost.css";
import { proseClass } from "../../styles/prose.css";

// ==============================
// Types
// ==============================
type BasePost = NonNullable<ReturnType<typeof getPostBySlug>>;
type Props = {
  post: BasePost;
  related: { slug: string; title: string }[];
};

// ==============================
// Type guards / helpers pure
// ==============================
function hasCoverCaption(p: BasePost | unknown): p is BasePost & { coverCaption: string } {
  const v = (p as { coverCaption?: unknown })?.coverCaption;
  return typeof v === "string" && v.trim().length > 0;
}

function buildBreadcrumbList(canonical: string, postTitle: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: postTitle, item: canonical },
    ],
  } as const;
}

function buildBlogPosting(post: BasePost, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    description: post.excerpt,
    url: canonical,
    mainEntityOfPage: canonical,
    publisher: {
      "@type": "Organization",
      name: SEO_DEFAULTS.siteName,
      logo: { "@type": "ImageObject", url: absoluteOgImage(SEO_DEFAULTS.ogImage) },
    },
    ...(post.coverImage ? { image: absoluteUrl(post.coverImage) } : {}),
    ...(post.author ? { author: { "@type": "Person", name: post.author } } : {}),
  } as const;
}

function formatReadingTime(rt?: string | number): string {
  if (rt == null) return "";
  if (typeof rt === "number" && Number.isFinite(rt) && rt > 0) return `${rt} min`;
  if (typeof rt === "string") {
    const m = rt.match(/\d+/);
    if (m?.[0]) return `${Number(m[0])} min`;
    const trimmed = rt.trim();
    return trimmed ? trimmed : "";
  }
  return "";
}

// ==============================
// Page
// ==============================
const BlogPostPage: NextPage<Props> = ({ post, related }) => {
  const canonical = absoluteUrl(`/blog/${post.slug}`);
  const breadcrumbList = buildBreadcrumbList(canonical, post.title);
  const blogPosting = buildBlogPosting(post, canonical);

  const reading = formatReadingTime(post.readingTime as unknown as string | number | undefined);
  const lede = `${formatDateISOtoRo(post.date)}${reading ? ` · ${reading}` : ""}`;

  const coverSrc = post.coverImage ?? "/images/blog/placeholder.jpg";
  const coverAlt: string = post.title;

  return (
    <>
      <Seo
        type="article"
        title={post.title}
        description={post.excerpt}
        url={canonical}
        image={absoluteOgImage(coverSrc)}
        structuredData={[breadcrumbList, blogPosting]}
      />

      <Breadcrumbs
        items={[
          { name: "Acasă", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, current: true },
        ]}
      />

      {/* Intro aliniat și animat */}
      <section className="section">
        <div className="container">
          <Appear>
            <IntroSection eyebrow="Articol" title={post.title} lede={lede} />
          </Appear>
        </div>
      </section>

      {/* Conținut principal – aliniat la containerul global */}
      <section className="section">
        <div className="container">
          {post.coverImage && (
            <Appear as="figure" aria-label="Imagine reprezentativă articol" className={coverFigure}>
              <Img
                src={coverSrc}
                alt={coverAlt}
                fill
                fit="cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority={false}
              />
            </Appear>
          )}

          {hasCoverCaption(post) && (
            <Appear as="figcaption" className={coverCaption} delay={0.06}>
              {post.coverCaption}
            </Appear>
          )}

          {post.contentHtml && (
            <Appear as="article" className={proseClass} delay={0.12}>
              {/* eslint-disable-next-line react/no-danger */}
              <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
            </Appear>
          )}
        </div>
      </section>

      {/* Related Posts – aliniat + animat */}
      <section className="section">
        <div className="container">
          <Appear>
            <RelatedPosts items={related} />
          </Appear>
        </div>
      </section>
    </>
  );
};

// ==============================
// SSG
// ==============================
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts();
  return { paths: posts.map((p) => ({ params: { slug: p.slug } })), fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.slug);
  const post = getPostBySlug(slug);
  if (!post) return { notFound: true };

  const related = getAllPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 6)
    .map((p) => ({ slug: p.slug, title: p.title }));

  return { props: { post, related } };
};

export default BlogPostPage;
