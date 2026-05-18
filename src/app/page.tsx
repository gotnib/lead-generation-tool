import Link from 'next/link';

// ── BEFORE mockups ────────────────────────────────────────────────────────────

function PlumberBefore() {
  return (
    <div className="h-52 overflow-hidden rounded-xl border border-stone-200 flex flex-col text-[8px]">
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 shadow-sm flex-shrink-0">
        <span className="font-bold text-[11px] tracking-tight">
          <span className="text-blue-600">G</span><span className="text-red-500">o</span>
          <span className="text-amber-400">o</span><span className="text-blue-600">g</span>
          <span className="text-green-600">l</span><span className="text-red-500">e</span>
        </span>
        <div className="flex-1 rounded-full border border-stone-300 bg-stone-50 px-2.5 py-0.5 text-[7px] text-stone-500">
          miller's plumbing austin tx
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[52%] border-r border-stone-100 bg-white p-2.5 overflow-hidden">
          <div className="mb-0.5 text-[10px] font-bold text-stone-900">Miller's Plumbing Co.</div>
          <div className="mb-1 text-amber-500">★★★★☆ <span className="text-stone-500">6 reviews · Plumber</span></div>
          <div className="mb-2 text-[7px] text-stone-500">Austin, TX · Open · Closes 5 PM</div>
          <div className="mb-2 grid grid-cols-3 gap-1">
            {['Directions', '📞 Call', 'Share'].map(l => (
              <div key={l} className="rounded border border-stone-200 py-0.5 text-center text-[6.5px] text-blue-600">{l}</div>
            ))}
          </div>
          <div className="space-y-1 border-t border-stone-100 pt-1.5">
            <div className="flex items-center gap-1 text-stone-400 italic"><span>🌐</span><span>No website</span></div>
            <div className="flex items-center gap-1 text-stone-600"><span>📞</span><span>(512) 555-0103</span></div>
            <div className="flex items-center gap-1 text-blue-600"><span>👤</span><span>facebook.com/millersplumbing</span></div>
          </div>
        </div>
        <div className="flex-1 relative bg-[#e8e0d8] overflow-hidden">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute left-0 right-0 top-[30%] h-px bg-[#c8b89a]" />
            <div className="absolute left-0 right-0 top-[60%] h-[2px] bg-[#c8b89a]" />
            <div className="absolute top-0 bottom-0 left-[40%] w-px bg-[#c8b89a]" />
            <div className="absolute top-0 bottom-0 left-[70%] w-px bg-[#c8b89a]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-red-500 border-2 border-white shadow-md" />
              <div className="h-1.5 w-0.5 bg-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandscapingBefore() {
  return (
    <div className="h-52 overflow-hidden rounded-xl border border-stone-200 flex flex-col text-[8px]">
      <div className="bg-green-800 px-3 py-2 text-center flex-shrink-0">
        <div className="text-[12px] font-bold text-yellow-300 leading-tight">🌿 GREEN LEAF LANDSCAPING 🌿</div>
        <div className="text-[7px] text-yellow-200">Denver, Colorado · Quality You Can Count On!</div>
      </div>
      <div className="bg-green-600 py-1 text-center text-[7px] text-white flex-shrink-0">
        <span className="underline">HOME</span>{' | '}
        <span className="text-yellow-300 underline">SERVICES</span>{' | '}
        <span className="underline">GALLERY</span>{' | '}
        <span className="underline">CONTACT US</span>
      </div>
      <div className="flex-1 bg-[#f5f0e8] overflow-hidden p-2.5">
        <div className="mb-1.5 text-center text-[7px] font-bold text-green-900 underline">★ Welcome! Click Here to Learn More ★</div>
        <div className="flex gap-2">
          <div className="flex-1 text-[7px] text-stone-700">
            <div className="mb-1">We are a <span className="font-bold">family owned</span> landscaping buisness serving Denver since 2008!!!</div>
            <div className="text-green-800 font-bold mb-0.5">Our Services:</div>
            {['Lawn Mowing', 'Tree Trimming', 'Sprinkler Repair', 'Snow Removal'].map(s => (
              <div key={s} className="text-[6.5px]">• {s}</div>
            ))}
          </div>
          <div className="w-16 flex-shrink-0">
            <div className="rounded border border-stone-300 bg-stone-200 p-1.5 text-center">
              <div className="text-[18px] leading-none mb-0.5">🖼️</div>
              <div className="text-[5.5px] text-stone-400">photo loading…</div>
            </div>
          </div>
        </div>
        <div className="mt-2 border-t border-stone-400 pt-1 text-center text-[6px] text-stone-500">
          📞 (303) 555-0177 &nbsp;|&nbsp; Last Updated: March 2014 &nbsp;|&nbsp; Visitors: 4,892
        </div>
        <div className="mt-0.5 text-center text-[5.5px] text-stone-400 italic">Best viewed in Internet Explorer 8</div>
      </div>
    </div>
  );
}

function AutoBefore() {
  return (
    <div className="h-52 overflow-hidden rounded-xl border border-stone-200 flex flex-col text-[8px] bg-[#f0f2f5]">
      <div className="flex items-center gap-2 bg-[#1877f2] px-3 py-1.5 flex-shrink-0">
        <span className="text-white font-black text-[14px] leading-none">f</span>
        <div className="flex-1 rounded-full bg-white/20 px-2 py-0.5 text-[7px] text-white/70">🔍 Search Facebook</div>
        <div className="text-white/70 text-[9px]">⋯</div>
      </div>
      <div className="relative h-14 bg-stone-500 flex-shrink-0">
        <div className="absolute bottom-0 left-3 translate-y-1/2">
          <div className="h-9 w-9 rounded-lg border-2 border-white bg-stone-800 flex items-center justify-center text-white font-black text-[13px]">E</div>
        </div>
      </div>
      <div className="bg-white border-b border-stone-200 px-3 pt-5 pb-1.5 flex-shrink-0">
        <div className="text-[10px] font-bold text-stone-900">Eastside Auto Care</div>
        <div className="text-[7px] text-stone-500 mb-1.5">Auto Repair · Charlotte, NC · 19 ratings · ⭐⭐⭐⭐</div>
        <div className="flex gap-1.5">
          <div className="rounded bg-[#1877f2] px-2 py-0.5 text-[7px] font-medium text-white">👍 Like</div>
          <div className="rounded border border-stone-300 px-2 py-0.5 text-[7px] text-stone-700">Follow</div>
          <div className="rounded border border-stone-300 px-2 py-0.5 text-[7px] text-stone-700">Message</div>
        </div>
      </div>
      <div className="flex-1 bg-[#f0f2f5] p-2 overflow-hidden space-y-1.5">
        <div className="rounded-lg bg-white border border-stone-200 p-2 text-[7px] text-stone-400 italic">
          No recent posts — last activity 5 months ago.
        </div>
        <div className="rounded-lg bg-white border border-stone-200 p-2">
          <div className="text-[7px] font-semibold text-stone-700 mb-0.5">About</div>
          <div className="text-[6.5px] text-stone-500">📍 1204 Central Ave, Charlotte, NC · 🕐 Mon–Fri 9am–5pm</div>
        </div>
      </div>
    </div>
  );
}

// ── AFTER mockups — each a distinct visual identity ───────────────────────────

// Plumber: Light/professional — white bg, blue accent panel, split layout
function PlumberAfter() {
  return (
    <div className="h-52 overflow-hidden rounded-xl border border-stone-200 flex flex-col">
      {/* Nav: clean white, phone number prominent */}
      <div className="flex items-center justify-between bg-white border-b border-stone-100 px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 rounded bg-blue-700 flex items-center justify-center text-white text-[7px]">🔧</div>
          <span className="text-[9px] font-bold text-stone-900">MillerPlumbing</span>
        </div>
        <div className="flex items-center gap-3 text-[7px] text-stone-400">
          <span>Services</span><span>Reviews</span>
          <span className="font-bold text-blue-700">☎ (512) 555-0103</span>
        </div>
      </div>
      {/* Hero: horizontal split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: white content */}
        <div className="flex-1 bg-white px-4 py-3 flex flex-col justify-between">
          <div>
            <div className="text-[6.5px] font-semibold uppercase tracking-widest text-blue-600 mb-1.5">Austin, TX · Licensed &amp; Insured Since 1998</div>
            <div className="text-[15px] font-bold leading-tight text-stone-900 mb-2">
              Austin's #1<br/>Trusted Plumber
            </div>
            <div className="text-[7px] text-stone-500 mb-2.5">Same-day service · No surprise fees · Emergency calls welcome</div>
            <div className="inline-block rounded bg-blue-700 px-3 py-1.5 text-[8px] font-bold text-white">
              Get Free Estimate →
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-[9px]">★★★★★</span>
            <span className="text-[6.5px] text-stone-400">51 verified Google reviews</span>
          </div>
        </div>
        {/* Right: blue accent panel */}
        <div className="w-[36%] bg-blue-700 flex flex-col items-center justify-center gap-2 px-2 py-3 flex-shrink-0">
          <div className="text-[6.5px] text-blue-200 uppercase tracking-wider">Available</div>
          <div className="text-[26px] font-black text-white leading-none">24/7</div>
          <div className="w-8 h-px bg-blue-500" />
          <div className="space-y-1 text-center">
            {['✓ Licensed', '✓ Insured', '✓ Same-day'].map(b => (
              <div key={b} className="text-[7px] text-blue-100">{b}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Landscaping: Warm organic — cream bg, earthy palette, service tag pills
function LandscapingAfter() {
  return (
    <div className="h-52 overflow-hidden rounded-xl border border-[#ddd4b8] flex flex-col">
      {/* Nav: warm cream */}
      <div className="flex items-center justify-between bg-[#f6f1e7] border-b border-[#e5d9c0] px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">🌿</span>
          <span className="text-[9px] font-serif font-bold text-[#2e4a2f]">GreenLeaf</span>
        </div>
        <div className="flex items-center gap-2.5 text-[7px] text-[#6b7c5a]">
          <span>Services</span><span>Portfolio</span><span>Reviews</span>
          <div className="rounded border border-[#2e4a2f] px-2 py-0.5 text-[#2e4a2f] font-semibold">Quote</div>
        </div>
      </div>
      {/* Hero: warm centered */}
      <div className="flex-1 bg-[#f6f1e7] px-5 py-3 flex flex-col justify-between overflow-hidden">
        <div className="text-center">
          <div className="text-[6.5px] font-semibold uppercase tracking-[0.18em] text-[#8a7a50] mb-1.5">Denver, Colorado · Est. 2008</div>
          <div className="text-[16px] font-serif font-bold leading-tight text-[#1e311f] mb-1.5">
            Beautiful Spaces,<br/>Every Season
          </div>
          <div className="text-[7px] text-[#6b7c5a] mb-2.5">Lawn · Hardscaping · Snow removal · Fully licensed</div>
          <div className="flex items-center justify-center gap-2">
            <div className="rounded bg-[#2e4a2f] px-3 py-1.5 text-[7.5px] font-bold text-white">Free Quote →</div>
            <div className="rounded border border-[#c8b48a] px-2.5 py-1.5 text-[7px] text-[#6b7c5a]">Our Work</div>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap justify-center gap-1 mb-1.5">
            {['Lawn Care', 'Hardscaping', 'Sprinklers', 'Snow'].map(tag => (
              <span key={tag} className="rounded-full bg-[#e8ddc4] px-2 py-0.5 text-[6px] font-medium text-[#5c4e30]">{tag}</span>
            ))}
          </div>
          <div className="text-center">
            <span className="text-amber-500 text-[9px]">★★★★★</span>
            <span className="text-[6.5px] text-[#8a7a50] ml-1">63 reviews · Fully booked summers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Auto: Bold industrial — black/yellow, large type, stat grid
function AutoAfter() {
  return (
    <div className="h-52 overflow-hidden rounded-xl flex flex-col">
      {/* Nav: black with yellow CTA */}
      <div className="flex items-center justify-between bg-black px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-sm bg-yellow-400 flex items-center justify-center">
            <span className="text-black text-[8px] font-black">E</span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-white">Eastside Auto</span>
        </div>
        <div className="flex items-center gap-2.5 text-[7px] text-zinc-400">
          <span>Services</span><span>Reviews</span>
          <div className="rounded bg-yellow-400 px-2 py-0.5 text-[7px] font-black text-black uppercase">Book Now</div>
        </div>
      </div>
      {/* Hero: dark with yellow accents */}
      <div className="flex-1 bg-zinc-950 px-4 py-3 flex flex-col justify-between overflow-hidden">
        <div>
          <div className="inline-block bg-yellow-400 px-2 py-0.5 text-[6.5px] font-black uppercase tracking-wider text-black mb-2">
            ASE Certified · Charlotte, NC · Est. 2009
          </div>
          <div className="text-[22px] font-black uppercase leading-none text-white mb-1.5">
            Auto<br/>Repair
          </div>
          <div className="text-[7px] text-zinc-500 mb-2.5">Honest diagnostics · Fair pricing · No upsells</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[['91', '5-star reviews'], ['#1', 'In Charlotte'], ['2 wk', 'Wait list']].map(([v, l]) => (
              <div key={l} className="rounded bg-zinc-800 py-1.5 text-center">
                <div className="text-[11px] font-black text-yellow-400 leading-none">{v}</div>
                <div className="text-[5.5px] text-zinc-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full rounded bg-yellow-400 py-1.5 text-center text-[8px] font-black uppercase text-black">
          Book Your Appointment →
        </div>
      </div>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const EXAMPLES = [
  {
    business: "Miller's Plumbing Co.",
    location: 'Austin, TX',
    category: 'Plumber',
    before: { website: 'No website', reviews: '6 Google reviews', visibility: 'Word of mouth only', leads: '~4 calls / week' },
    after:  { website: 'millersplumbing.com', reviews: '51 Google reviews', visibility: '#2 for "plumber Austin"', leads: '~22 calls / week' },
    result: '4× more inbound calls in 90 days',
  },
  {
    business: 'Green Leaf Landscaping',
    location: 'Denver, CO',
    category: 'Landscaping',
    before: { website: 'Site from 2013, not mobile-friendly', reviews: '11 Google reviews', visibility: 'Hard to find online', leads: '~3 quote requests / week' },
    after:  { website: 'Modern site with online quotes', reviews: '63 Google reviews', visibility: 'Top 3 local results', leads: '~11 quote requests / week' },
    result: '3× more quote requests, fully booked summers',
  },
  {
    business: 'Eastside Auto Care',
    location: 'Charlotte, NC',
    category: 'Auto Repair',
    before: { website: 'Facebook page only', reviews: '19 Google reviews', visibility: 'Not ranking locally', leads: 'Slow season regularly' },
    after:  { website: 'Professional site with booking', reviews: '91 Google reviews', visibility: '#1 for "auto repair Charlotte"', leads: 'Booked out 2 weeks ahead' },
    result: 'Eliminated slow season entirely',
  },
];

const MOCKUPS = [
  { before: <PlumberBefore />,     after: <PlumberAfter /> },
  { before: <LandscapingBefore />, after: <LandscapingAfter /> },
  { before: <AutoBefore />,        after: <AutoAfter /> },
];

// ── Before/After card ─────────────────────────────────────────────────────────

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
      <div className="border-b border-stone-200 bg-stone-50 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-stone-900">{example.business}</h3>
            <p className="text-sm text-stone-500">{example.location} · {example.category}</p>
          </div>
          <span className="self-start rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 sm:self-auto">
            {example.result}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-stone-200 md:grid-cols-2 md:divide-y-0 md:divide-x">
        <div className="p-5 sm:p-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-red-500">Before</p>
          {beforeMockup}
          <ul className="mt-4 space-y-2.5">
            {Object.values(example.before).map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                <span className="mt-0.5 flex-shrink-0 text-red-400">✗</span>{v}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5 sm:p-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">After</p>
          {afterMockup}
          <ul className="mt-4 space-y-2.5">
            {Object.values(example.after).map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-800">
                <span className="mt-0.5 flex-shrink-0 text-emerald-500">✓</span>{v}
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

      {/* Sticky nav */}
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center">
            <img src="/clearsite-logo.png" alt="Clearsite" className="h-11 w-auto" />
          </div>
          <nav className="hidden items-center gap-6 text-sm text-stone-500 sm:flex">
            <a href="#how-it-works" className="transition-colors hover:text-stone-800">How it works</a>
            <a href="#results" className="transition-colors hover:text-stone-800">Results</a>
          </nav>
          <a href="mailto:you@yourdomain.com"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600">
            Get in touch
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-1.5 text-xs text-stone-600 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Web design for local businesses
        </div>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
          We build websites that<br className="hidden sm:block" />
          {' '}<span className="text-amber-500">actually bring in customers</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base text-stone-600 sm:text-lg">
          Most local businesses are invisible online. We fix that — with fast, professional websites that rank on Google and turn visitors into calls.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href="mailto:you@yourdomain.com"
            className="rounded-lg bg-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600">
            Get in touch — it's free
          </a>
          <a href="#results"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3.5 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-stone-400 hover:text-stone-900">
            See real results ↓
          </a>
        </div>
        <p className="mt-4 text-xs text-stone-400">No upfront cost for qualifying businesses · Results typically in 90 days</p>
      </section>

      {/* Stats */}
      <section className="border-y border-stone-200 bg-white py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '3–4×',    label: 'More inbound calls on average' },
              { value: '90 days', label: 'Typical time to see results' },
              { value: '$0',      label: 'Upfront for qualifying businesses' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-stone-900 sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-[11px] leading-snug text-stone-500 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">How it works</h2>
          <p className="mt-3 text-stone-500">Simple and fast — no technical knowledge needed on your end.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              n: '1', title: 'Free audit',
              body: "We look at where your business stands online — search rankings, reviews, and website — and show you exactly what's costing you customers.",
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
            },
            {
              n: '2', title: 'We build & launch',
              body: 'A clean, fast, mobile-friendly site goes live within 14 days. Optimized for Google from day one — no templates, no shortcuts.',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
            },
            {
              n: '3', title: 'Customers find you',
              body: 'Rank higher on local searches, get more calls, and stop losing business to competitors who simply have a better website.',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
            },
          ].map((step) => (
            <div key={step.n} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">{step.n}</div>
                <div className="h-px flex-1 bg-stone-200" />
              </div>
              <div className="mb-3 text-amber-500">{step.icon}</div>
              <h3 className="mb-2 font-semibold text-stone-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-stone-500">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before / After */}
      <section id="results" className="border-t border-stone-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">Real results for real businesses</h2>
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
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm sm:px-12">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">Is your business easy to find on Google?</h2>
          <p className="mx-auto mt-4 max-w-md text-stone-600">
            If you're not sure — or you know the answer is no — let's talk. We'll audit your online presence for free and show you exactly what's holding you back.
          </p>
          <a href="mailto:you@yourdomain.com"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600">
            Get my free audit
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M7 2l5 5-5 5"/></svg>
          </a>
          <p className="mt-3 text-xs text-stone-400">No commitment · Typically takes 15 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-stone-400">© {new Date().getFullYear()} Clearsite</p>
          <Link href="/login" className="text-xs text-stone-300 transition-colors hover:text-stone-500">Admin</Link>
        </div>
      </footer>

    </div>
  );
}
