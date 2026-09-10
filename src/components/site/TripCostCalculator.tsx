import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper } from "@/components/site/Stepper";
import { addOns, bookingTerms } from "@/data/site";
import type { SafariPackage } from "@/lib/content-types";
import { money, shortDate } from "@/lib/format";
import { addDays, balanceDeadline, daysBetween, todayISO } from "@/lib/trip";

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export function TripCostCalculator({ pkg }: { pkg: SafariPackage }) {
  const [travellers, setTravellers] = useState(Math.min(2, pkg.maxTravelers));
  const [start, setStart] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const today = todayISO();
  const fmt = (n: number) => money(n, pkg.currency);
  const extras = addOns.filter((a) => a.destinations.some((d) => pkg.destinationSlugs.includes(d)));
  const chosen = extras.filter((a) => picked.includes(a.id));

  const packageTotal = pkg.priceFrom * travellers;
  const extrasTotal = chosen.reduce((sum, a) => sum + a.price * travellers, 0);
  const total = packageTotal + extrasTotal;
  // Per the terms, trips starting inside the balance window are paid in full at booking.
  const payInFull = start !== "" && daysBetween(today, start) <= bookingTerms.balanceDueDays;
  const deposit = Math.round(total * bookingTerms.depositRate);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <p className="text-sm text-muted-foreground">From</p>
      <p className="font-display text-4xl font-semibold">{fmt(pkg.priceFrom)}</p>
      <p className="text-sm text-muted-foreground">per person sharing</p>

      <div className="mt-6 space-y-5 border-t border-border pt-5">
        <h2 className="text-lg">Estimate your trip</h2>
        <div className="space-y-2">
          <Label htmlFor="calc-travellers">Travellers</Label>
          <Stepper
            id="calc-travellers"
            label="travellers"
            value={travellers}
            min={1}
            max={pkg.maxTravelers}
            onChange={setTravellers}
          />
          <p className="text-xs text-muted-foreground">
            Up to {pkg.maxTravelers} per departure. Larger group? Ask us.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="calc-start">
            Start date <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="calc-start"
            type="date"
            min={today}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          {start ? (
            <p className="text-xs text-muted-foreground">
              Ends {shortDate(addDays(start, pkg.days - 1))} · {pkg.days} days
            </p>
          ) : null}
        </div>

        {extras.length ? (
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">
              Add-ons <span className="font-normal text-muted-foreground">· per person</span>
            </legend>
            {extras.map((a) => (
              <label
                key={a.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:border-accent/60 has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent/10"
              >
                <span className="flex items-center gap-2.5">
                  <Checkbox
                    checked={picked.includes(a.id)}
                    onCheckedChange={(on) =>
                      setPicked((list) =>
                        on === true ? [...list, a.id] : list.filter((id) => id !== a.id),
                      )
                    }
                  />
                  {a.label}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">+{fmt(a.price)}</span>
              </label>
            ))}
          </fieldset>
        ) : null}
      </div>

      <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm" aria-live="polite">
        <Line label={`Package · ${fmt(pkg.priceFrom)} × ${travellers}`} value={fmt(packageTotal)} />
        {chosen.length ? (
          <Line label={`Add-ons · ${chosen.length} × ${travellers}`} value={fmt(extrasTotal)} />
        ) : null}
        <div className="flex items-baseline justify-between gap-4 border-t border-dashed border-border pt-3">
          <dt className="font-semibold">Estimated total</dt>
          <dd className="font-display text-2xl font-semibold tabular-nums">{fmt(total)}</dd>
        </div>
        {payInFull ? (
          <Line label="Due in full at booking (travel within 30 days)" value={fmt(total)} />
        ) : (
          <>
            <Line
              label={`Deposit to confirm (${Math.round(bookingTerms.depositRate * 100)}%)`}
              value={fmt(deposit)}
            />
            <Line
              label={
                start
                  ? `Balance due by ${shortDate(balanceDeadline(start))}`
                  : `Balance, ${bookingTerms.balanceDueDays} days before arrival`
              }
              value={fmt(total - deposit)}
            />
          </>
        )}
      </dl>

      <div className="mt-6 space-y-3">
        <Button asChild variant="gold" size="lg" className="w-full">
          <Link
            to="/custom-safari"
            search={{
              safari: pkg.slug,
              travellers,
              start: start || undefined,
              addons: picked.length ? picked.join(",") : undefined,
            }}
          >
            Request this safari
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to="/contact" search={{ subject: `Question about ${pkg.title}` }}>
            Ask a question
          </Link>
        </Button>
      </div>

      <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Indicative, based on shared rooms
          {travellers === 1 ? "; solo travellers pay a single-room supplement" : ""}. Your
          consultant confirms the final price in a written quote.
        </span>
      </p>
    </div>
  );
}
