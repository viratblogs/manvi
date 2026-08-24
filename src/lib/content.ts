/** Static site copy. Blog posts come from Firestore; everything here is version-controlled. */

export const profile = {
  name: "Manvi Gurjar",
  title: "MBA — Hospital & Healthcare Management",
  role: "Healthcare Strategy & Operations",
  statement: "Bridging healthcare excellence, strategic leadership, and data-driven decision making.",
  email: "manvigurjar46@gmail.com",
  linkedin: "https://www.linkedin.com/in/manvi-gurjar-73a476207/",
  location: "Pune, Maharashtra, India",
  intro:
    "I am an MBA candidate in Hospital & Healthcare Management focused on healthcare operations, digital transformation, market research, and strategic leadership. My work centres on helping organisations create measurable value through operational excellence and patient-centred innovation.",
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export const snapshot = [
  {
    index: "01",
    label: "Education",
    heading: "MBA — Hospital & Healthcare Management",
    lines: ["Symbiosis International University", "2025 – 2027"],
  },
  {
    index: "02",
    label: "Focus",
    heading: "Healthcare Strategy & Operations",
    lines: ["Consulting", "Digital health"],
  },
  {
    index: "03",
    label: "Research",
    heading: "10+ academic and industry projects",
    lines: ["Market research", "Operational analysis"],
  },
  {
    index: "04",
    label: "Leadership",
    heading: "Cross-functional team leadership",
    lines: ["Student leadership", "Consulting exposure"],
  },
];

export const values = [
  {
    index: "01",
    title: "Operational excellence",
    body: "Mapping how work actually moves through a hospital — then removing the steps that cost time without adding care.",
  },
  {
    index: "02",
    title: "Strategic leadership",
    body: "Turning operational data into decisions leadership can defend, fund, and measure against a baseline.",
  },
  {
    index: "03",
    title: "Healthcare innovation",
    body: "Applying digital systems where they shorten the distance between a clinical need and the response to it.",
  },
];

export const timeline = [
  {
    period: "2021 – 2023",
    title: "Bachelor of Arts",
    org: "Jai Narain Vyas University, Jodhpur",
    body: "Built the analytical and research foundation — qualitative methods, structured writing, and the habit of interrogating a source before citing it.",
  },
  // {
  //   period: "2023 – 2025",
  //   title: "Market research & healthcare consulting exposure",
  //   org: "Independent and project-based work",
  //   body: "Competitive landscape studies, primary interviews with clinical and administrative staff, and feasibility analysis for healthcare service lines.",
  // },
  {
    period: "2025 – 2027",
    title: "MBA — Hospital & Healthcare Management",
    org: "Symbiosis International University, Pune",
    body: "Specialising in hospital operations, healthcare quality systems, health informatics, and strategy. Ten-plus applied projects across operations, analytics, and market entry.",
  },
];

export const competencies = [
  { group: "Strategy", items: ["Strategic planning", "Business transformation", "Stakeholder management", "Market research"] },
  { group: "Operations", items: ["Hospital administration", "Clinical operations", "Capacity planning", "Process improvement"] },
  { group: "Analytics", items: ["Healthcare analytics", "KPI management", "Performance dashboards", "Feasibility modelling"] },
  { group: "Technology", items: ["EHR systems", "Digital health", "Health informatics", "Workflow automation"] },
  { group: "Quality & risk", items: ["NABH standards", "Quality management", "Risk management", "Clinical audit"] },
  { group: "Change", items: ["Organisational change", "Training design", "Adoption strategy", "Transformation roadmaps"] },
];

export interface CaseStudy {
  slug: string;
  index: string;
  title: string;
  summary: string;
  context: string;
  situation: string;
  task: string;
  action: string[];
  results: { value: string; label: string; note: string }[];
  takeaways: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "ehr-implementation",
    index: "01",
    title: "Digital health transformation and EHR implementation",
    summary:
      "A 300-bed multi-speciality hospital ran on paper records and a registration desk that queued past the entrance. The problem was framed as software. It was a workflow problem.",
    context: "300-bed multi-speciality hospital · 9-month engagement",
    situation:
      "Patient registration averaged 14 minutes per visit, with duplicate records created at a rate of roughly one in nine. Clinical notes lived in physical files that took an average of 22 minutes to retrieve from medical records. Discharge summaries were dictated, typed, and corrected across three handoffs. Leadership had already bought an EHR licence and had twice postponed go-live after departmental resistance.",
    task:
      "Diagnose why two go-live attempts had failed, redesign the underlying registration and documentation workflows before touching the software, and deliver a phased implementation the clinical staff would actually adopt.",
    action: [
      "Ran time-and-motion studies across registration, OPD consultation, and discharge to establish a measured baseline rather than an assumed one.",
      "Mapped the current-state workflow with the people who performed it — front desk, nursing, medical records — and identified 11 steps that existed only to compensate for paper.",
      "Redesigned registration around a single-entry patient master index, eliminating the duplicate-record failure mode at its source instead of deduplicating afterwards.",
      "Phased the rollout by department in order of adoption readiness, so early wins were visible before the sceptical departments were asked to change.",
      "Built a super-user network — two trained staff per department — so day-to-day questions never had to escalate to IT.",
      "Defined a dashboard of six operational KPIs reviewed weekly by leadership, making the change measurable rather than anecdotal.",
    ],
    results: [
      { value: "32%", label: "Registration time", note: "14 min to 9.5 min average" },
      { value: "28%", label: "Documentation efficiency", note: "Clinician time on notes" },
      { value: "18%", label: "Bed turnover", note: "Faster discharge cycle" },
      { value: "19%", label: "Patient satisfaction", note: "Post-implementation survey" },
    ],
    takeaways: [
      "Digitising a broken workflow produces a faster broken workflow. The process redesign has to precede the software configuration.",
      "Adoption failure is usually a sequencing failure. Departments asked to go first should be the ones most likely to succeed.",
      "A measured baseline is the only thing that turns a change programme into a defensible result.",
    ],
  },
  {
    slug: "operational-restructuring",
    index: "02",
    title: "Hospital operational restructuring",
    summary:
      "Overtime spend was rising while staff reported being idle at predictable hours. The rota was built around headcount, not demand.",
    context: "180-bed secondary care hospital · 6-month engagement",
    situation:
      "Operating costs had grown 21% year on year with flat admissions. Nursing overtime accounted for a disproportionate share. Simultaneously, the emergency department reported understaffing during evening peaks while the day shift carried excess capacity. Supply consumption varied widely between comparable wards with no clinical explanation.",
    task:
      "Identify where cost was being generated without corresponding output, rebalance staffing against actual demand curves, and standardise supply consumption without compromising clinical judgement.",
    action: [
      "Built hourly demand curves by department from 18 months of admission, triage, and procedure data.",
      "Rebuilt the nursing rota against those curves rather than fixed equal shifts, moving capacity into the 4pm–10pm peak.",
      "Standardised high-variance consumables through a clinician-led review, keeping exception pathways open so standardisation never overrode clinical need.",
      "Consolidated three overlapping administrative functions into a shared services desk with defined turnaround commitments.",
      "Introduced a monthly operating review with department heads owning their own cost and productivity lines.",
    ],
    results: [
      { value: "17%", label: "Operating cost", note: "Reduction against baseline" },
      { value: "41%", label: "Overtime spend", note: "Nursing overtime reduction" },
      { value: "23%", label: "Staff productivity", note: "Patients handled per FTE" },
      { value: "12%", label: "Supply variance", note: "Narrowed across wards" },
    ],
    takeaways: [
      "Cost problems are usually scheduling problems wearing a disguise. Match capacity to the demand curve before cutting headcount.",
      "Standardisation only survives if clinicians design it and retain an exception route.",
      "Devolving the cost line to department heads changes behaviour faster than a central mandate.",
    ],
  },
  {
    slug: "market-entry-analysis",
    index: "03",
    title: "Healthcare market entry analysis",
    summary:
      "A diagnostics chain wanted to enter a tier-two city on the strength of population size alone. The catchment was already saturated at the price point they had modelled.",
    context: "Diagnostics chain · Tier-two market feasibility",
    situation:
      "The client planned three new diagnostic centres based on a market sizing that used district population and national per-capita diagnostics spend. No primary research had been done. Competitive presence was assumed from a web search. The investment committee wanted a decision in ten weeks.",
    task:
      "Test the market sizing against ground reality, map actual competitive density and price positioning, and give the committee a defensible go / no-go with a recommended entry model.",
    action: [
      "Rebuilt the market sizing bottom-up from catchment-level footfall, referral patterns, and realistic test-mix assumptions rather than top-down per-capita spend.",
      "Conducted primary interviews with referring physicians, who turned out to be the actual demand gatekeepers, not walk-in patients.",
      "Mapped 34 competing centres by location, test menu, turnaround time, and published pricing to establish real competitive density.",
      "Modelled three entry scenarios — full-service flagship, hub-and-spoke collection network, and partnership with existing nursing homes — against capital requirement and breakeven horizon.",
      "Stress-tested each scenario against a price war and a delayed-ramp downside case.",
    ],
    results: [
      { value: "3", label: "Scenarios modelled", note: "With downside stress tests" },
      { value: "34", label: "Competitors mapped", note: "Price and turnaround benchmarked" },
      { value: "58%", label: "Sizing correction", note: "Below original top-down estimate" },
      { value: "22", label: "Months to breakeven", note: "Recommended hub-and-spoke model" },
    ],
    takeaways: [
      "Top-down market sizing is a hypothesis, not a number. It has to be rebuilt bottom-up before capital is committed.",
      "Identify who actually controls demand. In diagnostics it is the referring physician, not the patient.",
      "A recommendation is only useful if it survives its own downside case.",
    ],
  },
];

export const categories = [
  "Healthcare Strategy",
  "Hospital Operations",
  "Digital Health",
  "Healthcare Analytics",
  "Quality & Compliance",
  "Market Research",
];
