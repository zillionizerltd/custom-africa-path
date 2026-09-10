import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Phone, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { company } from "@/data/site";
import { useAuth, homeForRoles } from "@/hooks/useAuth";
import logoMark from "@/assets/logo-mark.png";

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
  const { user, roles } = useAuth();
  const accountTo = user ? homeForRoles(roles) : "/auth";
  const accountLabel = user ? "My account" : "Sign in";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-18 items-center justify-between gap-6 py-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logoMark} alt="" width={44} height={44} className="size-11 object-contain" />
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
              className="relative py-1 text-sm font-medium text-foreground/70 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:scale-x-100"
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
          {/* <Button asChild variant="outline">
            <Link to={accountTo}>
              <User className="size-4" />
              {accountLabel}
            </Link>
          </Button> */}
          <Button asChild variant="gold">
            <Link to="/custom-safari">Plan My Safari</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-mr-2 rounded-md p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm font-medium last:border-0 data-[status=active]:text-primary data-[status=active]:font-semibold"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={accountTo}
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3 text-sm font-medium"
            >
              {accountLabel}
            </Link>
            <Button asChild variant="gold" className="mt-4">
              <Link to="/custom-safari" onClick={() => setOpen(false)}>
                Plan My Safari
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
