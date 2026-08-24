/** Oversized Playfair numeral sitting on a hairline baseline — a clinical readout,
 *  not a dashboard tile. Deliberately has no card, no icon, no background fill. */
export function Metric({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="group">
      <div className="metric-value">{value}</div>
      <div className="metric-rule transition-colors duration-300 group-hover:bg-primary/40" />
      <div className="mt-4">
        <div className="text-sm font-medium text-ink dark:text-white">{label}</div>
        {note && <div className="mt-1 text-sm text-ink-muted">{note}</div>}
      </div>
    </div>
  );
}
