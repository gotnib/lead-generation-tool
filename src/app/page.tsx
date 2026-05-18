import Link from 'next/link';

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

function BeforeAfterCard({ example }: { example: typeof EXAMPLES[0] }) {
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

      {/* Before / After grid */}
      <div className="grid grid-cols-2 divide-x divide-stone-200">
        <div className="p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-red-500">Before</p>
          <ul className="space-y-2.5">
            {Object.values(example.before).map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                <span className="mt-0.5 text-red-400">✗</span>
                {v}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">After</p>
          <ul className="space-y-2.5">
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
          {EXAMPLES.map((ex) => (
            <BeforeAfterCard key={ex.business} example={ex} />
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
