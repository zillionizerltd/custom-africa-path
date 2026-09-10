import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Clock, MapPin, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PackageCard } from "@/components/site/Cards";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { TripCostCalculator } from "@/components/site/TripCostCalculator";
import { siteContentQueryOptions } from "@/lib/content-query";

export const Route = createFileRoute("/safaris/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(siteContentQueryOptions);
    const pkg = data.packages.find((p) => p.slug === params.slug);
    if (!pkg) throw notFound();
    return { pkg };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Safari unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.pkg;
    return {
      meta: [
        { title: `${p.title} — Berakah Tours & Travel` },
        { name: "description", content: p.short },
        { property: "og:title", content: `${p.title} — Berakah Tours & Travel` },
        { property: "og:description", content: p.short },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/safaris/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/safaris/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: p.title,
            description: p.short,
            touristType: p.category,
            offers: {
              "@type": "Offer",
              price: p.priceFrom,
              priceCurrency: p.currency,
              availability: "https://schema.org/InStock",
            },
          }),
        },
      ],
    };
  },
  component: PackageDetail,
  errorComponent: () => (
    <div className="container-page py-20 text-center text-muted-foreground">
      Something went wrong loading this safari. Please try again.
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-20 text-center text-muted-foreground">Safari not found.</div>
  ),
});

function PackageDetail() {
  const { pkg } = Route.useLoaderData();
  const { data } = useSuspenseQuery(siteContentQueryOptions);
  const dests = pkg.destinationSlugs
    .map((slug) => data.destinations.find((d) => d.slug === slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const related = data.packages
    .filter(
      (p) =>
        p.slug !== pkg.slug && p.destinationSlugs.some((s) => pkg.destinationSlugs.includes(s)),
    )
    .slice(0, 3);

  return (
    <>
      <PageHero eyebrow={pkg.category} title={pkg.title} description={pkg.short} image={pkg.image}>
        <div className="flex flex-wrap gap-5 text-sm text-ink-foreground/80">
          <span className="flex items-center gap-2">
            <Clock className="size-4 text-accent" /> {pkg.days} days / {pkg.nights} nights
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4 text-accent" /> Max {pkg.maxTravelers} travellers
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-accent" />
            {dests.map((d) => d.name).join(" · ")}
          </span>
        </div>
      </PageHero>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="text-lg leading-relaxed text-muted-foreground">{pkg.description}</p>

          <h2 className="mt-10 text-2xl">Highlights</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {pkg.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" /> {h}
              </li>
            ))}
          </ul>

          <h2 className="mt-12 text-2xl">Day by day itinerary</h2>
          <ol className="mt-6 space-y-6 border-l border-border pl-6">
            {pkg.itinerary.map((day) => (
              <li key={day.day} className="relative">
                <span className="absolute -left-[1.9rem] flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {day.day}
                </span>
                <h3 className="text-lg">{day.title}</h3>
                <ul className="mt-2 space-y-1.5">
                  {day.details.map((d) => (
                    <li key={d} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-border" /> {d}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-xl">What&apos;s included</h2>
              <ul className="mt-4 space-y-2">
                {pkg.included.map((i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl">Not included</h2>
              <ul className="mt-4 space-y-2">
                {pkg.excluded.map((i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h2 className="mt-12 text-xl">Requirements</h2>
          <ul className="mt-4 space-y-2">
            {pkg.requirements.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" /> {r}
              </li>
            ))}
          </ul>

          <h2 className="mt-12 text-xl">Cancellation policy</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pkg.cancellation}</p>
        </div>

        <aside className="space-y-5">
          <TripCostCalculator pkg={pkg} />

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg">Trip facts</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="text-right">
                  {pkg.days} days / {pkg.nights} nights
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Availability</dt>
                <dd className="text-right">{pkg.availableMonths}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Accommodation</dt>
                <dd className="text-right">{pkg.accommodation}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Transport</dt>
                <dd className="text-right">{pkg.transport}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
              {dests.map((d) => (
                <Link key={d.slug} to="/destinations/$slug" params={{ slug: d.slug }}>
                  <Badge variant="secondary" className="font-normal hover:bg-accent/20">
                    {d.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {related.length ? (
        <section className="bg-sand py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Similar journeys" title="You might also like" />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PackageCard key={p.slug} pkg={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
