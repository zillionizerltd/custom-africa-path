import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/site/Section";

const sections = [
  {
    title: "1. Booking and confirmation",
    body: "A booking is confirmed once a signed itinerary and a 30% deposit are received. The balance is due 30 days before arrival. Bookings made within 30 days of arrival require full payment.",
  },
  {
    title: "2. Permits",
    body: "Gorilla and chimpanzee permits are purchased on your behalf and are non-refundable and non-transferable once issued, in line with national park authority rules.",
  },
  {
    title: "3. Cancellation",
    body: "Cancellations more than 60 days before arrival are refunded in full less permit costs and a 15% administration fee. Between 60 and 30 days, 50% is refundable. Within 30 days, no refund is available.",
  },
  {
    title: "4. Changes by Berakah",
    body: "We may alter an itinerary where weather, security, park closures or supplier failure make it necessary. We will always offer an equivalent alternative or a refund of the affected portion.",
  },
  {
    title: "5. Travel insurance",
    body: "Comprehensive travel insurance including medical evacuation is a condition of travel. Berakah Tours & Travel is not liable for costs recoverable under a traveller's insurance policy.",
  },
  {
    title: "6. Health and fitness",
    body: "Travellers must declare medical conditions that may affect participation. Trekking activities require moderate fitness and are undertaken at the traveller's own risk.",
  },
  {
    title: "7. Liability",
    body: "We act as an agent for accommodation, transport and activity suppliers and accept no liability for loss or injury caused by third parties beyond our reasonable control.",
  },
  {
    title: "8. Governing law",
    body: "These terms are governed by the laws of the Republic of Rwanda.",
  },
];

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Berakah Tours & Travel" },
      {
        name: "description",
        content:
          "Booking, payment, permit, cancellation and liability terms for safaris arranged by Berakah Tours & Travel.",
      },
      { property: "og:title", content: "Terms & Conditions — Berakah Tours & Travel" },
      { property: "og:description", content: "Our booking and cancellation terms." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms & Conditions" description="Last updated August 2026." />
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
