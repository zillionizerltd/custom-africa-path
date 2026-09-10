import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { PageHero } from "@/components/site/Section";
import { siteContentQueryOptions } from "@/lib/content-query";
import { shortDate } from "@/lib/format";
import heroImage from "@/assets/dest-rwanda.jpg";

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQueryOptions),
  head: () => ({
    meta: [
      { title: "Travel Blog — African Safari Guides & Tips | Berakah Tours" },
      {
        name: "description",
        content:
          "Practical guides on gorilla trekking, visas, seasons and packing for safaris in Rwanda, Uganda, Kenya and Tanzania.",
      },
      { property: "og:title", content: "Travel Blog — African Safari Guides & Tips" },
      { property: "og:description", content: "Plan smarter before you fly." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
  errorComponent: () => (
    <div className="container-page py-20 text-center text-muted-foreground">
      Something went wrong loading the blog. Please try again.
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-20 text-center text-muted-foreground">Page not found.</div>
  ),
});

function BlogIndex() {
  const { data } = useSuspenseQuery(siteContentQueryOptions);

  return (
    <>
      <PageHero
        eyebrow="Travel blog"
        title="Guides from the people who run the trips"
        description="Season timing, permits, packing and the practical details that make or break a safari."
        image={heroImage}
      />
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="card-lift group overflow-hidden rounded-xl border border-border bg-card hover:card-lift-hover"
            >
              <img
                src={post.image}
                alt={post.title}
                width={1024}
                height={768}
                loading="lazy"
                className="aspect-16/9 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="p-5">
                <p className="eyebrow">
                  {post.category} · {post.readMinutes} min read
                </p>
                <h2 className="mt-2 text-lg leading-snug">{post.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                <time dateTime={post.date} className="mt-4 block text-xs text-muted-foreground">
                  {shortDate(post.date)}
                </time>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
