import { ShieldCheck, TriangleAlert } from "lucide-react"

export function QuickActions() {
  return (
    <nav className="grid grid-cols-2 gap-3">
      <button className="bg-white dark:bg-slate-800 border border-border p-4 rounded-2xl flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform">
        <div className="size-10 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center">
          <TriangleAlert className="h-5 w-5" />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pánico</span>
      </button>
      <button className="bg-white dark:bg-slate-800 border border-border p-4 rounded-2xl flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform">
        <div className="size-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-full flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Novedad</span>
      </button>
    </nav>
  )
}
