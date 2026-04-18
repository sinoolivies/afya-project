import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-[70vh] items-center justify-center px-6 pt-28 lg:px-8">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">Page not found</h1>
        <p className="mt-5 text-base leading-7 text-slate-600">
          The page you opened is not part of the current AfyaCare flow. Use the links below to continue safely.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
            Go Home
          </Link>
          <Link to="/find-care" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            Find Care
          </Link>
        </div>
      </div>
    </main>
  )
}
