import Link from 'next/link';

// ── Browser chrome wrapper ────────────────────────────────────────────────────
function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 shadow-sm">
      <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-100 px-2.5 py-1.5">
        <div className="flex flex-shrink-0 gap-1">
          <div className="h-2 w-2 rounded-full bg-red-400" />
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 truncate rounded border border-stone-200 bg-white px-2 py-0.5 text-[8px] text-stone-400">
          {url}
        </div>
      </div>
      <div className="h-44 overflow-hidden">{children}</div>
    </div>
  );
}

// ── Miller's Plumbing — BEFORE: Google Maps listing, no website ───────────────
function PlumberBefore() {
  return (
    <BrowserFrame url="google.com/maps › miller's plumbing austin">
      <div className="h-full bg-white p-3 text-[8px]">
        <div className="mb-2 flex items-start gap-2">
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold leading-tight text-stone-900">Miller's Plumbing Co.</div>
            <div className="text-[7px] text-stone-500">Plumber · Austin, TX</div>
          </div>
        </div>
        <div className="mb-2 text-amber-500">
          ★★★★☆ <span className="text-stone-500">6 reviews</span>
        </div>
        <div className="space-y-1.5 border-t border-stone-100 pt-2">
          <div className="flex items-center gap-1.5 text-stone-400">
            <span>🌐</span>
            <span className="italic">No website listed</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <span>📞</span>
            <span>(512) 555-0103</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600">
            <span>👍</span>
            <span>facebook.com/millersplumbingco</span>
          </div>
          <div className="mt-2 rounded bg-stone-100 px-2 py-1 text-center text-[7px] text-stone-400">
            Directions &nbsp;·&nbsp; Save &nbsp;·&nbsp; Share
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ── Miller's Plumbing — AFTER: Modern plumbing site ──────────────────────────
function PlumberAfter() {
  return (
    <BrowserFrame url="millersplumbing.com">
      <div className="flex h-full flex-col justify-between bg-slate-800 p-3">
        <div>
          <div className="mb-1 text-[7px] uppercase tracking-widest text-slate-400">Austin, TX · Licensed & Insured</div>
          <div className="mb-1 text-[14px] font-bold leading-tight text-white">
            Fast & Reliable<br />Plumbing Service
          </div>
          <div className="mb-3 text-[8px] text-amber-400">★★★★★ 51 Reviews on Google</div>
          <div className="flex gap-1.5">
            <div className="rounded bg-amber-500 px-2.5 py-1 text-[8px] font-semibold text-white">📞 Call Now</div>
            <div className="rounded border border-slate-500 px-2.5 py-1 text-[8px] text-slate-300">Get a Quote</div>
          </div>
        </div>
        <div className="text-[7px] text-slate-500">Available 24/7 · No extra charge for weekends</div>
      </div>
    </BrowserFrame>
  );
}

// ── Green Leaf — BEFORE: Outdated 2013 website ────────────────────────────────
function LandscapingBefore() {
  return (
    <BrowserFrame url="greenleaflandscaping.webs.com">
      <div className="h-full overflow-hidden bg-white text-[8px]">
        <div className="border-b-4 border-yellow-400 bg-green-700 px-2 py-2 text-center">
          <div className="text-[11px] font-bold text-yellow-300">🍃 GREEN LEAF LANDSCAPING 🍃</div>
          <div className="text-[7px] text-yellow-200">Denver Colorado — Serving the Community Since 2008!</div>
        </div>
        <div className="p-2">
          <div className="mb-1 cursor-pointer text-[9px] font-bold text-blue-700 underline">
            ➤ CLICK HERE FOR OUR SERVICES!!!
          </div>
          <div className="mb-2 text-[7px] text-stone-600">
            Hours: Mon–Fri 8am to 5pm<br />
            Phone: (303) 555-0177 — Call Us!
          </div>
          <div className="rounded border border-stone-300 bg-stone-100 p-2 text-center">
            <div className="mb-0.5 text-[18px]">🖼️</div>
            <div className="text-[6px] text-stone-400">Image loading... please wait</div>
            <div className="text-[6px] text-stone-400">Best viewed in Internet Explorer 8</div>
          </div>
          <div className="mt-1.5 text-center text-[6px] text-stone-400">
            © 2013 Green Leaf Landscaping · All Rights Reserved
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ── Green Leaf — AFTER: Modern landscaping site ───────────────────────────────
function LandscapingAfter() {
  return (
    <BrowserFrame url="greenleafdenver.com">
      <div className="flex h-full flex-col justify-between bg-emerald-800 p-3">
        <div>
          <div className="mb-1 text-[7px] uppercase tracking-widest text-emerald-300">Denver's Premier Landscaping Co.</div>
          <div className="mb-1 text-[14px] font-bold leading-tight text-white">
            Beautiful Yards,<br />Every Season
          </div>
          <div className="mb-3 text-[8px] text-amber-300">★★★★★ 63 Reviews · Fully Booked Summers</div>
          <div className="flex gap-1.5">
            <div className="rounded bg-white px-2.5 py-1 text-[8px] font-semibold text-emerald-800">Get Free Quote →</div>
            <div className="rounded border border-emerald-600 px-2.5 py-1 text-[8px] text-emerald-300">Our Work</div>
          </div>
        </div>
        <div className="text-[7px] text-emerald-500">Licensed · Insured · 15 Years Experience</div>
      </div>
    </BrowserFrame>
  );
}

// ── Eastside Auto — BEFORE: Facebook business page ───────────────────────────
function AutoBefore() {
  return (
    <BrowserFrame url="facebook.com › Eastside Auto Care">
      <div className="h-full overflow-hidden bg-white text-[8px]">
        {/* Cover photo */}
        <div className="relative h-14 bg-gradient-to-r from-stone-400 to-stone-500">
          <div className="absolute bottom-0 left-3 translate-y-1/2">
            <div className="flex h-9 w-9 items-center justify-center rounded border-2 border-white bg-blue-900 text-[12px] font-bold text-white">
              E
            </div>
          </div>
        </div>
        {/* Page info */}
        <div className="px-3 pt-6">
          <div className="text-[10px] font-bold text-stone-900">Eastside Auto Care</div>
          <div className="text-[7px] text-stone-500">Automotive Service · Charlotte, NC · 19 ratings</div>
          <div className="mt-1.5 flex gap-1">
            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[7px] font-medium text-white">👍 Like</span>
            <span className="rounded border border-stone-300 px-1.5 py-0.5 text-[7px] text-stone-600">Follow</span>
            <span className="rounded border border-stone-300 px-1.5 py-0.5 text-[7px] text-stone-600">Message</span>
          </div>
          <div className="mt-2 rounded border border-stone-200 bg-stone-50 p-1.5 text-[7px] italic text-stone-400">
            No posts this week — last post was 4 months ago
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ── Eastside Auto — AFTER: Professional auto care site ───────────────────────
function AutoAfter() {
  return (
    <BrowserFrame url="eastsideautocare.com">
      <div className="flex h-full flex-col justify-between bg-stone-900 p-3">
        <div>
          <div className="mb-1 text-[7px] font-semibold uppercase tracking-widest text-amber-500">
            Eastside Auto Care · Charlotte, NC
          </div>
          <div className="mb-1 text-[14px] font-bold leading-tight text-white">
            Charlotte's #1<br />Auto Repair Shop
          </div>
          <div className="mb-3 text-[8px] text-amber-400">★★★★★ 91 Reviews · Booked 2 Weeks Out</div>
          <div className="flex gap-1.5">
            <div className="rounded bg-amber-500 px-2.5 py-1 text-[8px] font-semibold text-white">Book Appointment</div>
            <div className="rounded border border-stone-600 px-2.5 py-1 text-[8px] text-stone-300">Our Services</div>
          </div>
        </div>
        <div className="text-[7px] text-stone-500">Open Mon–Sat · 7am–6pm · (704) 555-0192</div>
      </div>
    </BrowserFrame>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    business: "Miller's Plumbing Co.",
    location: 'Austin, TX',
    category: 'Plumber',
    before: {
      website: 'No website',
      reviews: '6 Google reviews',
      visibility: 'Word of mouth only',
      leads: '~4 calls / week',
    },
    after: {
      website: 'millersplumbing.com',
      reviews: '51 Google reviews',
      visibility: '#2 for "plumber Austin"',
      leads: '~22 calls / week',
    },
    result: '4× more inbound calls in 90 days',
  },
  {
    business: 'Green Leaf Landscaping',
    location: 'Denver, CO',
    category: 'Landscaping',
    before: {
      website: 'Site from 2013, not mobile-friendly',
      reviews: '11 Google reviews',
      visibility: 'Hard to find online',
      leads: '~3 quote requests / week',
    },
    after: {
      website: 'Modern site with online quotes',
      reviews: '63 Google reviews',
      visibility: 'Top 3 local results',
      leads: '~11 quote requests / week',
    },
    result: '3× more quote requests, fully booked summers',
  },
  {
    business: 'Eastside Auto Care',
    location: 'Charlotte, NC',
    category: 'Auto Repair',
    before: {
      website: 'Facebook page only',
      reviews: '19 Google reviews',
      visibility: 'Not ranking locally',
      leads: 'Slow season regularly',
    },
    after: {
      website: 'Professional site with booking',
      reviews: '91 Google reviews',
      visibility: '#1 for "auto repair Charlotte"',
      leads: 'Booked out 2 weeks ahead',
    },
    result: 'Eliminated slow season entirely',
  },
];

const MOCKUPS = [
  { before: <PlumberBefore />,     after: <PlumberAfter /> },
  { before: <LandscapingBefore />, after: <LandscapingAfter /> },
  { before: <AutoBefore />,        after: <AutoAfter /> },
];

// ── Card ──────────────────────────────────────────────────────────────────────
function BeforeAfterCard({
  example,
  beforeMockup,
  afterMockup,
}: {
  example: typeof EXAMPLES[0];
  beforeMockup: React.ReactNode;
  afterMockup: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-stone-200 bg-stone-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-stone-900">{example.business}</h3>
            <p className="text-sm text-stone-500">{example.location} · {example.category}</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            {example.result}
          </span>
        </div>
      </div>

      {/* Before / After columns */}
      <div className="grid grid-cols-2 divide-x divide-stone-200">
        {/* Before */}
        <div className="p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-red-500">Before</p>
          {beforeMockup}
          <ul className="mt-4 space-y-2.5">
            {Object.values(example.before).map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                <span className="mt-0.5 text-red-400">✗</span>
                {v}
              </li>
            ))}
          </ul>
        </div>
        {/* After */}
        <div className="p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">After</p>
          {afterMockup}
          <ul className="mt-4 space-y-2.5">
            {Object.values(example.after).map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-800">
                <span className="mt-0.5 text-emerald-500">✓</span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PublicPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">

      {/* Nav */}
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-semibold text-stone-900">Clearsite</span>
          <Link href="/login" className="text-sm text-stone-500 transition hover:text-stone-700">
            Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-1.5 text-xs text-stone-600 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Web design for local businesses
        </div>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl">
          We build websites that<br />
          <span className="text-amber-500">actually bring in customers</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-stone-600">
          Most local businesses are invisible online. We fix that — with clean, fast websites that rank on Google and turn visitors into calls.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a href="mailto:you@yourdomain.com"
            className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600">
            Get in touch
          </a>
          <a href="#results"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-400 hover:text-stone-900">
            See results
          </a>
        </div>
      </section>

      {/* Stats row */}
      <section className="border-y border-stone-200 bg-white py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-6 px-6 text-center">
          {[
            { value: '3–4×', label: 'More inbound calls on average' },
            { value: '90 days', label: 'Typical time to see results' },
            { value: '$0', label: 'Upfront for qualifying businesses' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-stone-900 sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-stone-500 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before / After */}
      <section id="results" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">Real results for local businesses</h2>
          <p className="mt-3 text-stone-500">A look at what changes when a business actually shows up online.</p>
        </div>
        <div className="space-y-6">
          {EXAMPLES.map((ex, i) => (
            <BeforeAfterCard
              key={ex.business}
              example={ex}
              beforeMockup={MOCKUPS[i].before}
              afterMockup={MOCKUPS[i].after}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-stone-200 bg-white px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-900">Ready to be found?</h2>
        <p className="mx-auto mt-3 max-w-md text-stone-600">
          If your business isn't showing up on Google, you're leaving money on the table. Let's change that.
        </p>
        <a href="mailto:you@yourdomain.com"
          className="mt-6 inline-block rounded-lg bg-amber-500 px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600">
          Start a conversation
        </a>
      </section>

      <footer className="border-t border-stone-200 px-6 py-6 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Clearsite
      </footer>
    </div>
  );
}
