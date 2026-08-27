import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/site/Section";
import { blogPosts } from "@/data/site";
import heroImage from "@/assets/dest-rwanda.jpg";

export const Route = createFileRoute("/blog/")({
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
});

function BlogIndex() {
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
          {blogPosts.map((post) => (
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
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
