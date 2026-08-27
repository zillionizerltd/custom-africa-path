import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  onInk = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
  onInk?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className={cn("eyebrow", onInk && "text-accent")}>{eyebrow}</p>
        ) : null}
        <h2 className={cn("mt-3 text-3xl md:text-4xl", onInk && "text-ink-foreground")}>{title}</h2>
        {description ? (
          <p className={cn("mt-3 text-base leading-relaxed text-muted-foreground", onInk && "text-ink-foreground/70")}>
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="surface-ink relative overflow-hidden">
      {image ? (
        <>
          <img
            src={image}
            alt=""
            width={1600}
            height={900}
            className="absolute inset-0 size-full object-cover opacity-35"
          />
          <div className="image-overlay absolute inset-0" />
        </>
      ) : null}
      <div className="container-page relative py-20 md:py-28">
        {eyebrow ? <p className="eyebrow text-accent">{eyebrow}</p> : null}
        <h1 className="mt-4 max-w-3xl text-4xl text-ink-foreground md:text-6xl">{title}</h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-foreground/75">{description}</p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
