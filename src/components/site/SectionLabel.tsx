/** SIGNATURE ELEMENT.
 *  A measured hairline carrying a monospace index — the page's structural spine.
 *  The index is used only where content is genuinely sequential or enumerable. */
export function SectionLabel({ index, children }: { index?: string; children: React.ReactNode }) {
  return (
    <div className="measure mb-8">
      {index && <span className="measure-index">{index}</span>}
      <span>{children}</span>
    </div>
  );
}
