'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useAnimationFrame, useMotionValue } from 'framer-motion';
import { ShieldCheck, Globe, Mail, Clock } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { useUser } from '@/contexts/UserContext';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { colors } from '@/app/styles/colors';
import { Logo } from '@/components/ui/Logo';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

type TeamMember = {
  name: string;
  role: string;
  linkedin: string;
  twitter: string;
  image: string;
};

type FundedUniversityLogo = {
  name: string;
  logo: string;
};

type ProcessStep = {
  step: string;
  title: string;
  content: string;
  image: string;
};

const team: TeamMember[] = [
  {
    name: 'Brian Armstrong',
    role: 'Cofounder/CEO',
    linkedin: 'https://www.linkedin.com/in/barmstrong/',
    twitter: 'https://x.com/brian_armstrong',
    image: '/team/brian.jpeg',
  },
  {
    name: 'Patrick Joyce',
    role: 'Cofounder/COO',
    linkedin: 'https://www.linkedin.com/in/patrick-joyce-396b953b/',
    twitter: 'https://x.com/patrickjoyce',
    image: '/team/joyce.jpeg',
  },
  {
    name: 'Kobe Attias',
    role: 'Founding Engineer',
    linkedin: 'https://www.linkedin.com/in/kobe-attias-5a9a9421/',
    twitter: 'https://x.com/kobeattias',
    image: '/team/kobe.png',
  },
];

/** One visual cycle for the marquee: Purdue → U Maryland → UC Irvine → Cornell → Stanford (repeated in DOM for seamless loop). */
const marqueeUniversityLogos: FundedUniversityLogo[] = [
  { name: 'Purdue University', logo: '/universities/purdue-university.svg' },
  {
    name: 'University of Maryland-Baltimore School of Medicine',
    logo: '/universities/university-of-maryland-som.svg',
  },
  { name: 'UC Irvine', logo: '/universities/uc-irvine.svg' },
  { name: 'Cornell University', logo: '/universities/cornell-university.svg' },
  { name: 'Stanford University', logo: '/universities/stanford-university.png' },
];

const processSteps: ProcessStep[] = [
  {
    step: '01',
    title: 'Public Preregistration',
    content: 'Researchers post study designs, methods, and hypotheses before experiments begin.',
    image: '/about/step-01.png',
  },
  {
    step: '02',
    title: 'Open Peer Critique',
    content: 'Expert peer scientists openly critique and improve those plans on ResearchHub.',
    image: '/about/step-02.png',
  },
  {
    step: '03',
    title: 'Capital Commitment',
    content: 'Funders commit capital at preregistration and track progress in real time.',
    image: '/about/step-03.png',
  },
  {
    step: '04',
    title: 'Linked Results',
    content: 'All results are published and permanently linked to each contribution.',
    image: '/about/step-04.png',
  },
];

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

const CiteSup = ({ num, citation }: { num: number; citation: string }) => (
  <sup className="group relative ml-0.5 cursor-help text-xs font-medium">
    {num}
    <span
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border bg-white p-3 text-left text-xs font-normal leading-relaxed opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
      style={{ color: colors.gray[600], borderColor: colors.gray[200] }}
    >
      {citation}
    </span>
  </sup>
);

const AboutPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { user, isLoading } = useUser();
  const { showAuthModal } = useAuthModalContext();
  const router = useRouter();

  const marqueeCycleStartRef = useRef<HTMLDivElement>(null);
  const marqueeX = useMotionValue(0);
  const MARQUEE_SPEED_PX_PER_MS = 0.038;

  useAnimationFrame((_, delta) => {
    const first = marqueeCycleStartRef.current;
    const second = first?.nextElementSibling as HTMLElement | null;
    if (!first || !second) return;
    const cycleWidth = second.offsetLeft - first.offsetLeft;
    if (cycleWidth <= 0) return;
    let x = marqueeX.get();
    x -= MARQUEE_SPEED_PX_PER_MS * delta;
    while (x <= -cycleWidth) {
      x += cycleWidth;
    }
    marqueeX.set(x);
  });

  const ctaLabel = useMemo(() => (user ? 'Explore' : 'Join Now'), [user]);
  const mobileCtaLabel = useMemo(() => (user ? 'Explore' : 'Join'), [user]);

  const onJoinClick = () => {
    if (user) {
      router.push('/fund/needs-funding');
      return;
    }
    showAuthModal();
  };

  const avatarUserIds = [4945925, 985028, 932947, 942542, 8116339];
  const avatarItems = avatarUserIds.map((authorId) => ({
    src: '',
    alt: `ResearchHub User ${authorId}`,
    authorId,
  }));

  return (
    <div
      className="min-h-screen overflow-x-hidden text-gray-900"
      style={{ backgroundColor: '#FDFDFD' }}
    >
      <nav
        className="fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-md"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', borderColor: colors.gray[100] }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 shrink items-center">
            <Logo size={34} />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="#problem"
              className="transition-colors hover:text-black"
              style={{ color: colors.gray[600] }}
            >
              The Problem
            </a>
            <a
              href="#mission"
              className="transition-colors hover:text-black"
              style={{ color: colors.gray[600] }}
            >
              Mission
            </a>
            <a
              href="#approach"
              className="transition-colors hover:text-black"
              style={{ color: colors.gray[600] }}
            >
              Pipeline
            </a>
            <a
              href="#team"
              className="transition-colors hover:text-black"
              style={{ color: colors.gray[600] }}
            >
              Team
            </a>
            <button
              type="button"
              onClick={onJoinClick}
              disabled={isLoading}
              className="rounded-full px-4 py-2 text-white transition-colors"
              style={{ backgroundColor: colors.rhBlue[500] }}
            >
              {isLoading ? 'Loading...' : ctaLabel}
            </button>
          </div>
          <button
            type="button"
            onClick={onJoinClick}
            disabled={isLoading}
            className="ml-3 shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold text-white transition-colors md:hidden"
            style={{ backgroundColor: colors.rhBlue[500] }}
          >
            {isLoading ? 'Loading...' : mobileCtaLabel}
          </button>
        </div>
        <div
          className="mx-auto flex h-9 max-w-7xl items-center gap-3 overflow-x-auto px-4 text-xs font-semibold sm:gap-4 sm:px-6 md:hidden"
          style={{ borderTop: `1px solid ${colors.gray[100]}`, color: colors.gray[600] }}
        >
          <a href="#problem" className="whitespace-nowrap transition-colors hover:text-black">
            The Problem
          </a>
          <a href="#mission" className="whitespace-nowrap transition-colors hover:text-black">
            Mission
          </a>
          <a href="#approach" className="whitespace-nowrap transition-colors hover:text-black">
            Pipeline
          </a>
          <a href="#team" className="whitespace-nowrap transition-colors hover:text-black">
            Team
          </a>
        </div>
      </nav>

      <section className="overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            <FadeIn>
              <div className="max-w-2xl">
                <h1 className="mb-5 text-[2rem] font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  About ResearchHub
                </h1>
                <p
                  className="text-[15px] leading-relaxed sm:text-lg md:text-xl"
                  style={{ color: colors.gray[600] }}
                >
                  ResearchHub is building a more open and reproducible model for funding science,
                  where study ideas can be examined earlier, expert criticism can improve the work
                  before resources are committed, and progress stays transparent from
                  preregistration through results so incentives are better aligned with rigor,
                  accountability, and scientific learning.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <div className="relative mx-auto w-full max-w-[560px]">
                <motion.div
                  className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border p-3 shadow-2xl sm:p-6"
                  style={{
                    borderColor: colors.gray[100],
                    background:
                      'linear-gradient(135deg, rgba(244,248,255,1) 0%, rgba(255,255,255,1) 42%, rgba(236,244,255,1) 100%)',
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55 }}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]">
                    <Image
                      src="/about/step-01.png"
                      alt="ResearchHub placeholder hero visual"
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/30 via-transparent to-white/20" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                      <div className="max-w-xs rounded-2xl border bg-white/88 px-4 py-3 shadow-lg backdrop-blur-sm">
                        <div
                          className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                          style={{ color: colors.rhBlue[500] }}
                        >
                          Temporary visual
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: colors.gray[700] }}>
                          Placeholder image for the about-page hero. We can replace this with a
                          custom PNG or illustration later.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <div className="mb-4 text-center">
              <p
                className="text-xs font-bold uppercase tracking-[0.24em] sm:text-sm"
                style={{ color: colors.gray[500] }}
              >
                Universities we&apos;ve funded
              </p>
            </div>
            <div className="relative overflow-hidden py-3 sm:py-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#FDFDFD] to-transparent sm:w-24" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#FDFDFD] to-transparent sm:w-24" />
              <motion.div
                className="flex w-max items-stretch gap-5 px-3 sm:gap-12 sm:px-8"
                style={{ x: marqueeX }}
              >
                <div
                  ref={marqueeCycleStartRef}
                  className="flex shrink-0 items-center gap-5 sm:gap-12"
                >
                  {marqueeUniversityLogos.map((uni) => (
                    <div
                      key={`${uni.name}-a`}
                      className="flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl border bg-white px-3 sm:h-28 sm:w-56 md:h-32 md:w-64"
                      style={{ borderColor: colors.gray[100] }}
                    >
                      <Image
                        src={uni.logo}
                        alt={uni.name}
                        width={220}
                        height={72}
                        className="max-h-12 w-full object-contain opacity-85 sm:max-h-16 md:max-h-[4.5rem]"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex shrink-0 items-center gap-5 sm:gap-12" aria-hidden>
                  {marqueeUniversityLogos.map((uni) => (
                    <div
                      key={`${uni.name}-b`}
                      className="flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl border bg-white px-3 sm:h-28 sm:w-56 md:h-32 md:w-64"
                      style={{ borderColor: colors.gray[100] }}
                    >
                      <Image
                        src={uni.logo}
                        alt=""
                        width={220}
                        height={72}
                        className="max-h-12 w-full object-contain opacity-85 sm:max-h-16 md:max-h-[4.5rem]"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section
        id="problem"
        className="py-12 sm:py-20 lg:py-24"
        style={{ backgroundColor: colors.gray[50] }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-14">
            <h2 className="mb-4 text-[1.75rem] font-bold italic leading-tight sm:text-3xl">
              When a measure becomes a target, it ceases to be a good measure
            </h2>
            <p
              className="mx-auto mb-4 max-w-2xl text-base italic sm:text-lg"
              style={{ color: colors.gray[500] }}
            >
              - Goodhart&apos;s Law
            </p>
            <p
              className="mx-auto max-w-2xl text-base leading-relaxed sm:text-lg"
              style={{ color: colors.gray[600] }}
            >
              Science rewards publication count, journal prestige, and citation metrics — not
              whether findings hold up. When careers depend on novel, positive results, rigor
              becomes a liability and reproducibility collapses.
            </p>
          </div>
          <div className="grid gap-4 sm:gap-8 md:grid-cols-3">
            <FadeIn delay={0}>
              <div
                className="flex min-h-[200px] flex-col rounded-2xl border bg-white p-5 text-center transition-shadow hover:shadow-xl sm:min-h-[210px] sm:p-8"
                style={{ borderColor: colors.gray[100] }}
              >
                <div
                  className="mb-2 text-3xl font-extrabold sm:text-4xl"
                  style={{ color: colors.rhBlue[500] }}
                >
                  85%
                </div>
                <div className="mb-3 text-lg font-bold">
                  Research Waste
                  <CiteSup
                    num={1}
                    citation="Chalmers I, Glasziou P. Avoidable waste in the production and reporting of research evidence. The Lancet. 2009;374(9683):86–89."
                  />
                </div>
                <p className="mt-auto text-sm leading-relaxed" style={{ color: colors.gray[500] }}>
                  An estimated 85% of biomedical research investment is avoidably wasted due to poor
                  study design, non-publication of results, and inadequate reporting.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <div
                className="flex min-h-[200px] flex-col rounded-2xl border bg-white p-5 text-center transition-shadow hover:shadow-xl sm:min-h-[210px] sm:p-8"
                style={{ borderColor: colors.gray[100] }}
              >
                <div
                  className="mb-2 text-3xl font-extrabold sm:text-4xl"
                  style={{ color: colors.rhBlue[500] }}
                >
                  70%+
                </div>
                <div className="mb-3 text-lg font-bold">
                  Can&apos;t Reproduce
                  <CiteSup
                    num={2}
                    citation="Baker M. 1,500 scientists lift the lid on reproducibility. Nature. 2016;533(7604):452–454."
                  />
                </div>
                <p className="mt-auto text-sm leading-relaxed" style={{ color: colors.gray[500] }}>
                  More than 70% of researchers have tried and failed to reproduce another
                  scientist&apos;s experiments, and over half could not reproduce their own.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.16}>
              <div
                className="flex min-h-[200px] flex-col rounded-2xl border bg-white p-5 text-center transition-shadow hover:shadow-xl sm:min-h-[210px] sm:p-8"
                style={{ borderColor: colors.gray[100] }}
              >
                <div
                  className="mb-2 text-3xl font-extrabold sm:text-4xl"
                  style={{ color: colors.rhBlue[500] }}
                >
                  $28B
                </div>
                <div className="mb-3 text-lg font-bold">
                  Lost Per Year in the US
                  <CiteSup
                    num={3}
                    citation="Freedman LP, Cockburn IM, Simcoe TS. The Economics of Reproducibility in Preclinical Research. PLOS Biology. 2015;13(6):e1002165."
                  />
                </div>
                <p className="mt-auto text-sm leading-relaxed" style={{ color: colors.gray[500] }}>
                  The US alone spends an estimated $28 billion per year on preclinical research that
                  cannot be reproduced.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section id="mission" className="px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl sm:mb-14">
            <h2 className="mb-4 text-[1.75rem] font-bold leading-tight sm:text-3xl">
              Our Commitment to Open Science
            </h2>
            <p className="text-base leading-relaxed sm:text-lg" style={{ color: colors.gray[600] }}>
              ResearchHub is designed so proposals, critique, and outcomes stay visible: open access
              by default, expert review that can be evaluated on its merits, and funding tied to
              preregistrations and updates that others can follow.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <FadeIn>
              <div
                className="flex h-full flex-col rounded-2xl border bg-white p-6 sm:p-8"
                style={{ borderColor: colors.gray[200] }}
              >
                <div
                  className="mb-4 w-fit rounded-lg p-3"
                  style={{ backgroundColor: colors.rhBlue[50], color: colors.rhBlue[500] }}
                >
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold sm:text-xl">Open access preregistrations</h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.gray[600] }}>
                  Study plans are shared early so methods and claims can be scrutinized before work
                  is fully underway, with preregistrations open by default.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.06}>
              <div
                className="flex h-full flex-col rounded-2xl border bg-white p-6 sm:p-8"
                style={{ borderColor: colors.gray[200] }}
              >
                <div
                  className="mb-4 w-fit rounded-lg p-3"
                  style={{ backgroundColor: colors.rhBlue[50], color: colors.rhBlue[500] }}
                >
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold sm:text-xl">Unblinded expert review</h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.gray[600] }}>
                  Peer critique happens in the open so reviewers are accountable and researchers can
                  respond to substantive feedback before funding decisions.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <div
                className="flex h-full flex-col rounded-2xl border bg-white p-6 sm:p-8 sm:col-span-2 lg:col-span-1"
                style={{ borderColor: colors.gray[200] }}
              >
                <div
                  className="mb-4 w-fit rounded-lg p-3"
                  style={{ backgroundColor: colors.rhBlue[50], color: colors.rhBlue[500] }}
                >
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold sm:text-xl">Transparent progress updates</h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.gray[600] }}>
                  Fundraising and research progress are documented so supporters can see what
                  changed and what was delivered—not just a final headline.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section
        id="approach"
        className="overflow-x-hidden px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl sm:mb-12">
            <h2 className="mb-4 text-[1.75rem] font-bold leading-tight sm:text-3xl lg:text-4xl">
              Our Open Science Funding Pipeline
            </h2>
            <p className="text-base leading-relaxed sm:text-lg" style={{ color: colors.gray[600] }}>
              We designed the model so funding happens earlier, with open critique and public
              accountability built into each stage of the process.
            </p>
          </div>
          <div className="grid items-start gap-10 sm:gap-16 lg:grid-cols-2 lg:items-end">
            <div>
              <div className="space-y-5 sm:space-y-6">
                {processSteps.map((item, idx) => (
                  <motion.div
                    key={item.step}
                    className="group flex cursor-pointer gap-3 sm:gap-6"
                    onHoverStart={() => setActiveStep(idx)}
                    onClick={() => setActiveStep(idx)}
                  >
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base font-bold transition-all sm:h-12 sm:w-12 sm:text-lg"
                      style={{
                        backgroundColor:
                          activeStep === idx ? colors.rhBlue[500] : colors.rhBlue[50],
                        color: activeStep === idx ? '#FFFFFF' : colors.rhBlue[500],
                        boxShadow:
                          activeStep === idx ? `0 12px 30px ${colors.rhBlue[200]}` : 'none',
                      }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h4 className="mb-1 text-base font-bold sm:text-lg">{item.title}</h4>
                      <p className="text-sm" style={{ color: colors.gray[600] }}>
                        {item.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-6 lg:mt-0">
              <div
                className="relative aspect-[15/10] overflow-hidden rounded-3xl border shadow-2xl sm:aspect-[15/8]"
                style={{ borderColor: colors.gray[100], backgroundColor: '#FFFFFF' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    className="absolute inset-3 sm:inset-4"
                    style={{
                      backgroundImage: `url(${processSteps[activeStep].image})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  />
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
                  <motion.div
                    key={`step-content-${activeStep}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-white"
                  >
                    <div
                      className="mb-1 text-[10px] font-bold sm:text-xs"
                      style={{ color: colors.rhBlue[200] }}
                    >
                      STEP {processSteps[activeStep].step}
                    </div>
                    <div className="text-base font-bold sm:text-lg">
                      {processSteps[activeStep].title}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid items-center gap-8 border-t border-gray-200 pt-10 sm:mt-24 sm:gap-12 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <FadeIn>
                <div
                  className="rounded-[2rem] border bg-white p-6 shadow-sm sm:p-10"
                  style={{ borderColor: colors.gray[100] }}
                >
                  <p
                    className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-xs"
                    style={{ color: colors.rhBlue[500] }}
                  >
                    Partner feedback
                  </p>
                  <blockquote
                    className="mb-6 text-lg font-semibold leading-snug sm:text-xl"
                    style={{ color: colors.gray[900] }}
                  >
                    &ldquo;We saw about a one-week turnaround from campaign support to university
                    processing—fast enough to matter for our team&apos;s planning.&rdquo;
                  </blockquote>
                  <div className="flex flex-col gap-1 border-t pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div>
                      <div className="text-base font-bold">Dr. Ruslan Rust</div>
                      <div className="text-sm" style={{ color: colors.gray[600] }}>
                        University of Southern California
                      </div>
                    </div>
                    <div className="text-xs font-medium" style={{ color: colors.gray[500] }}>
                      Shared with permission
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.08}>
                <div
                  className="relative overflow-hidden rounded-[2rem] border bg-white p-4 shadow-xl sm:p-6"
                  style={{ borderColor: colors.gray[100] }}
                >
                  <div
                    className="mb-3 text-xs font-bold uppercase tracking-wide"
                    style={{ color: colors.gray[500] }}
                  >
                    Inside the product
                  </div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
                    <Image
                      src="/about/step-01.png"
                      alt="ResearchHub product interface preview used on the about page"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: colors.gray[600] }}>
                    Preregistrations, critique, and fundraising activity stay connected in one place
                    so the story of a study is easier to follow than a patchwork of PDFs and emails.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <section
        id="proof"
        className="relative overflow-hidden px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        style={{ backgroundColor: colors.rhBlue[500] }}
      >
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4" /> Nonprofit Partner
              </div>
              <h2 className="mb-4 text-[1.75rem] font-bold leading-tight sm:mb-6 sm:text-3xl lg:text-4xl">
                Endaoment 501(c)(3) Nonprofit
              </h2>
              <p className="mb-6 text-base leading-relaxed text-blue-100 sm:mb-8 sm:text-lg">
                We partner with Endaoment, a leading 501(c)(3) nonprofit, to process fundraises into
                cash donations to universities.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="mb-1 font-bold">Transparent Distribution</div>
                    <p className="text-sm text-blue-200">
                      Funds land as discretionary gifts with low to no overhead fees.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="mb-1 font-bold">Maximally Open and No Strings Attached</div>
                    <p className="text-sm text-blue-200">
                      We reduce funder bias by keeping preregistration, critique, and outcomes open.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8 md:p-12">
                <Image
                  src="/logos/endaoment_color.svg"
                  alt="Endaoment"
                  width={220}
                  height={64}
                  className="mx-auto mb-6 h-14 w-auto sm:mb-8 sm:h-16"
                />
                <div
                  className="mb-2 text-4xl font-extrabold sm:text-5xl lg:text-6xl"
                  style={{ color: colors.rhBlue[500] }}
                >
                  $124M+
                </div>
                <div className="mb-2 text-lg font-bold" style={{ color: colors.gray[900] }}>
                  Distributed by Endaoment
                </div>
                <p className="text-sm" style={{ color: colors.gray[600] }}>
                  Endaoment has facilitated over $124 million in charitable donations, providing
                  proven infrastructure and credibility.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      </section>

      <section id="team" className="px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center sm:mb-14">
            <h2 className="mb-4 text-[1.75rem] font-bold sm:text-3xl">The Team</h2>
            <p style={{ color: colors.gray[600] }}>
              A dedicated group of mission-driven builders and operators advancing scientific
              progress.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {team.map((member, idx) => (
              <FadeIn key={member.name} delay={idx * 0.04}>
                <div className="group">
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      className="absolute inset-0 transition-colors"
                      style={{ backgroundColor: `${colors.rhBlue[500]}1A` }}
                    />
                  </div>
                  <h4 className="mb-1 text-lg font-bold">{member.name}</h4>
                  <p
                    className="mb-3 text-xs font-bold uppercase"
                    style={{ color: colors.rhBlue[500] }}
                  >
                    {member.role}
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                      style={{ backgroundColor: colors.rhBlue[500] }}
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <FontAwesomeIcon icon={faLinkedin} className="h-4 w-4" />
                    </a>
                    <a
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors"
                      aria-label={`${member.name} X`}
                    >
                      <FontAwesomeIcon icon={faXTwitter} className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="funders" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] p-5 text-center text-white shadow-2xl sm:rounded-[2.5rem] sm:p-10 md:p-20"
          style={{
            backgroundColor: colors.rhBlue[500],
            boxShadow: `0 32px 64px ${colors.rhBlue[200]}`,
          }}
        >
          <div className="relative z-10">
            <h2 className="mb-4 text-2xl font-bold leading-tight sm:mb-6 sm:text-4xl md:text-5xl">
              Get involved with ResearchHub
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-base text-blue-100 sm:mb-10 sm:text-lg">
              Whether you&apos;re exploring funding, collaboration, or just want to learn more,
              we&apos;d love to hear from you.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href="mailto:hello@researchhub.com"
                className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-base font-bold shadow-xl transition-colors hover:bg-blue-50 sm:w-auto sm:max-w-none sm:px-10 sm:py-5 sm:text-lg"
                style={{ color: colors.rhBlue[500] }}
              >
                Email us <Mail className="h-5 w-5" />
              </a>
              <button
                type="button"
                onClick={onJoinClick}
                disabled={isLoading}
                className="w-full max-w-sm rounded-2xl border px-5 py-3.5 text-base font-bold transition-colors sm:w-auto sm:max-w-none sm:px-10 sm:py-5 sm:text-lg"
                style={{ backgroundColor: colors.rhBlue[700], borderColor: colors.rhBlue[400] }}
              >
                {isLoading ? 'Loading...' : user ? 'Explore' : 'Join Now'}
              </button>
            </div>
            <div className="mt-10 flex flex-col items-center gap-4 sm:mt-12">
              <AvatarStack
                items={avatarItems}
                size="sm"
                maxItems={5}
                spacing={-8}
                showLabel={false}
                disableTooltip
                ringColorClass="ring-white"
              />
              <p className="text-sm text-blue-100">Join 5,000+ verified researchers and funders</p>
            </div>
          </div>
          <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-white/5" />
        </div>
      </section>

      <LandingPageFooter />
    </div>
  );
};

export default AboutPage;
