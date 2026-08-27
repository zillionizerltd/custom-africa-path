import destRwanda from "@/assets/dest-rwanda.jpg";
import destUganda from "@/assets/dest-uganda.jpg";
import destKenya from "@/assets/dest-kenya.jpg";
import destTanzania from "@/assets/dest-tanzania.jpg";
import destCongo from "@/assets/dest-congo.jpg";
import destZanzibar from "@/assets/dest-zanzibar.jpg";

export const company = {
  name: "Berakah Tours & Travel",
  tagline: "Discover. Customize. Book. Experience.",
  promise: "Every Safari is built around the wishes and needs of our Guests.",
  phone: "+250 788 000 000",
  whatsapp: "+250788000000",
  email: "info@berakahtours.com",
  address: "KG 9 Ave, Kigali, Rwanda",
};

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

export const destinations: Destination[] = [
  {
    slug: "rwanda",
    name: "Rwanda",
    country: "Rwanda",
    region: "East Africa",
    image: destRwanda,
    summary: "Land of a thousand hills, mountain gorillas and Africa's cleanest capital.",
    description:
      "Rwanda packs volcanoes, rainforest, savanna and lake shores into a country you can cross in a single day. It is the easiest place in Africa to combine gorilla trekking with big-game viewing, chimpanzee tracking and a genuinely world-class capital city.",
    bestTime: "June – September and December – February (dry seasons)",
    duration: "4 – 8 days",
    activities: [
      "Gorilla trekking",
      "Golden monkey trekking",
      "Chimpanzee tracking",
      "Big five game drives",
      "Canopy walk",
      "Cultural experiences",
      "Photography",
    ],
    attractions: [
      "Volcanoes National Park",
      "Akagera National Park",
      "Nyungwe Forest National Park",
      "Lake Kivu",
      "Kigali Genocide Memorial",
      "King's Palace Nyanza",
    ],
    accommodation: [
      "Bisate Lodge (Luxury+)",
      "Five Volcanoes Boutique Hotel (Mid-range)",
      "Ruzizi Tented Lodge (Mid-range)",
      "La Palme Hotel, Musanze (Budget)",
    ],
    travelInfo: [
      "Visa on arrival for most nationalities; East Africa Tourist Visa available.",
      "Gorilla permits cost USD 1,500 per person per trek and must be booked early.",
      "Yellow fever certificate required if arriving from an endemic country.",
      "Currency: Rwandan Franc (RWF). USD widely accepted for tourism services.",
    ],
    faq: [
      {
        q: "How fit do I need to be for gorilla trekking?",
        a: "Moderate fitness is enough. Treks run from one to six hours over muddy, hilly terrain. Porters are available and highly recommended.",
      },
      {
        q: "How far in advance should I book a gorilla permit?",
        a: "Three to six months ahead for high season. We hold permits on your behalf once a deposit is received.",
      },
    ],
  },
  {
    slug: "uganda",
    name: "Uganda",
    country: "Uganda",
    region: "East Africa",
    image: destUganda,
    summary: "The Pearl of Africa — gorillas, chimps, tree-climbing lions and the Nile.",
    description:
      "Uganda offers the widest range of primate experiences on the continent alongside classic savanna parks, the source of the Nile and some of Africa's most rewarding birding.",
    bestTime: "June – August and December – February",
    duration: "6 – 12 days",
    activities: [
      "Gorilla trekking",
      "Chimpanzee tracking",
      "Game drives",
      "Boat safari",
      "White water rafting",
      "Hiking",
    ],
    attractions: [
      "Bwindi Impenetrable Forest",
      "Queen Elizabeth National Park",
      "Murchison Falls",
      "Kibale Forest",
      "Jinja & the Source of the Nile",
    ],
    accommodation: [
      "Clouds Mountain Gorilla Lodge (Luxury+)",
      "Mweya Safari Lodge (Mid-range)",
      "Rwakobo Rock (Budget)",
    ],
    travelInfo: [
      "E-visa required in advance for most nationalities.",
      "Gorilla permits cost USD 800 per person.",
      "Long road transfers — consider domestic flights between parks.",
    ],
    faq: [
      {
        q: "Rwanda or Uganda for gorillas?",
        a: "Rwanda is faster and more comfortable to reach; Uganda is more affordable and pairs gorillas with chimps and savanna parks.",
      },
    ],
  },
  {
    slug: "kenya",
    name: "Kenya",
    country: "Kenya",
    region: "East Africa",
    image: destKenya,
    summary: "The original safari country — Maasai Mara, the Great Migration and Indian Ocean beaches.",
    description:
      "Kenya combines legendary big-cat viewing in the Maasai Mara with Amboseli's elephant herds beneath Kilimanjaro and a coastline made for post-safari recovery.",
    bestTime: "July – October (migration) and January – March",
    duration: "6 – 10 days",
    activities: ["Game drives", "Hot air balloon safari", "Cultural visits", "Beach", "Photography"],
    attractions: ["Maasai Mara", "Amboseli", "Lake Nakuru", "Samburu", "Diani Beach"],
    accommodation: ["Angama Mara (Luxury+)", "Mara Serena (Mid-range)", "Sentrim Camps (Budget)"],
    travelInfo: [
      "Electronic Travel Authorisation required before arrival.",
      "Mara migration river crossings peak between August and October.",
    ],
    faq: [
      {
        q: "When can I see the river crossings?",
        a: "Typically late July through October, though the migration is driven by rainfall and dates vary each year.",
      },
    ],
  },
  {
    slug: "tanzania",
    name: "Tanzania",
    country: "Tanzania",
    region: "East Africa",
    image: destTanzania,
    summary: "Serengeti plains, Ngorongoro Crater, Kilimanjaro and Zanzibar in one country.",
    description:
      "Tanzania holds the largest concentration of wildlife in Africa. The Serengeti and Ngorongoro Crater deliver year-round game viewing, while Zanzibar closes the trip on white sand.",
    bestTime: "June – October, and January – February for calving",
    duration: "7 – 14 days",
    activities: ["Game drives", "Walking safari", "Kilimanjaro trek", "Snorkelling", "Cultural tours"],
    attractions: ["Serengeti", "Ngorongoro Crater", "Tarangire", "Mount Kilimanjaro", "Zanzibar"],
    accommodation: ["Singita Sasakwa (Luxury+)", "Serengeti Serena (Mid-range)", "Mobile camps (Budget)"],
    travelInfo: [
      "Visa available online or on arrival.",
      "Internal flights strongly recommended between the northern circuit and Zanzibar.",
    ],
    faq: [
      {
        q: "Can I combine Serengeti with gorilla trekking?",
        a: "Yes. A common route is Kigali or Kilimanjaro entry, northern circuit safari, then a flight to Rwanda for gorillas.",
      },
    ],
  },
  {
    slug: "congo",
    name: "Congo",
    country: "DR Congo",
    region: "Central Africa",
    image: destCongo,
    summary: "Virunga, Nyiragongo's lava lake and lowland gorillas for the true adventurer.",
    description:
      "Africa's oldest national park offers eastern lowland gorillas and an overnight climb to the world's largest lava lake. Travel here is arranged case by case with current security guidance.",
    bestTime: "June – September and December – February",
    duration: "3 – 6 days",
    activities: ["Lowland gorilla trekking", "Volcano hiking", "Photography", "Community visits"],
    attractions: ["Virunga National Park", "Mount Nyiragongo", "Lake Kivu shoreline", "Goma"],
    accommodation: ["Mikeno Lodge (Mid-range)", "Kibumba Tented Camp (Mid-range)"],
    travelInfo: [
      "Permits and entry are arranged through the park authority.",
      "Travel is subject to current security advisories — we confirm feasibility before booking.",
    ],
    faq: [
      {
        q: "Is Congo safe to visit?",
        a: "Access changes with conditions on the ground. We only confirm Congo itineraries when the park is officially open to visitors.",
      },
    ],
  },
  {
    slug: "zanzibar",
    name: "Zanzibar",
    country: "Tanzania",
    region: "Indian Ocean",
    image: destZanzibar,
    summary: "Spice island beaches, dhow sunsets and Stone Town history to finish your safari.",
    description:
      "Zanzibar is the classic safari finale: turquoise water, reef diving, a UNESCO-listed old town and some of the best beach lodges in the region.",
    bestTime: "June – October and December – February",
    duration: "3 – 7 days",
    activities: ["Beach", "Snorkelling & diving", "Dhow cruise", "Spice tour", "Honeymoon"],
    attractions: ["Stone Town", "Nungwi", "Jozani Forest", "Mnemba Atoll", "Prison Island"],
    accommodation: ["Zuri Zanzibar (Luxury)", "Karafuu Beach Resort (Mid-range)", "Guest houses (Budget)"],
    travelInfo: [
      "Tanzania visa covers Zanzibar; separate arrival formalities apply.",
      "Modest dress is appreciated outside beach resorts.",
    ],
    faq: [
      {
        q: "How many nights should I add?",
        a: "Three to four nights is the sweet spot after a safari; a week if Zanzibar is your main destination.",
      },
    ],
  },
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

export type SafariPackage = {
  slug: string;
  title: string;
  category: (typeof categories)[number];
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
  itinerary: { day: number; title: string; details: string[] }[];
  featured?: boolean;
};

export const packages: SafariPackage[] = [
  {
    slug: "4-days-rwanda-gorilla-safari",
    title: "4 Days Rwanda Gorilla Safari",
    category: "Gorilla Trekking",
    destinationSlugs: ["rwanda"],
    days: 4,
    nights: 3,
    priceFrom: 2850,
    currency: "USD",
    image: destRwanda,
    short: "Kigali, Musanze and one unforgettable hour with a mountain gorilla family.",
    description:
      "Our signature short safari. You land in Kigali, explore the city, travel north through the terraced hills to Musanze, and spend an hour face to face with a habituated gorilla family in Volcanoes National Park.",
    highlights: [
      "One gorilla trekking permit included",
      "Kigali city and memorial tour",
      "Iby'iwacu cultural village experience",
      "Private 4x4 with English-speaking driver-guide",
    ],
    included: [
      "Gorilla permit (USD 1,500)",
      "3 nights accommodation with breakfast",
      "Private 4x4 transport and fuel",
      "Professional driver-guide",
      "Airport transfers",
      "Bottled water throughout",
    ],
    excluded: ["International flights", "Visa fees", "Travel insurance", "Tips and personal items"],
    requirements: [
      "Minimum age 15 for gorilla trekking",
      "Moderate fitness level",
      "Hiking boots, rain jacket and gloves",
    ],
    cancellation:
      "Free changes up to 60 days before travel. Gorilla permits are non-refundable once purchased; the balance is refundable at 50% within 30 days.",
    maxTravelers: 8,
    availableMonths: "Year round, best June – September",
    accommodation: "Mid-range lodge in Musanze, boutique hotel in Kigali",
    transport: "Private 4x4 Land Cruiser",
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Kigali",
        details: ["Airport pickup and welcome briefing", "Kigali city tour", "Genocide Memorial visit", "Overnight in Kigali"],
      },
      {
        day: 2,
        title: "Kigali to Musanze",
        details: ["Scenic transfer through the thousand hills", "Cultural village experience", "Trek briefing", "Overnight in Musanze"],
      },
      {
        day: 3,
        title: "Gorilla Trekking",
        details: ["Early briefing at Kinigi headquarters", "Trek to a habituated gorilla family", "One hour with the gorillas", "Afternoon at leisure"],
      },
      {
        day: 4,
        title: "Musanze to Kigali",
        details: ["Breakfast and checkout", "Craft market stop", "Airport drop-off"],
      },
    ],
  },
  {
    slug: "7-days-rwanda-uganda-primates",
    title: "7 Days Rwanda & Uganda Primate Trail",
    category: "Wildlife Safari",
    destinationSlugs: ["rwanda", "uganda"],
    days: 7,
    nights: 6,
    priceFrom: 4400,
    currency: "USD",
    image: destUganda,
    short: "Gorillas in Volcanoes, chimps in Kibale and big game in Queen Elizabeth.",
    description:
      "A cross-border journey combining two gorilla families, chimpanzee tracking and the savanna of Queen Elizabeth National Park with its famous tree-climbing lions.",
    highlights: [
      "Gorilla trekking in Rwanda",
      "Chimpanzee tracking in Kibale Forest",
      "Kazinga Channel boat safari",
      "Ishasha tree-climbing lions",
    ],
    included: [
      "Gorilla and chimpanzee permits",
      "6 nights full board on safari",
      "Private 4x4 and driver-guide",
      "Park entry fees",
      "Boat safari",
    ],
    excluded: ["International flights", "Visas", "Insurance", "Drinks and tips"],
    requirements: ["Valid East Africa visa", "Good walking fitness", "Yellow fever certificate"],
    cancellation: "Deposit non-refundable within 45 days of departure. Permits non-refundable.",
    maxTravelers: 6,
    availableMonths: "Year round",
    accommodation: "Mid-range lodges and tented camps",
    transport: "Private 4x4 Land Cruiser with pop-up roof",
    featured: true,
    itinerary: [
      { day: 1, title: "Kigali arrival", details: ["Airport pickup", "City orientation", "Overnight Kigali"] },
      { day: 2, title: "Volcanoes National Park", details: ["Transfer to Musanze", "Golden monkey trek", "Overnight Musanze"] },
      { day: 3, title: "Gorilla trekking", details: ["Trek briefing", "Gorilla encounter", "Overnight Musanze"] },
      { day: 4, title: "Cross to Uganda", details: ["Border crossing at Cyanika", "Drive to Queen Elizabeth", "Evening game drive"] },
      { day: 5, title: "Queen Elizabeth NP", details: ["Morning game drive", "Kazinga Channel boat cruise", "Ishasha sector"] },
      { day: 6, title: "Kibale Forest", details: ["Transfer to Fort Portal", "Crater lakes drive", "Overnight Kibale"] },
      { day: 7, title: "Chimps & departure", details: ["Chimpanzee tracking", "Transfer to Entebbe", "Departure"] },
    ],
  },
  {
    slug: "8-days-kenya-tanzania-migration",
    title: "8 Days Kenya & Tanzania Migration Safari",
    category: "Wildlife Safari",
    destinationSlugs: ["kenya", "tanzania"],
    days: 8,
    nights: 7,
    priceFrom: 5200,
    currency: "USD",
    image: destKenya,
    short: "Maasai Mara river crossings, Serengeti plains and the Ngorongoro Crater.",
    description:
      "Follow the Great Migration across two countries, with time in the Ngorongoro Crater — the highest density of predators anywhere in Africa.",
    highlights: ["Mara river crossings in season", "Ngorongoro Crater floor day", "Optional balloon safari", "Maasai community visit"],
    included: ["7 nights full board", "Park fees", "Game drives in 4x4", "Inter-country flight", "Driver-guide"],
    excluded: ["Balloon safari", "International flights", "Visas", "Insurance"],
    requirements: ["Valid passport with 6 months validity", "Yellow fever certificate"],
    cancellation: "Full refund minus 15% up to 60 days before travel.",
    maxTravelers: 6,
    availableMonths: "July – October best",
    accommodation: "Luxury tented camps",
    transport: "4x4 safari vehicle and one domestic flight",
    featured: true,
    itinerary: [
      { day: 1, title: "Nairobi arrival", details: ["Airport pickup", "Overnight Nairobi"] },
      { day: 2, title: "Maasai Mara", details: ["Flight to the Mara", "Afternoon game drive"] },
      { day: 3, title: "Mara full day", details: ["Full day game drive", "Migration crossing points", "Maasai village visit"] },
      { day: 4, title: "To Serengeti", details: ["Border crossing", "Northern Serengeti game drive"] },
      { day: 5, title: "Serengeti", details: ["Sunrise game drive", "Optional balloon safari"] },
      { day: 6, title: "Ngorongoro", details: ["Transfer to the crater rim", "Olduvai Gorge stop"] },
      { day: 7, title: "Crater floor", details: ["Full day crater safari", "Picnic lunch at the hippo pool"] },
      { day: 8, title: "Departure", details: ["Transfer to Kilimanjaro airport"] },
    ],
  },
  {
    slug: "3-days-kigali-city-culture",
    title: "3 Days Kigali City & Culture",
    category: "City Tour",
    destinationSlugs: ["rwanda"],
    days: 3,
    nights: 2,
    priceFrom: 640,
    currency: "USD",
    image: destRwanda,
    short: "Markets, memorials, coffee, art and the food scene of Africa's cleanest capital.",
    description:
      "A short city break built for business travellers and stopovers, covering Kigali's history, creative scene and best restaurants.",
    highlights: ["Genocide Memorial", "Kimironko market", "Coffee roastery tour", "Nyamirambo walking tour"],
    included: ["2 nights hotel with breakfast", "City transport", "Guide", "Entrance fees"],
    excluded: ["Flights", "Lunches and dinners", "Tips"],
    requirements: ["Comfortable walking shoes"],
    cancellation: "Free cancellation up to 7 days before arrival.",
    maxTravelers: 12,
    availableMonths: "Year round",
    accommodation: "Boutique hotel in Kigali",
    transport: "Air-conditioned van",
    itinerary: [
      { day: 1, title: "Arrival & city orientation", details: ["Airport pickup", "Sunset at Mount Kigali"] },
      { day: 2, title: "History & markets", details: ["Genocide Memorial", "Kimironko market", "Nyamirambo walking tour"] },
      { day: 3, title: "Coffee & departure", details: ["Coffee roastery", "Craft shopping", "Airport transfer"] },
    ],
  },
  {
    slug: "10-days-honeymoon-rwanda-zanzibar",
    title: "10 Days Rwanda & Zanzibar Honeymoon",
    category: "Honeymoon",
    destinationSlugs: ["rwanda", "zanzibar"],
    days: 10,
    nights: 9,
    priceFrom: 7900,
    currency: "USD",
    image: destZanzibar,
    short: "Gorillas, Lake Kivu and a barefoot beach finish on the spice island.",
    description:
      "Designed for couples: private guiding, romantic dining, a gorilla trek together and five nights on the Indian Ocean.",
    highlights: ["Private gorilla trek", "Lake Kivu boat sunset", "Dhow dinner cruise", "Beachfront suite"],
    included: ["9 nights luxury accommodation", "Gorilla permits", "Domestic and regional flights", "Private transfers"],
    excluded: ["International flights", "Spa treatments", "Insurance"],
    requirements: ["Minimum age 15 for trekking"],
    cancellation: "50% refundable up to 45 days before travel.",
    maxTravelers: 2,
    availableMonths: "Year round",
    accommodation: "Luxury lodges and beach resort",
    transport: "Private vehicle and flights",
    featured: true,
    itinerary: [
      { day: 1, title: "Kigali arrival", details: ["Private transfer", "Welcome dinner"] },
      { day: 2, title: "To Volcanoes", details: ["Scenic drive", "Lodge spa afternoon"] },
      { day: 3, title: "Gorilla trekking", details: ["Trek", "Celebration dinner"] },
      { day: 4, title: "Lake Kivu", details: ["Drive to Rubavu", "Sunset boat cruise"] },
      { day: 5, title: "Kivu leisure", details: ["Coffee island tour", "Beach afternoon"] },
      { day: 6, title: "Fly to Zanzibar", details: ["Kigali to Zanzibar flight", "Beach resort check-in"] },
      { day: 7, title: "Stone Town", details: ["Heritage walking tour", "Spice farm"] },
      { day: 8, title: "Ocean day", details: ["Mnemba snorkelling", "Dhow sunset dinner"] },
      { day: 9, title: "Leisure", details: ["Free day", "Couples spa"] },
      { day: 10, title: "Departure", details: ["Transfer to Zanzibar airport"] },
    ],
  },
  {
    slug: "6-days-virunga-adventure",
    title: "6 Days Virunga Volcano Adventure",
    category: "Adventure",
    destinationSlugs: ["congo", "rwanda"],
    days: 6,
    nights: 5,
    priceFrom: 3300,
    currency: "USD",
    image: destCongo,
    short: "Overnight climb to the Nyiragongo lava lake plus lowland gorillas in Virunga.",
    description:
      "A hard-earned adventure for confident hikers: an overnight summit of Nyiragongo, a night in a crater-rim shelter, and lowland gorilla trekking in Virunga National Park.",
    highlights: ["Nyiragongo lava lake summit", "Lowland gorilla trek", "Lake Kivu crossing", "Small group of six"],
    included: ["Park permits", "Porter for summit hike", "5 nights accommodation", "All transfers"],
    excluded: ["International flights", "Visas", "Hiking gear rental"],
    requirements: ["Strong fitness", "Warm summit clothing", "Minimum age 18"],
    cancellation: "Permits non-refundable. Land arrangements 50% refundable within 30 days.",
    maxTravelers: 6,
    availableMonths: "Subject to park opening",
    accommodation: "Lodges and crater-rim shelters",
    transport: "4x4 and boat transfer",
    itinerary: [
      { day: 1, title: "Kigali to Gisenyi", details: ["Drive west", "Lake Kivu evening"] },
      { day: 2, title: "Cross to Goma", details: ["Border formalities", "Virunga briefing"] },
      { day: 3, title: "Nyiragongo ascent", details: ["Six-hour climb", "Night at the crater rim"] },
      { day: 4, title: "Descent", details: ["Morning descent", "Rest at Mikeno Lodge"] },
      { day: 5, title: "Lowland gorillas", details: ["Gorilla trek", "Community project visit"] },
      { day: 6, title: "Return", details: ["Return to Kigali", "Departure"] },
    ],
  },
];

