export const company = {
  name: "Berakah Tours & Travel",
  tagline: "Discover. Customize. Book. Experience.",
  promise: "Every Safari is built around the wishes and needs of our Guests.",
  phone: "+250 788 000 000",
  whatsapp: "+250788000000",
  email: "info@berakahtours.com",
  address: "KG 9 Ave, Kigali, Rwanda",
};

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
export const transportOptions = ["Private vehicle", "Shared vehicle", "Airport transfer", "Domestic flight"];
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
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
