import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { ROUTES } from "../router/routes";

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "recruiter" ? ROUTES.RECRUITER : ROUTES.CANDIDATE}
        replace
      />
    );
  }

  return (
    <div className="bg-surface text-on-surface selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tighter text-slate-900 font-headline">
            Vettly
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              className="text-slate-600 hover:text-slate-900 transition-colors font-headline tracking-tight font-semibold"
              href="#how-it-works"
            >
              How It Works
            </a>
            <a
              className="text-slate-600 hover:text-slate-900 transition-colors font-headline tracking-tight font-semibold"
              href="#for-recruiters"
            >
              For Recruiters
            </a>
            <a
              className="text-slate-600 hover:text-slate-900 transition-colors font-headline tracking-tight font-semibold"
              href="#for-candidates"
            >
              For Candidates
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="text-slate-600 hover:text-slate-900 transition-colors font-headline tracking-tight font-semibold"
            >
              Sign In
            </Link>
            <Link
              to={ROUTES.AUTH.REGISTER}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-headline tracking-tight font-semibold hover:opacity-90 active:scale-95 duration-150 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero */}
        <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 text-on-secondary-container text-xs font-bold tracking-widest uppercase font-label">
                <span className="material-symbols-outlined text-[14px]">
                  auto_awesome
                </span>
                AI-Powered Recruitment
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold font-headline leading-[1.1] tracking-tight text-primary">
                Hire smarter. Get hired faster.
              </h1>
              <p className="text-lg lg:text-xl text-on-surface-variant leading-relaxed font-body max-w-xl">
                Vettly uses NLP screening, bias detection, and semantic matching
                to connect the right candidates with the right roles
                automatically, fairly, and at scale.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to={ROUTES.AUTH.REGISTER}
                  className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-headline font-bold text-lg hover:opacity-90 transition-all shadow-lg"
                >
                  Start for Free
                </Link>
                <a
                  href="#how-it-works"
                  className="border-2 border-outline-variant text-primary px-8 py-4 rounded-xl font-headline font-bold text-lg hover:bg-surface-container transition-all"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Pipeline preview card */}
            <div className="relative">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-surface-container-low p-6 space-y-3">
                <p className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant mb-4">
                  Live Pipeline: Senior Frontend Engineer
                </p>
                {[
                  {
                    name: "Alex Chen",
                    score: "94%",
                    stage: "Matched",
                    color: "bg-secondary",
                  },
                  {
                    name: "Priya Nair",
                    score: "89%",
                    stage: "Interview",
                    color: "bg-secondary",
                  },
                  {
                    name: "Jordan Lee",
                    score: "76%",
                    stage: "Screening",
                    color: "bg-outline",
                  },
                  {
                    name: "Sam Rivera",
                    score: "61%",
                    stage: "Applied",
                    color: "bg-outline-variant",
                  },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="glass-panel flex items-center justify-between px-4 py-3 rounded-xl border border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold font-label">
                        {c.name[0]}
                      </div>
                      <span className="font-body text-sm font-medium text-on-surface">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-secondary font-label">
                        AI {c.score}
                      </span>
                      <span
                        className={`text-[10px] font-bold font-label uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${c.color}`}
                      >
                        {c.stage}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between mt-2 pt-2">
                  <span className="text-xs font-label text-on-surface-variant">
                    Bias check:{" "}
                    <span className="text-secondary font-bold">Passed ✓</span>
                  </span>
                  <span className="text-xs font-label text-on-surface-variant">
                    Avg match:{" "}
                    <span className="font-bold text-on-surface">80%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof Points */}
        <section className="bg-surface-container-low py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">
                    model_training
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-bold font-headline text-primary">
                    NLP Resume Scoring
                  </div>
                  <div className="text-sm font-label text-on-surface-variant tracking-wide uppercase">
                    Beyond keyword matching
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                  <span className="material-symbols-outlined">diversity_3</span>
                </div>
                <div>
                  <div className="text-2xl font-bold font-headline text-primary">
                    Bias Detection Built-In
                  </div>
                  <div className="text-sm font-label text-on-surface-variant tracking-wide uppercase">
                    Demographic fairness metrics
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                  <span className="material-symbols-outlined">draw</span>
                </div>
                <div>
                  <div className="text-2xl font-bold font-headline text-primary">
                    E-Sign & Close
                  </div>
                  <div className="text-sm font-label text-on-surface-variant tracking-wide uppercase">
                    Offer to signed in one flow
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold font-headline text-primary mb-6">
              The Full Hiring Pipeline, Automated
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              From job posting to signed offer, Vettly handles every stage with
              AI precision and a complete audit trail.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[700px]">
            {/* Step 1: AI Screening */}
            <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-10 smart-teal-accent flex flex-col justify-between group hover:bg-white transition-all">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">
                      psychology
                    </span>
                  </div>
                  <span className="text-sm font-bold font-label tracking-widest text-on-surface-variant uppercase">
                    Step 01
                  </span>
                </div>
                <h3 className="text-3xl font-bold font-headline mb-4">
                  AI Resume Screening
                </h3>
                <p className="text-lg text-on-surface-variant max-w-md">
                  Our NLP model (spaCy + sentence-transformers) scores every
                  resume against your job description, understanding intent, not
                  just keywords. Results in seconds.
                </p>
              </div>
              <div className="mt-8 bg-surface-container rounded-xl p-4 space-y-3">
                {[
                  { label: "Technical Skills Match", pct: "92%" },
                  { label: "Experience Alignment", pct: "87%" },
                  { label: "Culture Fit Signals", pct: "74%" },
                ].map(({ label, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-label text-on-surface-variant mb-1">
                      <span>{label}</span>
                      <span className="font-bold text-secondary">{pct}</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-secondary h-full transition-all"
                        style={{ width: pct }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Bias Detection */}
            <div className="md:col-span-4 bg-primary-container text-white rounded-2xl p-10 flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <span className="text-xs font-bold font-label tracking-widest text-on-primary-container uppercase block mb-6">
                  Step 02
                </span>
                <h3 className="text-2xl font-bold font-headline mb-4">
                  Bias Detection
                </h3>
                <p className="text-on-primary-container leading-relaxed">
                  Automated fairness audits flag decisions correlated with
                  demographic signals, using demographic parity and equal
                  opportunity metrics.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary-fixed/20 rounded-full blur-2xl"></div>
              <div className="relative z-10 pt-8">
                <span className="material-symbols-outlined text-6xl text-secondary-fixed">
                  verified_user
                </span>
              </div>
            </div>

            {/* Step 3: Semantic Matching */}
            <div className="md:col-span-4 bg-surface-container-low rounded-2xl p-10 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold font-label tracking-widest text-on-surface-variant uppercase block mb-6">
                  Step 03
                </span>
                <h3 className="text-2xl font-bold font-headline mb-4">
                  Semantic Matching & Skill Gaps
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Candidates are ranked by semantic fit. Skill gaps are
                  calculated per applicant, showing missing skills and match
                  percentage, ready for the recruiter's review.
                </p>
              </div>
              <div className="flex items-end justify-between mt-8">
                <div className="w-16 h-1 bg-secondary rounded-full"></div>
                <span className="material-symbols-outlined text-4xl text-primary">
                  analytics
                </span>
              </div>
            </div>

            {/* Step 4: E-Sign */}
            <div className="md:col-span-8 editorial-gradient rounded-2xl p-10 flex flex-col md:flex-row gap-10 items-center justify-between text-white">
              <div className="max-w-xs">
                <span className="text-xs font-bold font-label tracking-widest text-on-primary-container uppercase block mb-6">
                  Step 04
                </span>
                <h3 className="text-3xl font-bold font-headline mb-4">
                  Offer & E-Sign
                </h3>
                <p className="text-on-primary-container text-lg">
                  Generate offer letters as signed PDFs with SHA-256
                  tamper-evident hashing and a full audit trail. Candidates sign
                  on mobile or web.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full md:w-64">
                <div className="space-y-4">
                  <div className="text-xs font-label text-white/60 uppercase tracking-widest">
                    Offer Letter: Alex Chen
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded"></div>
                  <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                  <div className="h-2 w-1/2 bg-white/20 rounded"></div>
                  <div className="pt-4 flex justify-end">
                    <div className="px-4 py-2 bg-secondary-fixed text-on-secondary-fixed rounded-lg text-xs font-bold">
                      SIGN NOW
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Recruiters */}
        <section id="for-recruiters" className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 text-on-primary-container text-xs font-bold tracking-widest uppercase font-label">
                  <span className="material-symbols-outlined text-[14px]">
                    work
                  </span>
                  For Recruiters
                </div>
                <h2 className="text-4xl font-extrabold font-headline text-primary leading-tight">
                  Run your entire pipeline from one place
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      icon: "view_kanban",
                      title: "Kanban Pipeline",
                      desc: "Applied to Screened to Matched to Interview to Offer. Move candidates with one click.",
                    },
                    {
                      icon: "post_add",
                      title: "Job Posting Management",
                      desc: "Create, edit, and manage job postings. Set required skills and experience level.",
                    },
                    {
                      icon: "troubleshoot",
                      title: "Candidate Deep-Dive",
                      desc: "Resume, AI scores, skill gap breakdown, and bias flags all in one candidate view.",
                    },
                    {
                      icon: "bar_chart",
                      title: "Analytics Dashboard",
                      desc: "Time-to-hire, acceptance rates, diversity metrics, and top sourcing channels.",
                    },
                  ].map(({ icon, title, desc }) => (
                    <div
                      key={title}
                      className="flex gap-4 p-4 bg-surface-container-lowest rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {icon}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold font-headline text-on-surface mb-1">
                          {title}
                        </div>
                        <div className="text-sm text-on-surface-variant font-body">
                          {desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to={ROUTES.AUTH.REGISTER}
                  className="inline-block bg-primary text-on-primary px-8 py-4 rounded-xl font-headline font-bold hover:opacity-90 transition-all"
                >
                  Start Hiring
                </Link>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">
                    Pipeline: Senior Backend Engineer
                  </p>
                  <span className="text-xs font-label text-secondary font-bold">
                    12 candidates
                  </span>
                </div>
                {[
                  { stage: "Applied", count: 4, color: "bg-outline-variant" },
                  { stage: "Screening", count: 3, color: "bg-outline" },
                  { stage: "Matched", count: 3, color: "bg-secondary" },
                  { stage: "Interview", count: 1, color: "bg-secondary" },
                  { stage: "Offer", count: 1, color: "bg-primary-container" },
                ].map(({ stage, count, color }) => (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="text-xs font-label text-on-surface-variant w-20 shrink-0">
                      {stage}
                    </span>
                    <div className="flex-1 bg-surface-container rounded-full h-6 overflow-hidden">
                      <div
                        className={`${color} h-full rounded-full flex items-center px-2`}
                        style={{ width: `${(count / 12) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">
                          {count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* For Candidates */}
        <section id="for-candidates" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="bg-surface-container-low rounded-2xl p-6 shadow-xl space-y-3 order-2 lg:order-1">
                <p className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant mb-4">
                  Your Applications
                </p>
                {[
                  {
                    role: "Frontend Engineer",
                    company: "Acme Corp",
                    stage: "Matched",
                    score: "94%",
                  },
                  {
                    role: "React Developer",
                    company: "TechFlow",
                    stage: "Screening",
                    score: "81%",
                  },
                  {
                    role: "UI Engineer",
                    company: "BuildCo",
                    stage: "Applied",
                    score: null,
                  },
                ].map(({ role, company, stage, score }) => (
                  <div
                    key={role}
                    className="glass-panel flex items-center justify-between px-4 py-3 rounded-xl border border-white/20"
                  >
                    <div>
                      <div className="font-body font-semibold text-sm text-on-surface">
                        {role}
                      </div>
                      <div className="text-xs font-label text-on-surface-variant">
                        {company}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-secondary font-label">
                        {score ? `AI ${score}` : "Pending"}
                      </div>
                      <div className="text-xs font-label text-on-surface-variant">
                        {stage}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-secondary/10 rounded-xl border border-secondary/20">
                  <div className="flex items-center gap-2 text-sm font-body text-secondary">
                    <span className="material-symbols-outlined text-[16px]">
                      mail
                    </span>
                    New offer from Acme Corp, ready to sign
                  </div>
                </div>
              </div>
              <div className="space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 text-on-secondary-container text-xs font-bold tracking-widest uppercase font-label">
                  <span className="material-symbols-outlined text-[14px]">
                    person_search
                  </span>
                  For Candidates
                </div>
                <h2 className="text-4xl font-extrabold font-headline text-primary leading-tight">
                  Apply once. Track everything.
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      icon: "upload_file",
                      title: "Resume Upload",
                      desc: "Upload your PDF resume. Our AI scores it against live job descriptions instantly.",
                    },
                    {
                      icon: "track_changes",
                      title: "Application Tracker",
                      desc: "Follow every application from Applied through Screening, Interview, and Offer in real time.",
                    },
                    {
                      icon: "notifications",
                      title: "Instant Notifications",
                      desc: "Get notified the moment your status changes on mobile or web.",
                    },
                    {
                      icon: "draw",
                      title: "Mobile E-Sign",
                      desc: "Receive and sign your offer letter directly on your phone or browser.",
                    },
                  ].map(({ icon, title, desc }) => (
                    <div
                      key={title}
                      className="flex gap-4 p-4 bg-surface-container-low rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {icon}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold font-headline text-on-surface mb-1">
                          {title}
                        </div>
                        <div className="text-sm text-on-surface-variant font-body">
                          {desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to={ROUTES.AUTH.REGISTER}
                  className="inline-block bg-secondary text-on-secondary px-8 py-4 rounded-xl font-headline font-bold hover:opacity-90 transition-all"
                >
                  Create Your Profile
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto bg-surface-container-highest rounded-[2rem] p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary"></div>
            <h2 className="text-4xl lg:text-5xl font-extrabold font-headline text-primary mb-8 leading-tight">
              Ready to transform your hiring process?
            </h2>
            <p className="text-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
              Whether you're a recruiter building a team or a candidate looking
              for your next role, Vettly gets you there faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={ROUTES.AUTH.REGISTER}
                className="bg-primary text-on-primary px-10 py-5 rounded-xl font-headline font-bold text-xl hover:opacity-90 transition-all"
              >
                Get Started for Free
              </Link>
              <Link
                to={ROUTES.AUTH.LOGIN}
                className="bg-surface-container-lowest text-primary border border-outline-variant px-10 py-5 rounded-xl font-headline font-bold text-xl hover:bg-surface transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 w-full py-12 px-6 mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="col-span-1">
            <div className="text-lg font-black text-slate-900 font-headline mb-2">
              Vettly
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Smart recruitment platform with AI screening, bias detection, and
              e-sign, built for the modern hiring team.
            </p>
          </div>
          <div>
            <div className="text-slate-900 text-sm uppercase tracking-widest font-bold mb-6">
              Platform
            </div>
            <ul className="space-y-4">
              <li>
                <a
                  className="text-slate-500 hover:text-secondary transition-colors text-sm"
                  href="#for-recruiters"
                >
                  For Recruiters
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-secondary transition-colors text-sm"
                  href="#for-candidates"
                >
                  For Candidates
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-secondary transition-colors text-sm"
                  href="#how-it-works"
                >
                  How It Works
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-slate-900 text-sm uppercase tracking-widest font-bold mb-6">
              Legal
            </div>
            <ul className="space-y-4">
              <li>
                <a
                  className="text-slate-500 hover:text-secondary transition-colors text-sm"
                  href="#"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-secondary transition-colors text-sm"
                  href="#"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-slate-900 text-sm uppercase tracking-widest font-bold mb-6">
              Account
            </div>
            <ul className="space-y-4">
              <li>
                <Link
                  className="text-slate-500 hover:text-secondary transition-colors text-sm"
                  to={ROUTES.AUTH.LOGIN}
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-500 hover:text-secondary transition-colors text-sm"
                  to={ROUTES.AUTH.REGISTER}
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 flex justify-between items-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Vettly. Hire smarter. Get hired faster.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-slate-400">
              language
            </span>
            <span className="material-symbols-outlined text-slate-400">
              share
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
