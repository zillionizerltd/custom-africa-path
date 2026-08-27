import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/Section";
import { company } from "@/data/site";
import heroImage from "@/assets/dest-congo.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Berakah Tours & Travel — Kigali, Rwanda" },
      {
        name: "description",
        content:
          "Talk to a Berakah travel consultant by phone, email or WhatsApp, or send an enquiry about a safari in Rwanda, Uganda, Kenya, Tanzania or Congo.",
      },
      { property: "og:title", content: "Contact Berakah Tours & Travel" },
      { property: "og:description", content: "Reach a travel consultant in Kigali." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a travel consultant"
        description="We reply to every enquiry within one working day, usually much sooner."
        image={heroImage}
      />
      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr]">
        <form
          className="rounded-xl border border-border bg-card p-6 md:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            e.currentTarget.reset();
            toast.success("Message sent", { description: "A consultant will be in touch shortly." });
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-name">Full name *</Label>
              <Input id="c-name" required className="mt-2" />
            </div>
            <div>
              <Label htmlFor="c-email">Email *</Label>
              <Input id="c-email" type="email" required className="mt-2" />
            </div>
            <div>
              <Label htmlFor="c-phone">Phone / WhatsApp</Label>
              <Input id="c-phone" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="c-subject">Subject</Label>
              <Input id="c-subject" className="mt-2" />
            </div>
          </div>
          <div className="mt-5">
            <Label htmlFor="c-message">Message *</Label>
            <Textarea id="c-message" required rows={6} className="mt-2" />
          </div>
          <Button type="submit" variant="gold" size="lg" className="mt-6">
            Send message
          </Button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg">Berakah Tours &amp; Travel</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" /> {company.address}
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                  {company.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                <a href={`mailto:${company.email}`} className="hover:text-primary">
                  {company.email}
                </a>
              </li>
              <li className="flex gap-3">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-accent" />
                <a
                  href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary"
                >
                  WhatsApp us
                </a>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg">Office hours</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Monday – Saturday, 08:00 – 18:00 (CAT). Urgent in-trip support is available 24/7 for
              travelling guests.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
