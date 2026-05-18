'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_LINKS = [
  { href: '/dashboard',         label: 'Pipeline' },
  { href: '/dashboard/scraper', label: 'Find Leads' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <Link href="/dashboard" className="flex items-center">
              <img src="/clearsite-logo.png" alt="Clearsite" className="h-8 w-auto" />
            </Link>

            <div className="flex items-center gap-1">
              <nav className="flex items-center gap-1">
                {NAV_LINKS.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link key={href} href={href}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${active ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}>
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <button onClick={handleLogout}
                className="ml-2 rounded-md px-3 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
