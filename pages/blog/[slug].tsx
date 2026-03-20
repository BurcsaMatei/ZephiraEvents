// pages/blog/[slug].tsx

// ==============================
// Imports
// ==============================
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";

import Appear, { AppearGroup } from "../../components/animations/Appear";
import RelatedPosts from "../../components/blog/RelatedPosts";
import Breadcrumbs, { type Crumb } from "../../components/Breadcrumbs";
import Hero from "../../components/sections/Hero";
import Seo from "../../components/Seo";
import Separator from "../../components/Separator";
import { getAllPosts, getPostBySlug } from "../../lib/blogData";
import { absoluteOgImage, absoluteUrl, SEO_DEFAULTS } from "../../lib/config";
import { formatDateISOtoRo } from "../../lib/dates";
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
// Helpers
// ==============================
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

  const crumbs: Crumb[] = [
    { name: "Acasă", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Articol", current: true },
  ];

  return (
    <>
      <Seo
        type="article"
        title={post.title}
        description={post.excerpt}
        url={canonical}
        image={absoluteOgImage(post.coverImage)}
        structuredData={[breadcrumbList, blogPosting]}
      />

      <section data-full-bleed="true">
        <Appear>
          <Hero
            title={post.title}
            subtitle={lede}
            image={{ src: coverSrc, alt: post.title, priority: true }}
            height="sm"
          />
        </Appear>
      </section>

      <Breadcrumbs items={crumbs} />

      <Separator />

      <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
        <section className="section">
          <div className="container">
            {post.contentHtml && (
              <Appear as="article" className={proseClass}>
                <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
              </Appear>
            )}
          </div>
        </section>

        <Separator />

        <section className="section">
          <div className="container">
            <Appear>
              <RelatedPosts items={related} />
            </Appear>
          </div>
        </section>
      </AppearGroup>
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
