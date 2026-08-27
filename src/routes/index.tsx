import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Compass,
  HeartHandshake,
  MessageSquareQuote,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DestinationCard, PackageCard, TestimonialCard } from "@/components/site/Cards";
import { SectionHeading } from "@/components/site/Section";
import { activities, blogPosts, destinations, packages, testimonials } from "@/data/site";
import heroImage from "@/assets/hero-gorilla.jpg";
import ctaImage from "@/assets/cta-safari.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Berakah Tours & Travel — Your Safari, Your Way" },
      {
        name: "description",
        content:
          "Tailor-made gorilla trekking, wildlife and cultural safaris in Rwanda, Uganda, Kenya, Tanzania and Congo. Build your own itinerary or book a curated package.",
      },
      { property: "og:title", content: "Berakah Tours & Travel — Your Safari, Your Way" },
      {
        property: "og:description",
        content: "Every safari is built around your wishes, interests, budget and travel style.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const steps = [
  { icon: Compass, title: "Tell us your wishes", text: "Share dates, interests, group size and budget in the safari builder." },
  { icon: MessageSquareQuote, title: "We design & quote", text: "A consultant builds a day-by-day itinerary with a transparent cost breakdown." },
  { icon: CalendarCheck, title: "Refine and confirm", text: "Adjust lodges, pace or activities until it is right, then pay a deposit." },
  { icon: Sparkles, title: "Travel with us", text: "Permits, guides, vehicles and lodges handled — you just show up." },
];

const reasons = [
  { icon: BadgeCheck, title: "Licensed Rwandan operator", text: "RDB-registered, working with the national park authorities in five countries." },
  { icon: ShieldCheck, title: "Permits secured first", text: "We hold gorilla permits the day your deposit lands — no last-minute surprises." },
  { icon: HeartHandshake, title: "Local guides, local benefit", text: "Our driver-guides and porters are hired from communities around the parks." },
  { icon: Sparkles, title: "Nothing off the shelf", text: "Every itinerary is written for one group. Fixed packages are only a starting point." },
];

function HomePage() {
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("all");
  const featured = packages.filter((p) => p.featured);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate">
        <img
          src={heroImage}
          alt="Silverback mountain gorilla in Volcanoes National Park, Rwanda"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="image-overlay absolute inset-0 -z-10" />
        <div className="container-page flex min-h-[38rem] flex-col justify-end py-20 md:min-h-[44rem]">
          <p className="eyebrow text-accent">Rwanda · Uganda · Kenya · Tanzania · Congo</p>
          <h1 className="mt-4 max-w-3xl text-5xl text-ink-foreground md:text-7xl">Your Safari. Your Way.</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-foreground/80">
            Every safari is built around your wishes, interests, budget and travel style.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/safaris">Explore Safaris</Link>
            </Button>
            <Button asChild variant="onInk" size="xl">
              <Link to="/custom-safari">Plan My Safari</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="container-page -mt-10 relative z-10">
        <form
          className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-soft md:grid-cols-[1fr_14rem_auto]"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search safaris, e.g. gorilla trekking"
              aria-label="Search safaris"
              className="h-11 pl-9"
            />
          </div>
          <Select value={destination} onValueChange={setDestination}>
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
          <Button asChild variant="gold" size="lg" className="h-11">
            <Link
              to="/safaris"
              search={
                {
                  ...(query ? { q: query } : {}),
                  ...(destination !== "all" ? { destination } : {}),
                } as { q?: string | undefined; destination?: string | undefined }
              }
            >

              Search safaris
            </Link>
          </Button>
        </form>
      </section>

      {/* Destinations */}
      <section className="container-page py-20">
        <SectionHeading
          eyebrow="Popular destinations"
          title="Where do you want to go?"
          description="Six regions we know street by street and trail by trail."
          action={
            <Button asChild variant="ghost">
              <Link to="/destinations">
                All destinations <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </div>
      </section>

      {/* Featured packages */}
      <section className="bg-sand py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Featured safaris"
            title="Curated journeys, ready to personalise"
            description="Start from one of these and we will reshape it around your dates, pace and budget."
            action={
              <Button asChild variant="ghost">
                <Link to="/safaris">
                  All safaris <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <PackageCard key={p.slug} pkg={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Berakah */}
      <section className="container-page py-20">
        <SectionHeading eyebrow="Why choose Berakah" title="Built around you, not around a brochure" align="center" />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div key={r.title}>
              <div className="flex size-11 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
                <r.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="surface-ink py-20">
        <div className="container-page">
          <SectionHeading
            onInk
            eyebrow="How it works"
            title="From first idea to first game drive"
            align="center"
          />
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="font-display text-4xl font-semibold text-accent/40">0{i + 1}</span>
                <div className="mt-3 flex items-center gap-2 text-accent">
                  <s.icon className="size-5" />
                </div>
                <h3 className="mt-2 text-lg text-ink-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-foreground/70">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Custom safari CTA */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={ctaImage}
            alt="Safari vehicle on a savanna track at sunrise"
            width={1600}
            height={900}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="image-overlay absolute inset-0" />
          <div className="relative max-w-2xl p-8 pt-40 md:p-14 md:pt-56">
            <p className="eyebrow text-accent">Custom safari</p>
            <h2 className="mt-3 text-3xl text-ink-foreground md:text-4xl">
              Tell us how you want to travel. We&apos;ll build the safari around you.
            </h2>
            <p className="mt-4 text-ink-foreground/80">
              Nine quick questions — dates, interests, group, budget, lodges and anything special. A
              consultant replies with a full itinerary and costed quote within 24 hours.
            </p>
            <Button asChild variant="hero" size="xl" className="mt-7">
              <Link to="/custom-safari">
                Plan My Safari <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="bg-sand py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Popular activities"
            title="What do you want to experience?"
            action={
              <Button asChild variant="ghost">
                <Link to="/activities">
                  All activities <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activities.slice(0, 8).map((a) => (
              <Link
                key={a.name}
                to="/activities"
                className="card-lift rounded-xl border border-border bg-card p-5 hover:card-lift-hover"
              >
                <h3 className="text-base font-semibold">{a.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-20">
        <SectionHeading
          eyebrow="Guest stories"
          title="What our travellers say"
          action={
            <Button asChild variant="ghost">
              <Link to="/testimonials">
                Read all <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} testimonial={t} />
          ))}
        </div>
      </section>

      {/* Blog */}
      <section className="container-page pb-20">
        <SectionHeading
          eyebrow="Travel blog"
          title="Plan smarter before you fly"
          action={
            <Button asChild variant="ghost">
              <Link to="/blog">
                All articles <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {blogPosts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="card-lift group overflow-hidden rounded-xl border border-border bg-card hover:card-lift-hover"
            >
              <img
                src={post.image}
                alt={post.title}
                width={1024}
                height={768}
                loading="lazy"
                className="aspect-16/9 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="p-5">
                <p className="eyebrow">{post.category}</p>
                <h3 className="mt-2 text-lg leading-snug">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
