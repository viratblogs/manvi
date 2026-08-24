import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { profile } from "@/lib/content";

const display = Playfair_Display({
  subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display", display: "swap",
});
const sans = Inter({
  subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://manvigurjar.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: profile.statement,
  keywords: [
    "healthcare operations", "hospital administration", "healthcare strategy",
    "digital health", "healthcare consulting", "healthcare analytics",
    "MBA hospital healthcare management", "Manvi Gurjar",
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: profile.name,
    title: `${profile.name} — ${profile.role}`,
    description: profile.statement,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: profile.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description: profile.statement,
    images: ["/og-default.jpg"],
  },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  alternates: { canonical: siteUrl },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  email: `mailto:${profile.email}`,
  url: siteUrl,
  sameAs: [profile.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "Pune", addressRegion: "Maharashtra", addressCountry: "IN" },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Symbiosis International University" },
    { "@type": "CollegeOrUniversity", name: "Jai Narain Vyas University" },
  ],
  knowsAbout: [
    "Healthcare Operations", "Hospital Administration", "Healthcare Strategy",
    "Digital Health", "Healthcare Analytics", "Market Research",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ga = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        {/* Applied before paint so the theme never flashes on load. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <AuthProvider>{children}</AuthProvider>

        {ga && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}')`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
