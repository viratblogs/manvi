import type { Blog } from "@/types";

export function StatusPill({ status }: { status: Blog["status"] }) {
  const styles: Record<Blog["status"], string> = {
    published: "bg-positive/10 text-positive",
    draft: "bg-ink/[0.06] text-ink-muted dark:bg-white/10 dark:text-white/60",
    scheduled: "bg-primary/10 text-primary",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