export const activities = [
  { name: "Gorilla Trekking", blurb: "One hour with a habituated family in Volcanoes, Bwindi or Virunga.", destinations: ["rwanda", "uganda", "congo"] },
  { name: "Wildlife Game Drives", blurb: "Big five viewing in Akagera, Queen Elizabeth, the Mara and Serengeti.", destinations: ["kenya", "tanzania", "uganda"] },
  { name: "Cultural Experiences", blurb: "Community villages, drumming, cooking and Maasai homesteads.", destinations: ["rwanda", "kenya"] },
  { name: "Photography Safaris", blurb: "Guided by photographers, with vehicle set-ups and light-first routing.", destinations: ["tanzania", "kenya"] },
  { name: "Hiking & Volcanoes", blurb: "Bisoke, Karisimbi and the overnight Nyiragongo lava lake climb.", destinations: ["rwanda", "congo"] },
  { name: "City Tours", blurb: "Kigali, Kampala, Nairobi and Stone Town on foot and by vehicle.", destinations: ["rwanda", "zanzibar"] },
  { name: "Beach & Island", blurb: "Zanzibar, Diani and Lake Kivu shorelines to close your journey.", destinations: ["zanzibar", "kenya"] },
  { name: "Honeymoon Escapes", blurb: "Private guiding, romantic dining and suites built for two.", destinations: ["rwanda", "zanzibar"] },
];

