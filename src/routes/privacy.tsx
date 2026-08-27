import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/site/Section";

const sections = [
  {
    title: "What we collect",
    body: "Name, contact details, nationality, passport details where required for permits, travel preferences and payment records. We collect this only to plan, quote and operate your trip.",
  },
  {
    title: "How we use it",
    body: "To prepare quotations, purchase permits, book accommodation and transport, communicate with you before and during travel, and meet legal and tax obligations in Rwanda.",
  },
  {
    title: "Who we share it with",
    body: "National park authorities for permits, lodges and airlines for reservations, and payment processors. We never sell personal data.",
  },
  {
    title: "How long we keep it",
    body: "Booking and payment records are retained for seven years as required by Rwandan tax law. Marketing contact details are kept until you unsubscribe.",
  },
  {
    title: "Your rights",
    body: "You may request a copy of your data, ask for corrections, or ask us to delete data we are not legally required to keep. Email info@berakahtours.com and we will respond within 30 days.",
  },
  {
    title: "Cookies",
    body: "We use essential cookies to run the website and anonymous analytics to understand which pages are useful. No advertising trackers are used.",
  },
];

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Berakah Tours & Travel" },
      {
        name: "description",
        content:
          "How Berakah Tours & Travel collects, uses, shares and retains traveller personal data, and how to exercise your data rights.",
      },
      { property: "og:title", content: "Privacy Policy — Berakah Tours & Travel" },
      { property: "og:description", content: "How we handle traveller data." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="Last updated August 2026." />
      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl">{s.title}</h2>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
