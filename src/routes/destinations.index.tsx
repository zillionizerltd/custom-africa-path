import { createFileRoute } from "@tanstack/react-router";

import { DestinationCard } from "@/components/site/Cards";
import { PageHero } from "@/components/site/Section";
import { destinations } from "@/data/site";
import heroImage from "@/assets/dest-kenya.jpg";

export const Route = createFileRoute("/destinations/")({
  head: () => ({
    meta: [
      { title: "African Safari Destinations — Berakah Tours & Travel" },
      {
        name: "description",
        content:
          "Explore Rwanda, Uganda, Kenya, Tanzania, Congo and Zanzibar — best time to visit, activities, attractions and lodges for each destination.",
      },
      { property: "og:title", content: "African Safari Destinations — Berakah Tours & Travel" },
      {
        property: "og:description",
        content: "Six East and Central African destinations we know trail by trail.",
      },
      { property: "og:url", content: "/destinations" },
    ],
    links: [{ rel: "canonical", href: "/destinations" }],
  }),
  component: DestinationsPage,
});

function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Where do you want to go?"
        description="Each destination below is reusable across our safari packages — mix two or three into a single journey."
        image={heroImage}
      />
      <section className="container-page py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </div>
      </section>
    </>
  );
}
