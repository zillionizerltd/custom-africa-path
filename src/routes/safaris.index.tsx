import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackageCard } from "@/components/site/Cards";
import { PageHero } from "@/components/site/Section";
import { categories, destinations, packages } from "@/data/site";
import heroImage from "@/assets/dest-tanzania.jpg";

type SafariSearch = {
  q?: string | undefined;
  destination?: string | undefined;
  category?: string | undefined;
};

export const Route = createFileRoute("/safaris/")({
  validateSearch: (search: Record<string, unknown>): SafariSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    destination: typeof search["destination"] === "string" ? search["destination"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Safari Packages & Tours — Berakah Tours & Travel" },
      {
        name: "description",
        content:
          "Browse gorilla trekking, wildlife, honeymoon, city and adventure safari packages across East and Central Africa, with day-by-day itineraries and clear pricing.",
      },
      { property: "og:title", content: "Safari Packages & Tours — Berakah Tours & Travel" },
      { property: "og:description", content: "Curated safaris you can personalise to your dates and budget." },
      { property: "og:url", content: "/safaris" },
    ],
    links: [{ rel: "canonical", href: "/safaris" }],
  }),
  component: SafarisPage,
});

function SafarisPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/safaris" });

  const setSearch = (next: Partial<SafariSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...next }) });

  const q = (search.q ?? "").toLowerCase();
  const results = packages.filter((p) => {
    const matchQ =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.short.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchDest = !search.destination || p.destinationSlugs.includes(search.destination);
    const matchCat = !search.category || p.category === search.category;
    return matchQ && matchDest && matchCat;
  });

  return (
    <>
      <PageHero
        eyebrow="Safari packages"
        title="Curated safaris, endlessly adjustable"
        description="Every package below is a starting point. Change the pace, lodges, dates or destinations and we will requote."
        image={heroImage}
      />

      <section className="container-page py-12">
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1fr_13rem_13rem_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search.q ?? ""}
              onChange={(e) => setSearch({ q: e.target.value || undefined })}
              placeholder="Search safaris"
              aria-label="Search safaris"
              className="h-11 pl-9"
            />
          </div>
          <Select
            value={search.destination ?? "all"}
            onValueChange={(v) => setSearch({ destination: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="h-11" aria-label="Destination">
              <SelectValue placeholder="Any destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any destination</SelectItem>
              {destinations.map((d) => (
                <SelectItem key={d.slug} value={d.slug}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={search.category ?? "all"}
            onValueChange={(v) => setSearch({ category: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="h-11" aria-label="Category">
              <SelectValue placeholder="Any category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any category</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            className="h-11"
            onClick={() => navigate({ search: {} })}
          >
            Reset
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "safari" : "safaris"} available
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <PackageCard key={p.slug} pkg={p} />
          ))}
        </div>

        {results.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-12 text-center">
            <h2 className="text-xl">No package matches that yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              That is exactly what the safari builder is for — tell us what you want instead.
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}
