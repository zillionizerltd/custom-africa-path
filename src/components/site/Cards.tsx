import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/data/site";
import type { Destination, SafariPackage } from "@/lib/content-types";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      to="/destinations/$slug"
      params={{ slug: destination.slug }}
      className="card-lift group relative block overflow-hidden rounded-xl hover:card-lift-hover"
    >
      <img
        src={destination.image}
        alt={`${destination.name} landscape`}
        width={1024}
        height={768}
        loading="lazy"
        className="aspect-4/5 w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="image-overlay absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent">
          {destination.region}
        </p>
        <h3 className="mt-1.5 text-xl text-ink-foreground">{destination.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-foreground/75">{destination.summary}</p>
      </div>
    </Link>
  );
}

export function PackageCard({ pkg }: { pkg: SafariPackage }) {
  return (
    <article className="card-lift group flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:card-lift-hover">
      <Link to="/safaris/$slug" params={{ slug: pkg.slug }} className="relative block overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.title}
          width={1024}
          height={768}
          loading="lazy"
          className="aspect-16/10 w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground hover:bg-accent">
          {pkg.category}
        </Badge>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" /> {pkg.days} days / {pkg.nights} nights
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" /> max {pkg.maxTravelers}
          </span>
        </div>
        <h3 className="mt-2.5 text-xl leading-snug">
          <Link to="/safaris/$slug" params={{ slug: pkg.slug }} className="hover:text-primary">
            {pkg.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{pkg.short}</p>
        <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-display text-2xl font-semibold">{formatPrice(pkg.priceFrom, pkg.currency)}</p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
          <Link
            to="/safaris/$slug"
            params={{ slug: pkg.slug }}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            View itinerary
          </Link>
        </div>
      </div>
    </article>
  );
}

export function TestimonialCard({
  testimonial,
}: {
  testimonial: { name: string; country: string; trip: string; rating: number; quote: string };
}) {
  return (
    <figure className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
      <div className="flex gap-0.5 text-accent">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="size-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-foreground/85">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-5 border-t border-border pt-4">
        <p className="font-semibold">{testimonial.name}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3" /> {testimonial.country} · {testimonial.trip}
        </p>
      </figcaption>
    </figure>
  );
}
