export const company = {
  name: "Berakah Tours & Travel",
  tagline: "Discover. Customize. Book. Experience.",
  promise: "Every Safari is built around the wishes and needs of our Guests.",
  phone: "+250 788 000 000",
  whatsapp: "+250788000000",
  email: "iberakahtoursandtravels@gmail.com",
  address: "KG 9 Ave, Kigali, Rwanda",
  officeHours: "Monday – Saturday, 08:00 – 18:00 (CAT)",
};

/** Single source for the deposit/balance rules stated in the Terms & FAQ. */
export const bookingTerms = {
  depositRate: 0.3,
  balanceDueDays: 30,
};

export const atAGlance = [
  { value: "12", label: "Years running" },
  { value: "5", label: "Countries covered" },
  { value: "1,200+", label: "Guests hosted" },
  { value: "98%", label: "Would travel again" },
];

export const quickFacts = [
  { label: "Head office", value: "Kigali, Rwanda" },
  { label: "Countries", value: "Rwanda, Uganda, Kenya, Tanzania, DR Congo" },
  { label: "Consultants", value: "Rwandan and Ugandan, based on the ground" },
  { label: "Licensing", value: "RDB-registered tour operator" },
  { label: "Itineraries", value: "Private and written by hand for each group" },
  { label: "Booking", value: "30% deposit, balance 30 days before arrival" },
  { label: "In-trip support", value: "A named person, reachable 24/7" },
];

/**
 * Optional extras offered in the public cost calculator. Prices are per person and indicative;
 * the consultant confirms final figures in the written quote.
 */
export const addOns = [
  {
    id: "golden-monkey",
    label: "Golden monkey trek, Volcanoes NP",
    price: 100,
    destinations: ["rwanda"],
  },
  { id: "bisoke", label: "Mount Bisoke crater-lake hike", price: 75, destinations: ["rwanda"] },
  { id: "dian-fossey", label: "Dian Fossey tomb hike", price: 75, destinations: ["rwanda"] },
  {
    id: "balloon",
    label: "Dawn hot-air balloon safari",
    price: 550,
    destinations: ["kenya", "tanzania"],
  },
];

/** B = breakfast, L = lunch, D = dinner. */
export const mealPlans = ["B", "B/L", "B/D", "B/L/D", "All inclusive", "None"];

export const quoteCategories = [
  "Package",
  "Accommodation",
  "Transport",
  "Guide",
  "Park fees & permits",
  "Activities",
  "Meals",
  "Flights",
  "Other",
];

export const paymentMethods = ["Bank transfer", "Card", "Mobile money", "Cash", "Other"];

export const destinationLinks = [
  { slug: "rwanda", name: "Rwanda" },
  { slug: "uganda", name: "Uganda" },
  { slug: "kenya", name: "Kenya" },
  { slug: "tanzania", name: "Tanzania" },
  { slug: "congo", name: "Congo" },
  { slug: "zanzibar", name: "Zanzibar" },
];

export const categories = [
  "Gorilla Trekking",
  "Wildlife Safari",
  "City Tour",
  "Cultural Tour",
  "Adventure",
  "Honeymoon",
  "Photography",
  "Road Trip",
  "Beach & Island",
] as const;

export const budgetRanges = ["$500 – $1,000", "$1,000 – $2,000", "$2,000 – $5,000", "$5,000+"];
export const accommodationLevels = ["Budget", "Mid-range", "Luxury", "Luxury+"];
export const transportOptions = [
  "Private vehicle",
  "Shared vehicle",
  "Airport transfer",
  "Domestic flight",
];
export const interestOptions = [
  "Wildlife",
  "Gorilla trekking",
  "Culture",
  "Adventure",
  "Photography",
  "Hiking",
  "Honeymoon",
  "Relaxation",
  "Food",
  "History",
];

export function formatPrice(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
