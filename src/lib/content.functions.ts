import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { resolveImage } from "@/data/images";
import type {
  ActivityItem,
  BlogPost,
  Destination,
  ItineraryDay,
  SafariPackage,
  Testimonial,
} from "@/lib/content-types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

type DestinationRow = Database["public"]["Tables"]["destinations"]["Row"];
type PackageRow = Database["public"]["Tables"]["packages"]["Row"];
type BlogRow = Database["public"]["Tables"]["blog_posts"]["Row"];

function mapDestination(row: DestinationRow): Destination {
  return {
    slug: row.slug,
    name: row.name,
    country: row.country,
    region: row.region,
    image: resolveImage(row.image_key),
    summary: row.summary,
    description: row.description,
    bestTime: row.best_time,
    duration: row.duration,
    activities: row.activities,
    attractions: row.attractions,
    accommodation: row.accommodation,
    travelInfo: row.travel_info,
    faq: (row.faq as { q: string; a: string }[] | null) ?? [],
  };
}

function mapPackage(row: PackageRow): SafariPackage {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    destinationSlugs: row.destination_slugs,
    days: row.days,
    nights: row.nights,
    priceFrom: Number(row.price_from),
    currency: row.currency,
    image: resolveImage(row.image_key),
    short: row.short,
    description: row.description,
    highlights: row.highlights,
    included: row.included,
    excluded: row.excluded,
    requirements: row.requirements,
    cancellation: row.cancellation,
    maxTravelers: row.max_travelers,
    availableMonths: row.available_months,
    accommodation: row.accommodation,
    transport: row.transport,
    itinerary: (row.itinerary as ItineraryDay[] | null) ?? [],
    featured: row.featured,
  };
}

function mapPost(row: BlogRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    date: row.post_date,
    readMinutes: row.read_minutes,
    image: resolveImage(row.image_key),
    excerpt: row.excerpt,
    body: row.body,
  };
}

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [destinations, packages, activities, posts, testimonials] = await Promise.all([
    supabase.from("destinations").select("*").eq("published", true).order("sort_order"),
    supabase.from("packages").select("*").eq("published", true).order("sort_order"),
    supabase.from("activities").select("*").eq("published", true).order("sort_order"),
    supabase.from("blog_posts").select("*").eq("published", true).order("post_date", { ascending: false }),
    supabase.from("testimonials").select("*").eq("published", true).order("sort_order"),
  ]);

  return {
    destinations: (destinations.data ?? []).map(mapDestination),
    packages: (packages.data ?? []).map(mapPackage),
    activities: (activities.data ?? []).map(
      (a): ActivityItem => ({ name: a.name, blurb: a.blurb, destinations: a.destination_slugs }),
    ),
    posts: (posts.data ?? []).map(mapPost),
    testimonials: (testimonials.data ?? []).map(
      (t): Testimonial => ({
        name: t.name,
        country: t.country,
        trip: t.trip,
        rating: t.rating,
        quote: t.quote,
      }),
    ),
  };
});
