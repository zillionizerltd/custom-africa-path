import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/Section";
import { siteContentQueryOptions } from "@/lib/content-query";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(siteContentQueryOptions);
    const post = data.posts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.post;
    return {
      meta: [
        { title: `${p.title} — Berakah Tours & Travel` },
        { name: "description", content: p.excerpt },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.title,
            datePublished: p.date,
            articleSection: p.category,
            author: { "@type": "Organization", name: "Berakah Tours & Travel" },
          }),
        },
      ],
    };
  },
  component: BlogPost,
  errorComponent: () => (
    <div className="container-page py-20 text-center text-muted-foreground">
      Something went wrong loading this article. Please try again.
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-20 text-center text-muted-foreground">Article not found.</div>
  ),
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  const { data } = useSuspenseQuery(siteContentQueryOptions);
  const more = data.posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <PageHero
        eyebrow={`${post.category} · ${post.readMinutes} min read`}
        title={post.title}
        description={post.excerpt}
        image={post.image}
      />
      <article className="container-page py-16">
        <div className="mx-auto max-w-2xl space-y-5">
          {post.body.map((paragraph) => (
            <p key={paragraph} className="text-base leading-[1.85] text-foreground/85">
              {paragraph}
            </p>
          ))}
          <div className="surface-ink mt-10 rounded-xl p-6">
            <h2 className="text-xl text-ink-foreground">Planning a trip like this?</h2>
            <p className="mt-2 text-sm text-ink-foreground/75">
              Send us your dates and we will come back with a costed itinerary.
            </p>
            <Button asChild variant="gold" className="mt-5">
              <Link to="/custom-safari">Plan My Safari</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-2xl border-t border-border pt-8">
          <h2 className="text-xl">Keep reading</h2>
          <ul className="mt-4 space-y-3">
            {more.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="text-base font-medium text-primary underline-offset-4 hover:underline"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </>
  );
}
