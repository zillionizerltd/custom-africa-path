import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CarFront,
  Clock,
  Footprints,
  Headset,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { atAGlance, company, quickFacts } from "@/data/site";
import heroImage from "@/assets/hero-gorilla.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Berakah Tours & Travel — Kigali Safari Operator" },
      {
        name: "description",
        content:
          "Berakah Tours & Travel is a Kigali-based safari operator building tailor-made journeys across Rwanda, Uganda, Kenya, Tanzania and Congo.",
      },
      { property: "og:title", content: "About Berakah Tours & Travel" },
      { property: "og:description", content: company.promise },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const story = [
  {
    icon: CarFront,
    title: "Our story",
    text: "We started as two driver-guides with one Land Cruiser and a conviction that the standard packaged safari serves the operator, not the traveller. Twelve years later we run journeys across five countries and we still write every itinerary by hand.",
  },
  {
    icon: Footprints,
    title: "Our guides",
    text: "Our consultants are Rwandan and Ugandan. They have walked the trails in Volcanoes and Bwindi, slept in the camps we book, and know which lodge has the view and which one only has the photograph of a view.",
  },
  {
    icon: Headset,
    title: "How we work",
    text: "We hold permits, manage vehicles and guides, and stay reachable throughout your trip. When something changes on the ground — weather, roads, a gorilla family moving you have a person, not a call centre.",
  },
];

const values = [
  {
    title: "Listen first",
    text: "The itinerary starts with a conversation, not a catalogue page.",
  },
  {
    title: "Say it straight",
    text: "Honest costs, honest trail difficulty, honest season advice.",
  },
  {
    title: "Employ locally",
    text: "Guides, porters, drivers and cooks hired from park communities.",
  },
  {
    title: "Leave it better",
    text: "A share of every trek fee supports conservation and community projects.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Every safari is built around the wishes and needs of our guests"
        description="Berakah Tours & Travel is a Rwandan tour operator based in Kigali, designing private journeys across East and Central Africa."
        image={heroImage}
      />

      <section aria-labelledby="glance-heading" className="border-b border-border bg-card">
        <h2 id="glance-heading" className="sr-only">
          At a glance
        </h2>
        <dl className="container-page grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-border">
          {atAGlance.map((s) => (
            <div key={s.label} className="flex flex-col-reverse px-4 py-8 text-center md:py-10">
              <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
              <dd className="font-display text-4xl font-semibold text-primary">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-12">
          {story.map((s, i) => (
            <article key={s.title} className="grid gap-5 sm:grid-cols-[3.5rem_1fr]">
              <div className="flex size-12 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
                <s.icon className="size-5" />
              </div>
              <div>
                <p className="eyebrow">0{i + 1}</p>
                <h2 className="mt-1 text-3xl">{s.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </article>
          ))}
          <Button asChild variant="gold" size="lg" className="sm:ml-19">
            <Link to="/custom-safari">Start planning with us</Link>
          </Button>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg">Quick facts</h2>
            <dl className="mt-3 divide-y divide-border text-sm">
              {quickFacts.map((f) => (
                <div key={f.label} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface-ink rounded-xl p-6">
            <h2 className="text-lg text-ink-foreground">Talk to a consultant</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-foreground/85">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" /> {company.address}
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                  {company.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                <a href={`mailto:${company.email}`} className="hover:text-accent">
                  {company.email}
                </a>
              </li>
              <li className="flex gap-3">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-accent" />
                <a
                  href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent"
                >
                  WhatsApp us
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-accent" /> {company.officeHours}
              </li>
            </ul>
            <Button asChild variant="gold" className="mt-6 w-full">
              <Link to="/contact">Send us a message</Link>
            </Button>
          </div>
        </aside>
      </section>

      <section className="bg-sand py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Our principles" title="Four things we do not compromise on" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
