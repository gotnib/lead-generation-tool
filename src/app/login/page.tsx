'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(params.get('from') || '/dashboard');
    } else {
      setError('Incorrect password');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500">
            <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
              <path d="M2 3h10M2 7h7M2 11h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-stone-900">Admin Access</h1>
          <p className="mt-1 text-sm text-stone-500">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoFocus
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-3 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
