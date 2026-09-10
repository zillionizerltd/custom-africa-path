import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LayoutGrid, Rows3, Search } from "lucide-react";

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
import { categories, formatPrice } from "@/data/site";
import type { SafariPackage } from "@/lib/content-types";
import { siteContentQueryOptions } from "@/lib/content-query";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/dest-tanzania.jpg";

const sortOptions = [
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "days-asc", label: "Shortest first" },
  { value: "days-desc", label: "Longest first" },
] as const;

type SortKey = (typeof sortOptions)[number]["value"];

const sorters: Record<SortKey, (a: SafariPackage, b: SafariPackage) => number> = {
  "price-asc": (a, b) => a.priceFrom - b.priceFrom,
  "price-desc": (a, b) => b.priceFrom - a.priceFrom,
  "days-asc": (a, b) => a.days - b.days,
  "days-desc": (a, b) => b.days - a.days,
};

type SafariSearch = {
  q?: string | undefined;
  destination?: string | undefined;
  category?: string | undefined;
  sort?: SortKey | undefined;
  view?: "table" | undefined;
};

export const Route = createFileRoute("/safaris/")({
  validateSearch: (search: Record<string, unknown>): SafariSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    destination: typeof search["destination"] === "string" ? search["destination"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    sort: sortOptions.find((o) => o.value === search["sort"])?.value,
    view: search["view"] === "table" ? "table" : undefined,
  }),

  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQueryOptions),

  head: () => ({
    meta: [
      { title: "Safari Packages & Tours — Berakah Tours & Travel" },
      {
        name: "description",
        content:
          "Browse gorilla trekking, wildlife, honeymoon, city and adventure safari packages across East and Central Africa, with day-by-day itineraries and clear pricing.",
      },
      { property: "og:title", content: "Safari Packages & Tours — Berakah Tours & Travel" },
      {
        property: "og:description",
        content: "Curated safaris you can personalise to your dates and budget.",
      },
      { property: "og:url", content: "/safaris" },
    ],
    links: [{ rel: "canonical", href: "/safaris" }],
  }),
  component: SafarisPage,
  errorComponent: () => (
    <div className="container-page py-20 text-center text-muted-foreground">
      Something went wrong loading safaris. Please try again.
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-20 text-center text-muted-foreground">Page not found.</div>
  ),
});

function summarise(list: string[], max = 3) {
  const shown = list.slice(0, max).join(" · ");
  return list.length > max ? `${shown} +${list.length - max} more` : shown;
}

function SafarisPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/safaris/" });
  const { data } = useSuspenseQuery(siteContentQueryOptions);
  const { destinations, packages } = data;

  // Filters replace the history entry and keep the scroll position, so typing doesn't
  // jump the page to the top or fill the back button with one entry per keystroke.
  const setSearch = (next: SafariSearch) =>
    navigate({ search: { ...search, ...next }, replace: true, resetScroll: false });
  const clearFilters = () =>
    navigate({ search: { view: search.view }, replace: true, resetScroll: false });

  const q = (search.q ?? "").toLowerCase();
  const filtered = packages.filter((p) => {
    const matchQ =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.short.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchDest = !search.destination || p.destinationSlugs.includes(search.destination);
    const matchCat = !search.category || p.category === search.category;
    return matchQ && matchDest && matchCat;
  });
  const results = search.sort ? [...filtered].sort(sorters[search.sort]) : filtered;
  const asTable = search.view === "table";
  const countryNames = (p: SafariPackage) =>
    p.destinationSlugs.map((s) => destinations.find((d) => d.slug === s)?.name ?? s).join(", ");

  return (
    <>
      <PageHero
        eyebrow="Safari packages"
        title="Curated safaris, endlessly adjustable"
        description="Every package below is a starting point. Change the pace, lodges, dates or destinations and we will requote."
        image={heroImage}
      />

      <section className="container-page py-12">
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_11rem_11rem_12rem_auto]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
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
          <Select
            value={search.sort ?? "recommended"}
            onValueChange={(v) =>
              setSearch({ sort: sortOptions.find((o) => o.value === v)?.value })
            }
          >
            <SelectTrigger className="h-11" aria-label="Sort by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              {sortOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" className="h-11" onClick={clearFilters}>
            Reset
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {results.length} {results.length === 1 ? "safari" : "safaris"} available
          </p>
          <div
            role="group"
            aria-label="Layout"
            className="flex rounded-lg border border-border bg-card p-0.5"
          >
            {(
              [
                { view: undefined, icon: LayoutGrid, label: "Card view" },
                { view: "table", icon: Rows3, label: "Compare in a table" },
              ] as const
            ).map((option) => {
              const active = search.view === option.view;
              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={active}
                  aria-label={option.label}
                  title={option.label}
                  onClick={() => setSearch({ view: option.view })}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
                    active && "bg-secondary text-foreground",
                  )}
                >
                  <option.icon className="size-4" />
                </button>
              );
            })}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center">
            <h2 className="text-xl">No package matches that yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              That is exactly what the safari builder is for — tell us what you want instead.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="gold">
                <Link to="/custom-safari">Plan My Safari</Link>
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          </div>
        ) : asTable ? (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-240 text-left text-sm">
              <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Safari
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Days
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Countries
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    From / person
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Includes
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Not included
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((p) => (
                  <tr key={p.slug} className="border-t border-border align-top even:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        to="/safaris/$slug"
                        params={{ slug: p.slug }}
                        className="font-semibold hover:text-primary hover:underline"
                      >
                        {p.title}
                      </Link>
                      <span className="block text-xs text-muted-foreground">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{p.days}</td>
                    <td className="px-4 py-3">{countryNames(p)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatPrice(p.priceFrom, p.currency)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{summarise(p.included)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{summarise(p.excluded)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <PackageCard key={p.slug} pkg={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
