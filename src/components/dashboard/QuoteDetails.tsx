import type { ReactNode } from "react";

import { bookingTerms } from "@/data/site";
import { dayLabel, money, shortDate } from "@/lib/format";
import {
  countryNames,
  lineAmount,
  lineQuantity,
  quoteEndDate,
  quoteSubtotal,
  quoteTotal,
  type QuoteDetails,
  type QuoteLine,
} from "@/lib/quote";
import { addDays } from "@/lib/trip";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium text-foreground">{children}</dd>
    </div>
  );
}

function basisText(line: QuoteLine, travelers: number, currency: string) {
  const unit = money(line.unitPrice, currency);
  if (line.basis === "person")
    return `${unit} × ${travelers} traveller${travelers === 1 ? "" : "s"}`;
  return line.quantity > 1 ? `${unit} × ${lineQuantity(line, travelers)}` : "Per group";
}

/** Read-only itinerary and cost breakdown, shared by the admin quote list and the customer dashboard. */
export function QuoteDetailsView({
  details,
  currency,
}: {
  details: QuoteDetails;
  currency: string;
}) {
  const subtotal = quoteSubtotal(details);
  const total = quoteTotal(details);
  const end = quoteEndDate(details);
  const deposit = Math.round(total * bookingTerms.depositRate);
  const fmt = (n: number) => money(n, currency);

  return (
    <div className="space-y-6">
      <dl className="grid gap-4 rounded-xl bg-muted/60 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Consultant">{details.consultant || "Berakah team"}</Fact>
        <Fact label="Travel dates">
          {details.startDate
            ? `${shortDate(details.startDate)} → ${shortDate(end)}`
            : "To be confirmed"}
        </Fact>
        <Fact label="Travellers">{details.travelers}</Fact>
        <Fact label="Countries">{countryNames(details.countries) || "—"}</Fact>
      </dl>

      {details.days.length ? (
        <section>
          <h3 className="font-sans text-base font-semibold tracking-normal">
            Day by day · {details.days.length} {details.days.length === 1 ? "day" : "days"}
          </h3>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-2xl text-left text-sm">
              <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {["Day", "Date", "Location", "Activity", "Accommodation", "Meals"].map((h) => (
                    <th key={h} scope="col" className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {details.days.map((day, i) => (
                  <tr key={i} className="border-t border-border align-top even:bg-muted/30">
                    <td className="px-3 py-2.5 font-semibold tabular-nums">{i + 1}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {details.startDate ? dayLabel(addDays(details.startDate, i)) : "—"}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{day.location || "—"}</td>
                    <td className="px-3 py-2.5">
                      {day.activity || "—"}
                      {day.notes ? (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {day.notes}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">{day.accommodation || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{day.meals || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Meals: B = breakfast, L = lunch, D = dinner.
          </p>
        </section>
      ) : null}

      {details.lines.length ? (
        <section>
          <h3 className="font-sans text-base font-semibold tracking-normal">Cost breakdown</h3>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {details.lines.map((line, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="py-2 pr-3">
                    <span className="font-medium">{line.label || line.category}</span>
                    <span className="block text-xs text-muted-foreground">
                      {line.label ? `${line.category} · ` : ""}
                      {basisText(line, details.travelers, currency)}
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {fmt(lineAmount(line, details.travelers))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-sm">
              {details.discount > 0 ? (
                <>
                  <tr>
                    <td className="pt-3 text-muted-foreground">Subtotal</td>
                    <td className="pt-3 text-right tabular-nums">{fmt(subtotal)}</td>
                  </tr>
                  <tr>
                    <td className="pt-1 text-muted-foreground">Discount</td>
                    <td className="pt-1 text-right tabular-nums">−{fmt(details.discount)}</td>
                  </tr>
                </>
              ) : null}
              <tr>
                <td className="pt-3 font-semibold">Total</td>
                <td className="pt-3 text-right font-display text-xl font-semibold tabular-nums">
                  {fmt(total)}
                </td>
              </tr>
              <tr>
                <td className="pt-1 text-muted-foreground">Per person</td>
                <td className="pt-1 text-right tabular-nums text-muted-foreground">
                  {fmt(total / details.travelers)}
                </td>
              </tr>
              <tr>
                <td className="pt-1 text-muted-foreground">
                  Deposit to confirm ({Math.round(bookingTerms.depositRate * 100)}%)
                </td>
                <td className="pt-1 text-right tabular-nums text-muted-foreground">
                  {fmt(deposit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
      ) : null}
    </div>
  );
}
