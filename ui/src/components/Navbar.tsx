export default function Navbar() {
  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center gap-3">
      <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
      <span className="text-white font-semibold text-lg tracking-tight">Spring Cloud Dashboard</span>
    </header>
  )
}