export const testimonials = [
  {
    name: "Sarah & Mark Whitfield",
    country: "United Kingdom",
    trip: "4 Days Rwanda Gorilla Safari",
    rating: 5,
    quote:
      "Berakah rebuilt the itinerary three times until it fit our dates and budget. The gorilla trek was the most moving hour of our lives, and our guide Eric made the whole trip effortless.",
  },
  {
    name: "Daniel Okoth",
    country: "Kenya",
    trip: "7 Days Rwanda & Uganda Primate Trail",
    rating: 5,
    quote:
      "I travel a lot for work and rarely get this level of organisation. Border crossings, permits and lodges were all handled before I even asked.",
  },
  {
    name: "Anja Müller",
    country: "Germany",
    trip: "10 Days Rwanda & Zanzibar Honeymoon",
    rating: 5,
    quote:
      "They listened. We said quiet, green and no rushing — and that is exactly the honeymoon we got. Zanzibar after the gorillas was the perfect ending.",
  },
  {
    name: "The Alvarez Family",
    country: "Spain",
    trip: "Custom 9 day family safari",
    rating: 5,
    quote:
      "Travelling with two children aged 9 and 12 is not simple. Berakah designed shorter drives, family rooms and activities the kids actually loved.",
  },
];

export const blogPosts = [
  {
    slug: "gorilla-trekking-what-to-expect",
    title: "Gorilla Trekking in Rwanda: What Actually Happens on the Day",
    category: "Gorilla Trekking",
    date: "2026-07-14",
    readMinutes: 7,
    image: destRwanda,
    excerpt: "From the 6am briefing at Kinigi to the one hour that everyone talks about afterwards.",
    body: [
      "Your day starts early. Briefing at Volcanoes National Park headquarters in Kinigi begins at 7am, and groups of eight are allocated to one of the habituated gorilla families based on fitness and preference.",
      "The trek itself can take anywhere from 45 minutes to six hours each way. Guides stay in radio contact with trackers who located the family at dawn, so the route adapts as the gorillas move.",
      "Once you reach the family, you have exactly one hour. Masks are required, a seven-metre distance is the rule, and flash photography is not allowed. The gorillas set the terms — sometimes a curious juvenile will close the distance themselves.",
      "Hire a porter. It costs a small amount, supports local families who once relied on poaching, and it changes the trek from an endurance test into an experience you can actually enjoy.",
    ],
  },
  {
    slug: "best-time-to-visit-east-africa",
    title: "The Best Time to Visit East Africa, Month by Month",
    category: "Travel Tips",
    date: "2026-06-02",
    readMinutes: 9,
    image: destTanzania,
    excerpt: "Dry seasons, migration timing, shoulder-season value and when the rains actually help you.",
    body: [
      "East Africa has two dry seasons and two wet seasons, and the sweet spot depends far more on what you want to see than on the calendar.",
      "June to September is peak season everywhere: dry trails for gorilla trekking, thinning vegetation for game viewing and the migration reaching the Mara.",
      "The long rains in April and May bring the lowest prices of the year. Trails are muddy, but forests are spectacular, birding peaks and you may have a gorilla family entirely to yourself.",
      "January and February are quietly excellent — dry, green and timed with the Serengeti calving season in the southern plains.",
    ],
  },
  {
    slug: "rwanda-visa-and-entry-requirements",
    title: "Rwanda Visa & Entry Requirements for Travellers",
    category: "Visa & Requirements",
    date: "2026-05-11",
    readMinutes: 5,
    image: destRwanda,
    excerpt: "Visa on arrival, the East Africa Tourist Visa, yellow fever rules and what to carry.",
    body: [
      "Most nationalities receive a 30-day visa on arrival at Kigali International Airport. There is no need to apply in advance, though the online Irembo portal is available if you prefer.",
      "If your trip covers Rwanda, Uganda and Kenya, the East Africa Tourist Visa is better value and allows multiple entries across all three countries for 90 days.",
      "A yellow fever certificate is required only if you are arriving from a country where the disease is endemic. Carry a printed copy.",
      "Bring your passport with at least six months validity, printed permits, and a card that works internationally — Rwanda is largely cashless in cities.",
    ],
  },
  {
    slug: "packing-list-for-safari",
    title: "The Only Safari Packing List You Need",
    category: "Travel Tips",
    date: "2026-04-20",
    readMinutes: 6,
    image: destKenya,
    excerpt: "Neutral layers, gaiters, a spare battery and the three things travellers always forget.",
    body: [
      "Pack neutral colours: khaki, olive, grey and brown. Avoid blue and black, which attract tsetse flies, and bright white, which shows every metre of dust.",
      "For gorilla trekking, add waterproof boots, gardening gloves for grabbing stinging vegetation, gaiters and a rain jacket. Rainforest weather ignores the forecast.",
      "Camera-wise, a 100-400mm lens covers most game viewing. Bring twice as many batteries and memory cards as you think you need — charging in camps is limited.",
      "The three most forgotten items: a soft duffel bag (hard cases don't fit light aircraft), a headtorch, and a printed copy of your travel insurance.",
    ],
  },
];

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

export function getDestination(slug: string) {
  return destinations.find((d) => d.slug === slug);
}

export function getPackage(slug: string) {
  return packages.find((p) => p.slug === slug);
}

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
