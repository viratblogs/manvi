# Manvi Gurjar — Healthcare Executive Portfolio

Next.js 15 · TypeScript · Tailwind · Firebase · Framer Motion

A premium portfolio and thought-leadership site with a Firebase-backed admin CMS.

---

## ⚠️ Read this first: the leaked service account

The service account JSON shared during this project's setup — key ID
`214bbb457a02c22350df98ba70e3229c656f9ad6` on
`firebase-adminsdk-fbsvc@manvi-s-portfolio.iam.gserviceaccount.com` — must be
treated as public. It grants unrestricted admin access to Firestore, Storage, and
Auth, bypassing every security rule.

**Revoke it now:**

1. [Google Cloud Console → IAM → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Select project `manvi-s-portfolio` → `firebase-adminsdk-fbsvc` → **Keys**
3. Delete key `214bbb457a02c22350df98ba70e3229c656f9ad6`

This project **does not use the Admin SDK at all**. It runs entirely on the client
SDK, with `firestore.rules` and `storage.rules` as the security boundary. You do
not need a service account key for anything here.

---

## Setup

### 1. Install

```bash
npm install
cp .env.local.example .env.local
```

### 2. Get your Firebase web config

Firebase Console → Project settings → Your apps → Web app. Copy those six values
into `.env.local`.

These keys are public by design — they ship in the browser bundle. Your security
comes from the rules files, not from hiding them.

### 3. Create the admin user

Firebase Console → Authentication → Sign-in method → enable **Email/Password**.
Then Users → Add user. Create exactly one account.

Copy its **UID** into two places:

- `NEXT_PUBLIC_ADMIN_UID` in `.env.local` (controls the UI redirect)
- `PASTE_ADMIN_UID_HERE` in both `firestore.rules` and `storage.rules` (the real gate)

### 4. Publish the rules

The app is not secure until you do this. Easiest route is the Console — no CLI needed:

Firestore Database → **Rules** tab → paste the contents of `firestore.rules` →
**Publish**. Make sure you replaced `PASTE_ADMIN_UID_HERE` with your real UID first.

You do **not** need storage rules. See the images note below.

### 5. Run

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
```

---

## Replace before launch

| File | What it needs |
|---|---|
| `public/m.png` | Professional portrait, 4:5 ratio, ~1000×1250 |
| `public/og-default.jpg` | Social share image, exactly 1200×630 |
| `public/resume.pdf` | The actual resume |
| `src/lib/content.ts` | All static copy — bio, timeline, case studies |

## Images: how they work here

This project does **not** use Cloud Storage. Since February 2026 Firebase requires a
billing account for it, so images are hosted elsewhere and only their links are
stored — in Firestore, which stays on the free Spark plan.

To add an image to a post:

1. Upload it to [Cloudinary](https://cloudinary.com) or [ImgBB](https://imgbb.com).
   Both are free and neither asks for a card.
2. Copy the direct link.
3. Paste it into the **Featured image** field, or use the editor's image button.

The **Media** page in the admin panel keeps a library of links you've saved, so you
can reuse an image across posts without hunting for it again. Deleting from that
library removes the link only — the image stays on whichever host you used.

If you later upgrade to Blaze and want real drag-and-drop uploads, the earlier
upload-based version of `src/lib/media.ts` and the media page can be restored.

**On the case study numbers:** the metrics in `src/lib/content.ts` were written to
the spec's brief and are illustrative. Before this site goes in front of a
recruiter, replace them with figures from work you actually did, or reframe the
sections as academic projects. A hiring manager who asks "tell me about the 32%"
will get a much better answer if the number is yours.

---

## Architecture

```
src/
├── app/
│   ├── page.tsx              Home — hero, snapshot, values, latest posts
│   ├── about/                Bio, journey timeline, competencies
│   ├── case-studies/         Situation → Task → Action → Results → Takeaways
│   ├── insights/             Blog index: featured, filters, search, pagination
│   ├── blog/[slug]/          Article: TOC, share, related, JSON-LD
│   ├── contact/              Zod-validated form → Firestore
│   ├── admin/                Protected CMS
│   ├── sitemap.ts            Auto-generated
│   └── robots.ts             /admin excluded
├── components/
│   ├── site/                 Nav, Footer, Reveal, SectionLabel, Metric
│   ├── home/ blog/ admin/    Feature components
├── lib/
│   ├── firebase.ts           Client SDK init (build-safe when unconfigured)
│   ├── auth.tsx              AuthProvider + friendly error messages
│   ├── blogs.ts contacts.ts media.ts
│   └── content.ts            All static site copy
└── types/
```

### Design system

The brief fixed the palette (`#0F4C81`, `#2E8B8B`, `#4CAF50`) and typography
(Playfair Display + Inter). A third face, **JetBrains Mono**, carries labels,
indices, and data.

The structural signature is the **measure rule** (`.measure` in `globals.css`): a
hairline carrying a monospace index, echoing the axis of a clinical readout. It
runs through section labels, the journey timeline, and case study metrics. Metrics
are set as oversized Playfair numerals on a hairline baseline — no cards, no
icons, no gradient tiles.

Numbered indices appear only where content is genuinely sequential (the timeline,
case study action steps). They are not used as decoration.

### Accessibility & motion

Skip link, visible keyboard focus, `aria-current` on nav, labelled icon buttons,
and `prefers-reduced-motion` respected — the `Reveal` and `Stagger` components
render static when it's set.

---

## Admin panel — `/admin`

| Screen | What it does |
|---|---|
| Dashboard | Post and enquiry counts, recent activity, quick actions |
| Blogs | Table with search, status and category filters, edit, delete |
| Editor | TipTap: H1–H6, formatting, lists, tables, quotes, code, links, images, YouTube. Drag an image in to upload it. |
| Media | Upload, preview, copy URL, delete. 10 MB cap, type-restricted. |
| Enquiries | Read, archive, delete, reply by email. Opening one marks it read. |

Reading time and slug are generated automatically; the slug stops auto-following
the title once you edit it by hand.

---

## Known limitation: blog SEO

`/blog/[slug]` renders client-side, so crawlers see the shell before the article
loads. Google executes JS and will index it, but it isn't ideal for Open Graph
previews on LinkedIn.

To fix, convert the route to a server component using the Firebase Admin SDK with
`generateStaticParams` + `generateMetadata` and ISR (`revalidate: 60`). That path
*does* need a service account — stored as a Vercel environment variable, never in
the repo. Everything else on the site is already statically prerendered.

---

## Deploy

Push to GitHub, import into Vercel, add the same `.env.local` variables in the
Vercel dashboard. Framework preset is detected automatically.

Confirm before going live:

- [ ] Old service account key revoked
- [ ] `firestore.rules` and `storage.rules` deployed with the real admin UID
- [ ] `NEXT_PUBLIC_SITE_URL` set to the production domain
- [ ] Portrait, OG image, and resume replaced
- [ ] Case study metrics verified as accurate
- [ ] Contact form submits and lands in `/admin/leads`
