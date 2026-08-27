import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { TestimonialCard } from "@/components/site/Cards";
import { PageHero } from "@/components/site/Section";
import { testimonials } from "@/data/site";
import heroImage from "@/assets/dest-zanzibar.jpg";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Guest Reviews & Testimonials — Berakah Tours & Travel" },
      {
        name: "description",
        content:
          "Read what travellers say about their gorilla treks, migration safaris and honeymoons arranged by Berakah Tours & Travel.",
      },
      { property: "og:title", content: "Guest Reviews & Testimonials — Berakah Tours" },
      { property: "og:description", content: "Stories from travellers who let us build the trip." },
      { property: "og:url", content: "/testimonials" },
    ],
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Guest stories"
        title="What our travellers say"
        description="Every review below comes from a completed trip. Reviews open once you return home."
        image={heroImage}
      />
      <section className="container-page py-16">
        <div className="grid gap-5 md:grid-cols-2">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} testimonial={t} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">Travelled with us? We would love to hear about it.</p>
          <Button asChild variant="gold" className="mt-4">
            <Link to="/contact">Share your story</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
