export type Destination = {
  slug: string;
  name: string;
  country: string;
  region: string;
  image: string;
  summary: string;
  description: string;
  bestTime: string;
  duration: string;
  activities: string[];
  attractions: string[];
  accommodation: string[];
  travelInfo: string[];
  faq: { q: string; a: string }[];
};

export type ItineraryDay = { day: number; title: string; details: string[] };

export type SafariPackage = {
  slug: string;
  title: string;
  category: string;
  destinationSlugs: string[];
  days: number;
  nights: number;
  priceFrom: number;
  currency: string;
  image: string;
  short: string;
  description: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  requirements: string[];
  cancellation: string;
  maxTravelers: number;
  availableMonths: string;
  accommodation: string;
  transport: string;
  itinerary: ItineraryDay[];
  featured: boolean;
};

export type ActivityItem = { name: string; blurb: string; destinations: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readMinutes: number;
  image: string;
  excerpt: string;
  body: string[];
};

export type Testimonial = {
  name: string;
  country: string;
  trip: string;
  rating: number;
  quote: string;
};
