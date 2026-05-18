import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clearsite — Local Business CRM',
  description: 'Scrape, track, and pitch local business leads',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
