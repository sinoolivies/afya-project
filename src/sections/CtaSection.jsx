import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../components/icons'
import { links } from '../data/links'

const CtaSection = () => {
  return (
    <section className="px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <div className="relative overflow-hidden rounded-[32px] bg-white px-8 py-16 shadow-premium sm:px-16 sm:py-24">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-50 blur-3xl opacity-60" />
          <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-brand-100/50 blur-3xl opacity-60" />
          
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Ready to meet your smart healthcare buddy?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Join thousands of Rwandans who are already managing their health 
              smarter with AfyaCare. It's free to get started.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to={links.signup}
                className="flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-premium transition hover:bg-brand-700 hover:shadow-brand-300/40 active:scale-95"
              >
                Get Started for Free
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                to={links.contact}
                className="text-base font-semibold leading-6 text-slate-600 hover:text-brand-600 transition"
              >
                Talk to Support <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
