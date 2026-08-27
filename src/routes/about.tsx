import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { company } from "@/data/site";
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

const values = [
  { title: "Listen first", text: "The itinerary starts with a conversation, not a catalogue page." },
  { title: "Say it straight", text: "Honest costs, honest trail difficulty, honest season advice." },
  { title: "Employ locally", text: "Guides, porters, drivers and cooks hired from park communities." },
  { title: "Leave it better", text: "A share of every trek fee supports conservation and community projects." },
];

const stats = [
  { value: "1,200+", label: "Guests hosted" },
  { value: "5", label: "Countries covered" },
  { value: "12", label: "Years operating" },
  { value: "98%", label: "Would travel again" },
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

      <section className="container-page grid gap-12 py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl">Who we are</h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              We started as two driver-guides with one Land Cruiser and a conviction that the standard
              packaged safari serves the operator, not the traveller. Twelve years later we run
              journeys across five countries — and we still write every itinerary by hand.
            </p>
            <p>
              Our consultants are Rwandan and Ugandan. They have walked the trails in Volcanoes and
              Bwindi, slept in the camps we book, and know which lodge has the view and which one only
              has the photograph of a view.
            </p>
            <p>
              We hold permits, manage vehicles and guides, and stay reachable throughout your trip.
              When something changes on the ground — weather, roads, a gorilla family moving — you have
              a person, not a call centre.
            </p>
          </div>
          <Button asChild variant="gold" size="lg" className="mt-8">
            <Link to="/custom-safari">Start planning with us</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 self-start">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-6">
              <p className="font-display text-4xl font-semibold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand py-16">
        <div className="container-page">
          <SectionHeading eyebrow="How we work" title="Four things we do not compromise on" />
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
