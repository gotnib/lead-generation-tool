interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}

export default function StatCard({ label, value, icon, accent = 'text-stone-900' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
          <p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p>
        </div>
        <div className="rounded-lg bg-stone-100 p-2.5 text-stone-500">{icon}</div>
      </div>
    </div>
  );
}
