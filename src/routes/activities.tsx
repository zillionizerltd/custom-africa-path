import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/Section";
import { siteContentQueryOptions } from "@/lib/content-query";
import heroImage from "@/assets/dest-uganda.jpg";

export const Route = createFileRoute("/activities")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQueryOptions),
  head: () => ({
    meta: [
      { title: "Safari Activities & Experiences — Berakah Tours & Travel" },
      {
        name: "description",
        content:
          "Gorilla trekking, game drives, cultural visits, photography safaris, hiking, city tours and beach escapes across East and Central Africa.",
      },
      { property: "og:title", content: "Safari Activities & Experiences — Berakah Tours" },
      { property: "og:description", content: "Choose what you want to experience, we build the route." },
      { property: "og:url", content: "/activities" },
    ],
    links: [{ rel: "canonical", href: "/activities" }],
  }),
  component: ActivitiesPage,
  errorComponent: () => (
    <div className="container-page py-20 text-center text-muted-foreground">
      Something went wrong loading activities. Please try again.
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-20 text-center text-muted-foreground">Page not found.</div>
  ),
});

function ActivitiesPage() {
  const { data } = useSuspenseQuery(siteContentQueryOptions);
  const { activities, destinations } = data;

  return (
    <>
      <PageHero
        eyebrow="Activities"
        title="What do you want to experience?"
        description="Pick the experiences that matter to you and we will find the destinations and season that deliver them best."
        image={heroImage}
      />
      <section className="container-page py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <article key={a.name} className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl">{a.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {a.destinations.map((slug) => {
                  const d = destinations.find((dest) => dest.slug === slug);
                  if (!d) return null;
                  return (
                    <Link key={slug} to="/destinations/$slug" params={{ slug }}>
                      <Badge variant="secondary" className="font-normal">
                        {d.name}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 surface-ink flex flex-col items-start gap-5 rounded-2xl p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl text-ink-foreground">Mix any of these into one journey</h2>
            <p className="mt-2 text-sm text-ink-foreground/75">
              Gorillas in the morning, savanna by the weekend, the ocean to finish.
            </p>
          </div>
          <Button asChild variant="gold" size="lg">
            <Link to="/custom-safari">Plan My Safari</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
