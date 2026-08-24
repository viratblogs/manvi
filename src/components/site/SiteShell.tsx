import { Footer } from "./Footer";
import { Nav } from "./Nav";
import { ScrollProgress } from "./ScrollProgress";

/** Wraps every public page. /admin deliberately does not use this. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main id="main" className="pt-[72px]">{children}</main>
      <Footer />
    </>
  );
}
