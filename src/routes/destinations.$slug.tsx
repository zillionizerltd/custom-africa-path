import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarRange, Clock, MapPin } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackageCard } from "@/components/site/Cards";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { getDestination, packages } from "@/data/site";

export const Route = createFileRoute("/destinations/$slug")({
  loader: ({ params }) => {
    const destination = getDestination(params.slug);
    if (!destination) throw notFound();
    return { destination };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Destination unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const d = loaderData.destination;
    const title = `${d.name} Safaris & Travel Guide — Berakah Tours`;
    return {
      meta: [
        { title },
        { name: "description", content: d.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: d.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/destinations/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/destinations/${params.slug}` }],
    };
  },
  component: DestinationDetail,
});

function DestinationDetail() {
  const { destination: d } = Route.useLoaderData();
  const related = packages.filter((p) => p.destinationSlugs.includes(d.slug));

  return (
    <>
      <PageHero eyebrow={d.region} title={d.name} description={d.summary} image={d.image}>
        <div className="flex flex-wrap gap-5 text-sm text-ink-foreground/80">
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-accent" /> {d.country}
          </span>
          <span className="flex items-center gap-2">
            <CalendarRange className="size-4 text-accent" /> {d.bestTime}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="size-4 text-accent" /> {d.duration}
          </span>
        </div>
      </PageHero>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="text-2xl">About {d.name}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{d.description}</p>

          <h3 className="mt-10 text-xl">Things to do</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {d.activities.map((a) => (
              <Badge key={a} variant="secondary" className="text-sm font-normal">
                {a}
              </Badge>
            ))}
          </div>

          <h3 className="mt-10 text-xl">Key attractions</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {d.attractions.map((a) => (
              <li key={a} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" /> {a}
              </li>
            ))}
          </ul>

          <h3 className="mt-10 text-xl">Where you stay</h3>
          <ul className="mt-4 space-y-2">
            {d.accommodation.map((a) => (
              <li key={a} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
                {a}
              </li>
            ))}
          </ul>

          <h3 className="mt-10 text-xl">Frequently asked</h3>
          <Accordion type="single" collapsible className="mt-3">
            {d.faq.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg">Travel information</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {d.travelInfo.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-ink rounded-xl p-6">
            <h3 className="text-lg text-ink-foreground">Want {d.name} your way?</h3>
            <p className="mt-2 text-sm text-ink-foreground/75">
              Send us your dates and interests and we will design a private itinerary.
            </p>
            <Button asChild variant="gold" className="mt-5 w-full">
              <Link to="/custom-safari">Plan My Safari</Link>
            </Button>
          </div>
        </aside>
      </section>

      {related.length > 0 ? (
        <section className="bg-sand py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Safaris" title={`Journeys featuring ${d.name}`} />
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
