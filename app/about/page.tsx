'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Globe,
  ExternalLink,
  Mail,
  ArrowRight,
  Clock,
  DollarSign,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { useUser } from '@/contexts/UserContext';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { colors } from '@/app/styles/colors';
import { Logo } from '@/components/ui/Logo';
import { AvatarStack } from '@/components/ui/AvatarStack';

type TeamMember = {
  name: string;
  role: string;
  linkedin: string;
  twitter: string;
  image: string;
};

type UniversityCard = {
  name: string;
  logo?: string;
  amount: string;
  project: string;
};

type BenefitCard = {
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ReactNode;
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
    name: 'Tyler Diorio, PhD',
    role: 'Chief of Staff',
    linkedin: 'https://linkedin.com/in/tylerdiorio',
    twitter: 'https://x.com/tylerdiorio',
    image: '/team/brian.jpeg',
  },
  {
    name: 'Kobe Attias',
    role: 'Founding Engineer',
    linkedin: 'https://www.linkedin.com/in/kobe-attias-5a9a9421/',
    twitter: 'https://x.com/kobeattias',
    image: '/team/kobe.png',
  },
  {
    name: 'Taki Koustomitis',
    role: 'Founding Engineer',
    linkedin: 'https://linkedin.com/in/takikoustomitis',
    twitter: 'https://x.com/takikoustomitis',
    image: '/team/joyce.jpeg',
  },
  {
    name: 'Gregor Zurowski',
    role: 'Senior Backend Engineer',
    linkedin: 'https://linkedin.com/in/gregorzurowski',
    twitter: 'https://x.com/gregorzurowski',
    image: '/team/kobe.png',
  },
];

const fundedUniversities: UniversityCard[] = [
  {
    name: 'UC San Diego',
    logo: '/universities/uc-san-diego.svg',
    amount: '$300K',
    project:
      'Investigating the Neural and Cerebrovascular Effects of the Wim Hof Breathing Technique: Implications for Glymphatic Function and Brain Waste Clearance',
  },
  {
    name: 'UC Irvine',
    logo: '/universities/uc-irvine.svg',
    amount: '$300K',
    project: 'Brain Hyper Scanning in Fibromyalgia',
  },
  {
    name: 'Stanford University',
    logo: '/universities/stanford-university.png',
    amount: '$25K',
    project: 'Changes in circuits of motivation following fentanyl addiction',
  },
  {
    name: 'Purdue University',
    logo: '/universities/purdue-university.svg',
    amount: '$5K',
    project:
      'DNA Tetrahedra-Lipids Complex Design Optimization for Efficient Blood-Brain Barrier Cellular Uptake',
  },
  {
    name: 'University of Maryland-Baltimore School of Medicine',
    logo: '/universities/university-of-maryland-som.svg',
    amount: '$5K',
    project:
      'Mast cell-induced B-cell class switching regulates CNS immunoglobulin diversity during postnatal brain development',
  },
  {
    name: 'Albert Einstein College of Medicine',
    logo: '/universities/purdue-university.svg',
    amount: '$5K',
    project:
      "Cerebrovascular Disease Underlying White Matter Pathology in Alzheimer's Disease with and without a History of COVID-19",
  },
  {
    name: 'UC Davis',
    logo: '/universities/uc-irvine.svg',
    amount: '$150K',
    project: 'Effects of Neuromodulatory Stimulation on Endogenous Psychedelics',
  },
  {
    name: 'Cornell University',
    logo: '/universities/cornell-university.svg',
    amount: '$5K',
    project: 'Impact of PCOS status on ovulatory and metabolic changes with weight loss',
  },
];

