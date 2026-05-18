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
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 3h10M2 7h7M2 11h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-100">LeadFlow</span>
            </Link>

            <div className="flex items-center gap-1">
              <nav className="flex items-center gap-1">
                {NAV_LINKS.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link key={href} href={href}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${active ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'}`}>
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <button onClick={handleLogout}
                className="ml-2 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-300">
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
