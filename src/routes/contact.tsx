import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/Section";
import { company } from "@/data/site";
import { leadPrefix, makeReference } from "@/lib/reference";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/dest-congo.jpg";

type ContactSearch = { subject?: string | undefined };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    subject: typeof search["subject"] === "string" ? search["subject"].slice(0, 140) : undefined,
  }),
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

const empty = { name: "", email: "", phone: "", subject: "", message: "" };

function ContactPage() {
  const search = Route.useSearch();
  const [form, setForm] = useState({ ...empty, subject: search.subject ?? "" });
  const [sentTo, setSentTo] = useState<string | null>(null);

  const set = (key: keyof typeof empty) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Enquiries are stored as leads so they appear in the admin Requests inbox.
  const send = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const subject = form.subject.trim();
      const message = form.message.trim();
      const { error } = await supabase.from("safari_requests").insert({
        reference: makeReference(leadPrefix.enquiry),
        user_id: auth.user?.id ?? null,
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        notes: subject ? `${subject}\n\n${message}` : message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSentTo(form.email.trim());
      setForm(empty);
      toast.success("Message sent", { description: "A consultant will be in touch shortly." });
    },
    onError: () =>
      toast.error("We couldn't send your message", {
        description: `Please try again, or email ${company.email} directly.`,
      }),
  });

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a travel consultant"
        description="We reply to every enquiry within one working day, usually much sooner."
        image={heroImage}
      />
      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr]">
        {sentTo ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center md:p-12">
            <CheckCircle2 className="mx-auto size-10 text-accent" />
            <h2 className="mt-4 text-2xl">Thank you — message received</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              A consultant will reply to{" "}
              <span className="font-medium text-foreground">{sentTo}</span> within one working day.
              For anything urgent, call or WhatsApp us.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => setSentTo(null)}>
              Send another message
            </Button>
          </div>
        ) : (
          <form
            className="rounded-xl border border-border bg-card p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              send.mutate();
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-name">Full name *</Label>
                <Input
                  id="c-name"
                  name="name"
                  placeholder="First and last name"
                  autoComplete="name"
                  required
                  className="mt-2"
                  value={form.name}
                  onChange={set("name")}
                />
              </div>
              <div>
                <Label htmlFor="c-email">Email *</Label>
                <Input
                  id="c-email"
                  name="email"
                  placeholder="Email address"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2"
                  value={form.email}
                  onChange={set("email")}
                />
              </div>
              <div>
                <Label htmlFor="c-phone">Phone / WhatsApp</Label>
                <Input
                  id="c-phone"
                  name="phone"
                  placeholder="Phone number"
                  type="tel"
                  autoComplete="tel"
                  className="mt-2"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </div>
              <div>
                <Label htmlFor="c-subject">Subject</Label>
                <Input
                  id="c-subject"
                  placeholder="Subject"
                  name="subject"
                  className="mt-2"
                  value={form.subject}
                  onChange={set("subject")}
                />
              </div>
            </div>
            <div className="mt-5">
              <Label htmlFor="c-message">Message *</Label>
              <Textarea
                id="c-message"
                name="message"
                required
                rows={6}
                className="mt-2"
                placeholder="Dates, group size, the parks you have in mind  anything that helps us answer well."
                value={form.message}
                onChange={set("message")}
              />
            </div>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="mt-6"
              disabled={send.isPending}
            >
              {send.isPending ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}

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
            <h2 className="flex items-center gap-2 text-lg">
              <Clock className="size-4 text-accent" /> Office hours
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {company.officeHours}. Urgent in-trip support is available 24/7 for travelling guests.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
