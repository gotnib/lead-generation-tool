'use client';

import { useState } from 'react';
import type { ScrapedBusiness } from '@/types';
import Link from 'next/link';

export default function ScraperPage() {
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapedBusiness[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [addSuccess, setAddSuccess] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResults([]);
    setSelected(new Set());
    setAddSuccess(0);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: category.trim(), city: city.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scraping failed');
      setResults(data.businesses);
      // Select all by default
      setSelected(new Set(data.businesses.map((_: ScrapedBusiness, i: number) => i)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map((_, i) => i)));
  };

  const handleAddToPipeline = async () => {
    const toAdd = Array.from(selected).map((i) => results[i]);
    if (toAdd.length === 0) return;

    setIsAdding(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: toAdd }),
      });
      if (!res.ok) throw new Error('Failed to add leads');
      setAddSuccess(toAdd.length);
      setSelected(new Set());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add leads');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Find Local Business Leads</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Scrape Google Maps by business category and city — then add leads directly to your pipeline.
        </p>
      </div>

      {/* Search form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Business Type
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. plumbers, dentists, auto repair"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Austin TX, Chicago IL"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500/40 sm:w-auto"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Scanning Maps…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="6" r="4.5" />
                    <path d="M10 10l2.5 2.5" />
                  </svg>
                  Find Leads
                </>
              )}
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-400" />
            Opening Google Maps and scanning results — this may take up to 60 seconds…
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Success banner */}
      {addSuccess > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <span>
            {addSuccess} lead{addSuccess !== 1 ? 's' : ''} added to your pipeline.
          </span>
          <Link
            href="/"
            className="ml-4 font-medium underline underline-offset-2 hover:text-emerald-300"
          >
            View Dashboard →
          </Link>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              <span className="font-medium text-zinc-200">{results.length}</span> businesses found
              {selected.size > 0 && (
                <span className="ml-2 text-zinc-500">· {selected.size} selected</span>
              )}
            </p>

            <button
              onClick={handleAddToPipeline}
              disabled={selected.size === 0 || isAdding}
              className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            >
              {isAdding ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-700" />
                  Adding…
                </>
              ) : (
                `Add ${selected.size > 0 ? selected.size : ''} to Pipeline`
              )}
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selected.size === results.length}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">Business</th>
                  <th className="hidden px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 sm:table-cell">Address</th>
                  <th className="hidden px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 md:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {results.map((biz, i) => (
                  <tr
                    key={i}
                    onClick={() => toggleRow(i)}
                    className={`cursor-pointer transition-colors hover:bg-zinc-800/40 ${
                      selected.has(i) ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => toggleRow(i)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-100">{biz.businessName}</p>
                      <p className="text-xs text-zinc-500">{biz.city}</p>
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      <p className="max-w-xs truncate text-sm text-zinc-400">{biz.address ?? '—'}</p>
                    </td>
                    <td className="hidden px-4 py-3.5 md:table-cell">
                      <p className="text-sm text-zinc-400">{biz.phone ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {biz.rating ? (
                        <span className="flex items-center gap-1 text-sm text-amber-400">
                          <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor">
                            <path d="M5 0l1.12 3.44H9.5L6.69 5.56l1.07 3.44L5 7.06l-2.76 1.94 1.07-3.44L.5 3.44H3.88L5 0z" />
                          </svg>
                          {biz.rating.toFixed(1)}
                          {biz.reviewCount != null && (
                            <span className="text-zinc-600">({biz.reviewCount})</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-sm text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Zero-results state */}
      {!isLoading && results.length === 0 && !error && category && city && (
        <div className="mt-10 flex flex-col items-center text-center text-zinc-500">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
            <circle cx="18" cy="18" r="12" />
            <path d="M28 28l7 7" />
          </svg>
          <p className="text-sm">No results yet. Run a search above.</p>
        </div>
      )}
    </div>
  );
}
