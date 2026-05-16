interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}

export default function StatCard({ label, value, icon, accent = 'text-zinc-400' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p>
        </div>
        <div className="rounded-lg bg-zinc-800 p-2.5 text-zinc-400">{icon}</div>
      </div>
    </div>
  );
}
