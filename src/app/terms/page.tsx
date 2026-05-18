import Link from 'next/link';

export const metadata = { title: 'Terms of Service — Clearsite' };

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold text-stone-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: May 2025</p>

        <div className="mt-8 space-y-8 text-stone-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">1. Agreement to Terms</h2>
            <p>By accessing clearsite.online or engaging our services, you agree to these Terms of Service. If you do not agree, please do not use our services. These terms apply to all clients and visitors.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">2. Services</h2>
            <p className="mb-3">Clearsite provides web design, development, and online presence services for local businesses, including but not limited to:</p>
            <ul className="list-disc list-inside space-y-2 text-stone-600">
              <li>Website design and development</li>
              <li>Search engine optimization (SEO)</li>
              <li>Google Business Profile setup and optimization</li>
              <li>Ongoing website maintenance and hosting coordination</li>
            </ul>
            <p className="mt-3">Specific deliverables, timelines, and pricing will be outlined in a separate written agreement or proposal for each engagement.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">3. Client Responsibilities</h2>
            <p className="mb-3">You agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-stone-600">
              <li>Provide accurate and complete information needed to deliver services</li>
              <li>Respond to requests for feedback or approvals in a timely manner</li>
              <li>Ensure you have the rights to any content, images, or materials you provide to us</li>
              <li>Pay invoices in accordance with agreed payment terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">4. Payment</h2>
            <p>Payment terms, rates, and schedules are specified in the individual service agreement. Unless otherwise agreed, invoices are due within 14 days of receipt. Late payments may result in a pause in service delivery.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">5. Intellectual Property</h2>
            <p className="mb-3">Upon receipt of full payment:</p>
            <ul className="list-disc list-inside space-y-2 text-stone-600">
              <li>You own the final delivered website and its content.</li>
              <li>Clearsite retains the right to display the work in our portfolio unless you request otherwise in writing.</li>
              <li>Any third-party assets (fonts, stock images, plugins) are subject to their respective licenses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">6. Results Disclaimer</h2>
            <p>While we stand behind our work, we cannot guarantee specific search rankings, call volumes, or revenue outcomes. SEO and online visibility depend on many factors outside our control, including search engine algorithm changes and local competition. Statistics referenced on our website reflect typical or average outcomes and are not guaranteed for every client.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Clearsite shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability for any claim shall not exceed the total amount paid by you for the services giving rise to the claim in the 3 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">8. Termination</h2>
            <p>Either party may terminate a service engagement with 30 days written notice. You remain responsible for payment for all work completed up to the termination date. Upon termination, we will provide all completed deliverables and transfer any assets owned by you.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">9. Governing Law</h2>
            <p>These Terms are governed by the laws of the State of North Carolina, United States, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of North Carolina.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance of the updated Terms. We will post the revised Terms on this page with an updated date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">11. Contact</h2>
            <p>Questions about these Terms? Contact us at <a href="mailto:hello@clearsite.online" className="text-amber-600 hover:underline">hello@clearsite.online</a>.</p>
          </section>

        </div>
      </main>

      <footer className="border-t border-stone-200 px-4 py-6 text-center">
        <p className="text-xs text-stone-400">© {new Date().getFullYear()} Clearsite · <Link href="/privacy" className="hover:text-stone-600">Privacy Policy</Link></p>
      </footer>
    </div>
  );
}
