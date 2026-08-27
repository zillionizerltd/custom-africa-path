import { createFileRoute } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHero } from "@/components/site/Section";
import heroImage from "@/assets/dest-tanzania.jpg";

const faqs = [
  {
    q: "How do I book a safari?",
    a: "Choose a package or use the safari builder. We send a day-by-day itinerary and quote, and once you accept, a 30% deposit confirms permits and lodges. The balance is due 30 days before arrival.",
  },
  {
    q: "How much does gorilla trekking cost?",
    a: "Permits are USD 1,500 per person in Rwanda, USD 800 in Uganda and USD 450 in Congo. Our packages state clearly whether the permit is included.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Card payments, mobile money, bank transfer and manual payment arrangements. Deposits and balance payments can be made separately.",
  },
  {
    q: "Can I change my dates after booking?",
    a: "Yes, subject to permit and lodge availability. Gorilla permits can usually be moved once free of charge more than 60 days before the trek date.",
  },
  {
    q: "Is travel insurance required?",
    a: "It is not legally required but we insist on it. Cover should include medical evacuation and trip cancellation.",
  },
  {
    q: "Do you cater for families and children?",
    a: "Yes. The minimum age for gorilla trekking is 15, but we design family itineraries with shorter drives, family rooms and age-appropriate activities.",
  },
  {
    q: "What vaccinations do I need?",
    a: "A yellow fever certificate is required if arriving from an endemic country. Malaria prophylaxis is recommended for savanna areas. Consult your doctor six weeks before travel.",
  },
  {
    q: "Do you arrange flights?",
    a: "We arrange regional and domestic flights. International flights are usually booked by the traveller, and we advise on routing and timing.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Safari FAQ — Booking, Permits & Payments | Berakah Tours" },
      {
        name: "description",
        content:
          "Answers on booking, gorilla permit costs, payments, date changes, insurance, vaccinations and travelling with children in East Africa.",
      },
      { property: "og:title", content: "Safari FAQ — Berakah Tours & Travel" },
      { property: "og:description", content: "Booking, permits, payments and practicalities answered." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions travellers ask us most"
        description="Still unsure about something? Message us and a consultant will answer directly."
        image={heroImage}
      />
      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible>
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
