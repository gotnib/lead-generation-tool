import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — Clearsite' };

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/">
            <img src="/clearsite-logo.png" alt="Clearsite" className="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-stone-500 transition-colors hover:text-stone-800">← Back</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-stone-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: May 2025</p>

        <div className="mt-8 space-y-8 text-stone-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">1. Who We Are</h2>
            <p>Clearsite (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a web design and online presence service for local businesses, operated by Jason Davis. We can be reached at <a href="mailto:hello@clearsite.online" className="text-amber-600 hover:underline">hello@clearsite.online</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information in the following ways:</p>
            <ul className="list-disc list-inside space-y-2 text-stone-600">
              <li><strong className="text-stone-800">Contact inquiries:</strong> When you reach out to us, we collect your name, email address, phone number, and business details you choose to share.</li>
              <li><strong className="text-stone-800">Business information:</strong> Publicly available information about your business (such as name, address, phone, and website) sourced from platforms like Google.</li>
              <li><strong className="text-stone-800">Email communications:</strong> Records of emails sent and received between us.</li>
              <li><strong className="text-stone-800">Usage data:</strong> Standard server logs including IP address, browser type, and pages visited when you access this website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-stone-600">
              <li>To respond to your inquiries and provide our services</li>
              <li>To assess whether our services may be a fit for your business</li>
              <li>To send you information about our services (you may opt out at any time)</li>
              <li>To improve our website and services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">4. How We Share Your Information</h2>
            <p className="mb-3">We do not sell your personal information. We may share it with:</p>
            <ul className="list-disc list-inside space-y-2 text-stone-600">
              <li><strong className="text-stone-800">Service providers:</strong> Third-party tools we use to operate our business (hosting, email delivery, database), bound by confidentiality obligations.</li>
              <li><strong className="text-stone-800">Legal requirements:</strong> When required by law or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">5. Third-Party Services</h2>
            <p className="mb-3">Our website and operations rely on the following third-party services, each with their own privacy practices:</p>
            <ul className="list-disc list-inside space-y-2 text-stone-600">
              <li>Vercel — website hosting</li>
              <li>Cloudflare — DNS and network security</li>
              <li>Google Places API — publicly available business data</li>
              <li>Neon — database hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">6. Data Retention</h2>
            <p>We retain your information for as long as necessary to provide our services or as required by law. You may request deletion of your data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">7. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-stone-600">
              <li>Access the personal information we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Lodge a complaint with a data protection authority</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:hello@clearsite.online" className="text-amber-600 hover:underline">hello@clearsite.online</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">8. Cookies</h2>
            <p>This website uses only essential session cookies required for basic functionality (such as admin authentication). We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will post the updated policy on this page with a revised date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">10. Contact Us</h2>
            <p>Questions about this policy? Contact us at <a href="mailto:hello@clearsite.online" className="text-amber-600 hover:underline">hello@clearsite.online</a>.</p>
          </section>

        </div>
      </main>

      <footer className="border-t border-stone-200 px-4 py-6 text-center">
        <p className="text-xs text-stone-400">© {new Date().getFullYear()} Clearsite · <Link href="/terms" className="hover:text-stone-600">Terms</Link></p>
      </footer>
    </div>
  );
}
