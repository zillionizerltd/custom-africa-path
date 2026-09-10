import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { company, destinationLinks } from "@/data/site";
import { leadPrefix, makeReference } from "@/lib/reference";
import { supabase } from "@/integrations/supabase/client";
// White-and-gold artwork, made for the navy footer.
import logoWordmarkLight from "@/assets/logo-wordmark-light.png";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  // Sign-ups are stored as leads (NL- reference) and listed separately in the admin Requests page.
  const subscribe = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("safari_requests").insert({
        reference: makeReference(leadPrefix.newsletter),
        full_name: "Newsletter subscriber",
        email: email.trim(),
        notes: "Subscribed to Travel Notes from the website footer.",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setJoined(true);
      setEmail("");
      toast.success("You're on the list", {
        description: "Travel Notes arrives no more than once a month.",
      });
    },
    onError: () => toast.error("We couldn't add you just now. Please try again."),
  });

  if (joined) {
    return (
      <p className="mt-5 rounded-lg border border-ink-foreground/20 bg-ink-foreground/5 p-4 text-sm text-ink-foreground/85">
        Thanks — you&apos;re subscribed. The next Travel Notes will land in your inbox.
      </p>
    );
  }

  return (
    <form
      className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        subscribe.mutate();
      }}
    >
      <Input
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border-ink-foreground/25 bg-ink-foreground/5 text-ink-foreground placeholder:text-ink-foreground/45"
      />
      <Button type="submit" variant="gold" disabled={subscribe.isPending}>
        {subscribe.isPending ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="surface-ink mt-24">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="inline-block">
            <img
              src={logoWordmarkLight}
              alt={company.name}
              width={1000}
              height={302}
              loading="lazy"
              className="h-14 w-auto"
            />
          </Link>
          <p className="mt-5 max-w-xs text-sm text-ink-foreground/70">{company.promise}</p>
          <div className="mt-6 space-y-2.5 text-sm text-ink-foreground/80">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-accent" /> {company.address}
            </p>
            <a
              href={`tel:${company.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 hover:text-accent"
            >
              <Phone className="size-4 text-accent" /> {company.phone}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="flex items-center gap-2 hover:text-accent"
            >
              <Mail className="size-4 text-accent" /> {company.email}
            </a>
            <a
              href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-accent"
            >
              <MessageCircle className="size-4 text-accent" /> Chat on WhatsApp
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Destinations
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm text-ink-foreground/75">
            {destinationLinks.map((d) => (
              <li key={d.slug}>
                <Link
                  to="/destinations/$slug"
                  params={{ slug: d.slug }}
                  className="hover:text-accent"
                >
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Company</h3>
          <ul className="mt-5 space-y-2.5 text-sm text-ink-foreground/75">
            <li>
              <Link to="/safaris" className="hover:text-accent">
                Safari Packages
              </Link>
            </li>
            <li>
              <Link to="/custom-safari" className="hover:text-accent">
                Custom Safari
              </Link>
            </li>
            <li>
              <Link to="/activities" className="hover:text-accent">
                Activities
              </Link>
            </li>
            <li>
              <Link to="/testimonials" className="hover:text-accent">
                Testimonials
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-accent">
                Travel Blog
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-accent">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-accent">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-accent">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Travel Notes
          </h3>
          <p className="mt-5 text-sm text-ink-foreground/70">
            Seasonal advice, permit availability and new itineraries. No more than once a month.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-ink-foreground/12">
        <div className="container-page flex flex-col justify-between gap-2 py-6 text-xs text-ink-foreground/55 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <p>{company.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
