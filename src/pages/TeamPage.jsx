import doc2 from '../assets/images/doc2.PNG'
import doc7 from '../assets/images/doc 7.PNG'
import doc4 from '../assets/images/doc 4.PNG'
import docOther from '../assets/images/doc....PNG'
import hugImage from '../assets/images/hug 8.PNG'

const leadership = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Chief Medical Officer',
    bio: 'Board-certified physician with 15+ years of experience in internal medicine and digital health.',
    tags: ['Internal Medicine', 'Digital Health', 'AI Healthcare'],
    image: doc2,
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Head of AI Research',
    bio: 'Leading AI researcher specializing in machine learning applications for healthcare diagnostics.',
    tags: ['Machine Learning', 'Medical AI', 'Data Science'],
    image: docOther,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Director of Nursing',
    bio: 'Registered nurse with expertise in patient care coordination and telemedicine services.',
    tags: ['Patient Care', 'Telemedicine', 'Healthcare Management'],
    image: doc7,
  },
  {
    name: 'Dr. James Park',
    role: 'Medical Advisor',
    bio: 'Specialist in emergency medicine with a focus on rapid diagnosis and patient safety.',
    tags: ['Emergency Medicine', 'Patient Safety', 'Clinical Guidelines'],
    image: doc4,
  },
]

const advisory = [
  ['Prof. Lisa Anderson', 'Medical Ethics Advisor', 'MD, PhD - Stanford Medical School'],
  ['Dr. Robert Williams', 'Technology Advisor', 'PhD Computer Science - MIT'],
  ['Dr. Maria Garcia', 'Public Health Advisor', 'MD, MPH - Johns Hopkins'],
]

export default function TeamPage() {
  return (
    <main className="relative px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[38px] border border-emerald-100 bg-white/85 px-8 py-16 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Team</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">Meet Our Team</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            A dedicated group of healthcare professionals and technology experts committed to improving healthcare accessibility through thoughtful digital care journeys.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-slate-900">Leadership Team</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {leadership.map((member) => (
              <article key={member.name} className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                <div className="grid md:grid-cols-[220px_1fr]">
                  <img src={member.image} alt={member.name} className="h-full min-h-[240px] w-full object-cover" />
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-slate-900">{member.name}</h3>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">{member.role}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{member.bio}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {member.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[36px] border border-slate-200 bg-white/85 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur">
          <h2 className="text-3xl font-semibold text-slate-900">Advisory Board</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {advisory.map(([name, role, credentials]) => (
              <article key={name} className="rounded-[28px] bg-slate-50 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">🏆</div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{name}</h3>
                <p className="mt-2 text-sm font-semibold text-emerald-600">{role}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{credentials}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mt-16 overflow-hidden rounded-[36px] px-8 py-20 text-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(31, 122, 28, 0.78) 0%, rgba(15, 23, 42, 0.72) 100%), url(${hugImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <h2 className="text-3xl font-semibold">Our Commitment</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/90">
            We are committed to leveraging technology to break down barriers in healthcare. Our team combines medical expertise with technological innovation to create solutions that truly make a difference in people&apos;s lives.
          </p>
        </section>
      </div>
    </main>
  )
}
