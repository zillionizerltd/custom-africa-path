import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { company } from "@/data/site";
import logoMark from "@/assets/logo-mark.png.asset.json";
import logoWordmark from "@/assets/logo-wordmark.png.asset.json";

const nav = [
  { to: "/destinations", label: "Destinations" },
  { to: "/safaris", label: "Safaris" },
  { to: "/activities", label: "Activities" },
  { to: "/blog", label: "Travel Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-18 items-center justify-between gap-6 py-3">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src={logoMark.url} alt="" width={40} height={40} className="h-9 w-9 object-contain" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight">Berakah</span>
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Tours &amp; Travel
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${company.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Phone className="size-4" />
            {company.phone}
          </a>
          <Button asChild variant="gold">
            <Link to="/custom-safari">Plan My Safari</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm font-medium last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="gold" className="mt-4">
              <Link to="/custom-safari" onClick={() => setOpen(false)}>
                Plan My Safari
              </Link>
            </Button>
            <img
              src={logoWordmark.url}
              alt=""
              width={200}
              height={60}
              loading="lazy"
              className="mt-5 h-8 w-auto self-start object-contain opacity-70"
            />
          </nav>
        </div>
      ) : null}
    </header>
  );
}
