import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Clock, MapPin, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/Section";
import { formatPrice, getDestination, getPackage } from "@/data/site";

export const Route = createFileRoute("/safaris/$slug")({
  loader: ({ params }) => {
    const pkg = getPackage(params.slug);
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
});

function PackageDetail() {
  const { pkg } = Route.useLoaderData();
  const dests = pkg.destinationSlugs.map(getDestination).filter(Boolean);

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
            {dests.map((d) => d!.name).join(" · ")}
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

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-display text-4xl font-semibold">
              {formatPrice(pkg.priceFrom, pkg.currency)}
            </p>
            <p className="text-sm text-muted-foreground">per person sharing</p>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="text-right">{pkg.days} days</dd>
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

            <div className="mt-6 space-y-3">
              <Button asChild variant="gold" size="lg" className="w-full">
                <Link to="/custom-safari">Request this safari</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/contact">Ask a question</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
              {dests.map((d) => (
                <Badge key={d!.slug} variant="secondary" className="font-normal">
                  <Link to="/destinations/$slug" params={{ slug: d!.slug }}>
                    {d!.name}
                  </Link>
                </Badge>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
