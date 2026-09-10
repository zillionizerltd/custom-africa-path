import { Minus, Plus } from "lucide-react";

export function Stepper({
  id,
  label,
  value,
  min = 0,
  max = 99,
  onChange,
}: {
  id: string;
  /** Plural noun used for the button labels, e.g. "travellers". */
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));
  const buttonClass =
    "flex w-10 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex h-10 overflow-hidden rounded-md border border-input bg-background shadow-xs focus-within:ring-1 focus-within:ring-ring">
      <button
        type="button"
        aria-label={`Fewer ${label}`}
        className={buttonClass}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus className="size-4" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onChange(clamp(next));
        }}
        className="w-full min-w-0 border-x border-input bg-transparent text-center text-sm font-medium tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={`More ${label}`}
        className={buttonClass}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