const benefits: BenefitCard[] = [
  {
    title: 'Days to Weeks',
    subtitle: 'Not Months to Years',
    desc: 'Faster capital distribution to researchers with matching funds based on community interest.',
    icon: <Clock className="h-6 w-6" />,
  },
  {
    title: 'Low to No Overhead',
    subtitle: 'From Universities',
    desc: 'Funds land as discretionary for researchers with minimal institutional fees.',
    icon: <DollarSign className="h-6 w-6" />,
  },
  {
    title: '$150 Paid Reviews',
    subtitle: 'Before Funding',
    desc: 'Expert peer review on proposals before allocation to increase downstream reproducibility.',
    icon: <ShieldCheck className="h-6 w-6" />,
  },
  {
    title: 'Open Access (CC0)',
    subtitle: '100% Transparent',
    desc: 'All results are published under a maximally open CC0 license with real-time progress updates.',
    icon: <Globe className="h-6 w-6" />,
  },
];

const processSteps: ProcessStep[] = [
  {
    step: '01',
    title: 'Public Preregistration',
    content: 'Researchers post study designs, methods, and hypotheses before experiments begin.',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
  },
  {
    step: '02',
    title: 'Open Peer Critique',
    content: 'Expert peer scientists openly critique and improve those plans on ResearchHub.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
  },
  {
    step: '03',
    title: 'Capital Commitment',
    content: 'Funders commit capital at preregistration and track progress in real time.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    step: '04',
    title: 'Linked Results',
    content: 'All results are published and permanently linked to each contribution.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
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

const AboutPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { user, isLoading } = useUser();
  const { showAuthModal } = useAuthModalContext();
  const router = useRouter();

  const ctaLabel = useMemo(() => (user ? 'Explore' : 'Join Now'), [user]);

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
  const heroExpertItems = avatarItems.slice(0, 3);
  const heroFunderItems = Array.from({ length: 18 }, (_, idx) => {
    const authorId = avatarUserIds[idx % avatarUserIds.length];
    return {
      src: '',
      alt: `Funder ${idx + 1}`,
      authorId,
    };
  });

  return (
    <div className="min-h-screen text-gray-900" style={{ backgroundColor: '#FDFDFD' }}>
      <nav
        className="fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-md"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', borderColor: colors.gray[100] }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Logo size={38} />
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
              href="#solution"
              className="transition-colors hover:text-black"
              style={{ color: colors.gray[600] }}
            >
              Our Approach
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
        </div>
      </nav>

      <section className="overflow-hidden px-6 pb-20 pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight lg:text-7xl">
                A Better Way to <br />
                <span style={{ color: colors.rhBlue[500] }}>Fund Research.</span>
              </h1>
              <p
                className="mb-8 max-w-xl text-xl leading-relaxed"
                style={{ color: colors.gray[600] }}
              >
                At ResearchHub, we help you fund research that is transparent, reproducible, and
                accountable. Move from funding and praying to real-time impact tracking.
              </p>
              <div className="mb-8 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-3 text-sm font-medium sm:grid-cols-2">
                <div className="flex items-center gap-2" style={{ color: colors.gray[700] }}>
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: colors.rhBlue[500] }}
                  />
                  3,000+ researchers and funders
                </div>
                <div className="flex items-center gap-2" style={{ color: colors.gray[700] }}>
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: colors.rhBlue[500] }}
                  />
                  10-day open, paid peer review
                </div>
                <div className="flex items-center gap-2" style={{ color: colors.gray[700] }}>
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: colors.rhBlue[500] }}
                  />
                  Low to no overhead fees
                </div>
                <div className="flex items-center gap-2" style={{ color: colors.gray[700] }}>
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: colors.rhBlue[500] }}
                  />
                  Fast applications and processing
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={onJoinClick}
                  className="flex items-center gap-2 rounded-xl px-8 py-4 font-bold text-white shadow-lg"
                  style={{
                    backgroundColor: colors.gray[900],
                    boxShadow: `0 16px 40px ${colors.gray[200]}`,
                  }}
                >
                  {user ? 'Explore Marketplace' : 'Join Now'} <ArrowRight className="h-5 w-5" />
                </button>
                <a
                  href="mailto:tyler@researchhub.foundation"
                  className="rounded-xl border bg-white px-8 py-4 font-bold transition-colors hover:bg-gray-50"
                  style={{ borderColor: colors.gray[200], color: colors.gray[900] }}
                >
                  Request a Demo
                </a>
              </div>
            </FadeIn>

            <div className="relative">
              <FadeIn delay={0.2}>
                <div
                  className="group relative z-10 overflow-hidden rounded-3xl border bg-white p-8 shadow-2xl"
                  style={{ borderColor: colors.gray[100] }}
                >
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                    <div className="min-w-0 flex-1">
                      <div className="mb-4 flex items-center gap-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full"
                          style={{ backgroundColor: colors.rhBlue[100] }}
                        >
                          <Image
                            src="/people/ruslan.jpeg"
                            alt="USC lead researcher"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold">University of Southern California</h3>
                          <p className="text-sm" style={{ color: colors.gray[500] }}>
                            Effects of psilocybin and related compounds on neuroprotection in human
                            stroke
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div
                          className="h-2 overflow-hidden rounded-full"
                          style={{ backgroundColor: colors.gray[100] }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                            transition={{ duration: 1.5 }}
                            className="h-full"
                            style={{ backgroundColor: colors.rhBlue[500] }}
                          />
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <span>$15,000 raised</span>
                          <span style={{ color: colors.rhBlue[500] }}>100% of Goal</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 sm:w-44">
                      <Image
                        src="/people/psilocybin-preregistration.png"
                        alt="Preregistration visual"
                        width={360}
                        height={260}
                        className="h-32 w-full rounded-xl border object-cover"
                        style={{ borderColor: colors.gray[100] }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div
                      className="flex flex-col justify-start rounded-xl border p-3"
                      style={{ backgroundColor: colors.gray[50], borderColor: colors.gray[100] }}
                    >
                      <div
                        className="mb-2 text-xs font-bold uppercase"
                        style={{ color: colors.gray[500] }}
                      >
                        Preregistration
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                        <ShieldCheck className="h-4 w-4" /> Verified
                      </div>
                    </div>
                    <div
                      className="flex flex-col justify-between rounded-xl border p-3"
                      style={{ backgroundColor: colors.gray[50], borderColor: colors.gray[100] }}
                    >
                      <div
                        className="mb-2 text-xs font-bold uppercase"
                        style={{ color: colors.gray[500] }}
                      >
                        Peer Reviews
                      </div>
                      <div className="mb-2">
                        <AvatarStack
                          items={heroExpertItems}
                          size="xs"
                          maxItems={3}
                          spacing={-6}
                          showExtraCount={false}
                          showLabel={false}
                        />
                      </div>
                    </div>
                    <div
                      className="flex flex-col justify-between rounded-xl border p-3"
                      style={{ backgroundColor: colors.gray[50], borderColor: colors.gray[100] }}
                    >
                      <div
                        className="mb-2 text-xs font-bold uppercase"
                        style={{ color: colors.gray[500] }}
                      >
                        Funders
                      </div>
                      <div className="mb-2">
                        <AvatarStack
                          items={heroFunderItems}
                          size="xs"
                          maxItems={6}
                          spacing={-6}
                          showExtraCount={true}
                          totalItemsCount={18}
                          allItems={heroFunderItems}
                          extraCountLabel="Funders"
                          showLabel={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute -right-12 -top-12 -z-10 h-64 w-64 rounded-full blur-3xl"
                  style={{ backgroundColor: `${colors.rhBlue[400]}20` }}
                />
                <div
                  className="absolute -bottom-12 -left-12 -z-10 h-64 w-64 rounded-full blur-3xl"
                  style={{ backgroundColor: `${colors.primary[700]}20` }}
                />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="py-24" style={{ backgroundColor: colors.gray[50] }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Why the Status Quo Fails</h2>
            <p className="mx-auto max-w-2xl text-lg" style={{ color: colors.gray[600] }}>
              Current scientific funding models are slow, opaque, and prioritize novelty over truth.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                stat: '50%+',
                label: 'Replication Crisis',
                sub: 'of biomedical findings cannot be reproduced by other labs.',
              },
              {
                stat: '50%+',
                label: 'Invisible Outcomes',
                sub: 'of funded studies are never reported, especially negative results.',
              },
              {
                stat: '$200B',
                label: 'Wasted Per Year',
                sub: 'due to duplication, opaque reporting, and irreproducible work.',
              },
            ].map((item, idx) => (
              <FadeIn key={item.label} delay={idx * 0.08}>
                <div
                  className="rounded-2xl border bg-white p-8 text-center transition-shadow hover:shadow-xl"
                  style={{ borderColor: colors.gray[100] }}
                >
                  <div
                    className="mb-2 text-4xl font-extrabold"
                    style={{ color: colors.rhBlue[500] }}
                  >
                    {item.stat}
                  </div>
                  <div className="mb-3 text-lg font-bold">{item.label}</div>
                  <p className="text-sm leading-relaxed" style={{ color: colors.gray[500] }}>
                    {item.sub}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="solution" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-8 text-4xl font-bold leading-tight">
                Our Fix: <br />
                Preregistration-Based Funding
              </h2>
              <div className="space-y-6">
                {processSteps.map((item, idx) => (
                  <motion.div
                    key={item.step}
                    className="group flex cursor-pointer gap-6"
                    onHoverStart={() => setActiveStep(idx)}
                    onClick={() => setActiveStep(idx)}
                  >
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold transition-all"
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
                      <h4 className="mb-1 text-lg font-bold">{item.title}</h4>
                      <p className="text-sm" style={{ color: colors.gray[600] }}>
                        {item.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="sticky top-24">
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-3xl border shadow-2xl"
                style={{ borderColor: colors.gray[100], backgroundColor: colors.gray[900] }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${processSteps[activeStep].image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.45 }}
                  />
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <motion.div
                    key={`step-content-${activeStep}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-white"
                  >
                    <div className="mb-1 text-xs font-bold" style={{ color: colors.rhBlue[200] }}>
                      STEP {processSteps[activeStep].step}
                    </div>
                    <div className="text-lg font-bold">{processSteps[activeStep].title}</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">What You Gain</h2>
            <p className="mx-auto max-w-2xl" style={{ color: colors.gray[600] }}>
              Transforming platform costs into direct incentives that accelerate science and
              maximize philanthropic impact.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, idx) => (
              <FadeIn key={benefit.title} delay={idx * 0.05}>
                <div
                  className="flex h-full min-h-[250px] flex-col rounded-2xl border bg-white p-8 transition-all hover:shadow-lg"
                  style={{ borderColor: colors.gray[200] }}
                >
                  <div
                    className="mb-4 w-fit rounded-lg p-3"
                    style={{ backgroundColor: colors.rhBlue[50], color: colors.rhBlue[500] }}
                  >
                    {benefit.icon}
                  </div>
                  <h4 className="mb-1 min-h-[64px] text-2xl font-bold">{benefit.title}</h4>
                  <div
                    className="mb-3 min-h-[16px] text-xs font-bold uppercase"
                    style={{ color: colors.rhBlue[500] }}
                  >
                    {benefit.subtitle}
                  </div>
                  <p
                    className="mt-auto text-sm leading-relaxed"
                    style={{ color: colors.gray[600] }}
                  >
                    {benefit.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden px-6 py-24 text-white"
        style={{ backgroundColor: colors.rhBlue[500] }}
      >
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4" /> Nonprofit Partner
              </div>
              <h2 className="mb-6 text-4xl font-bold">Partnership with Endaoment</h2>
              <p className="mb-8 text-lg leading-relaxed text-blue-100">
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
              <div className="rounded-3xl bg-white p-12 text-center shadow-2xl">
                <Image
                  src="/logos/endaoment_color.svg"
                  alt="Endaoment"
                  width={220}
                  height={64}
                  className="mx-auto mb-8 h-16 w-auto"
                />
                <div className="mb-2 text-6xl font-extrabold" style={{ color: colors.rhBlue[500] }}>
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

      <section className="overflow-hidden px-6 py-24" style={{ backgroundColor: colors.gray[50] }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
            <div>
              <h2 className="mb-4 text-3xl font-bold">Universities We&apos;ve Funded</h2>
              <p style={{ color: colors.gray[600] }}>
                Supporting high-impact research at leading institutions worldwide.
              </p>
            </div>
            <Link
              href="/fund/needs-funding"
              className="flex items-center gap-2 font-bold hover:underline"
              style={{ color: colors.rhBlue[500] }}
            >
              View all projects <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {fundedUniversities.map((uni, idx) => (
              <FadeIn key={uni.name} delay={idx * 0.07}>
                <div
                  className="flex w-full flex-col rounded-2xl border bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
                  style={{ borderColor: colors.gray[100] }}
                >
                  <div className="mb-4 flex h-12 items-center justify-center">
                    <Image
                      src={uni.logo || '/universities/cornell-university.svg'}
                      alt={uni.name}
                      width={240}
                      height={64}
                      className="h-12 w-full object-contain"
                    />
                  </div>
                  <h4 className="mb-2 h-12 overflow-hidden text-ellipsis font-bold">{uni.name}</h4>
                  <p
                    className="mb-4 h-[90px] overflow-hidden text-xs leading-relaxed"
                    style={{
                      color: colors.gray[500],
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {uni.project}
                  </p>
                  <div
                    className="mt-2 text-lg font-extrabold"
                    style={{ color: colors.rhBlue[500] }}
                  >
                    {uni.amount}
                  </div>
                  <div
                    className="mt-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: colors.gray[400] }}
                  >
                    Disbursed
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">The Team</h2>
            <p style={{ color: colors.gray[600] }}>
              A dedicated group of mission-driven builders and operators advancing scientific
              progress.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
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

      <section id="funders" className="px-6 py-24">
        <div
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] p-12 text-center text-white shadow-2xl md:p-20"
          style={{
            backgroundColor: colors.rhBlue[500],
            boxShadow: `0 32px 64px ${colors.rhBlue[200]}`,
          }}
        >
          <div className="relative z-10">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Ready to Shape the Future of Science?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100">
              We are partnering with visionary philanthropists, foundations, and research-aligned
              donors to build a more reproducible world.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="mailto:tyler@researchhub.foundation"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-10 py-5 text-lg font-bold shadow-xl transition-colors hover:bg-blue-50 sm:w-auto"
                style={{ color: colors.rhBlue[500] }}
              >
                Email Tyler Diorio <Mail className="h-5 w-5" />
              </a>
              <button
                type="button"
                onClick={onJoinClick}
                disabled={isLoading}
                className="w-full rounded-2xl border px-10 py-5 text-lg font-bold transition-colors sm:w-auto"
                style={{ backgroundColor: colors.rhBlue[700], borderColor: colors.rhBlue[400] }}
              >
                {isLoading ? 'Loading...' : user ? 'Explore' : 'Join Now'}
              </button>
            </div>
            <div className="mt-12 flex flex-col items-center gap-4">
              <AvatarStack
                items={avatarItems}
                size="sm"
                maxItems={5}
                spacing={-8}
                showLabel={false}
                disableTooltip
                ringColorClass="ring-white"
              />
              <p className="text-sm text-blue-100">Join 3,000+ verified researchers and funders</p>
            </div>
          </div>
          <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-white/5" />
        </div>
      </section>

      <footer
        className="border-t py-12 text-center text-sm"
        style={{ borderColor: colors.gray[100] }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <Logo noText size={20} />
            <span className="font-bold" style={{ color: colors.gray[900] }}>
              ResearchHub
            </span>
          </Link>
          <div className="flex gap-8" style={{ color: colors.gray[500] }}>
            <Link href="/privacy" className="hover:opacity-80">
              Privacy
            </Link>
            <Link href="/terms" className="hover:opacity-80">
              Terms
            </Link>
            <span>Open Access (CC0)</span>
          </div>
          <div className="text-xs" style={{ color: colors.gray[500] }}>
            {`© ${new Date().getFullYear()} ResearchHub Foundation. Partnered with Endaoment (501c3).`}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
