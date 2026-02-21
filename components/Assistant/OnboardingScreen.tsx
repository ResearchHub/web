'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Bot,
  Megaphone,
  Users,
  Wallet,
  Lightbulb,
  PenTool,
  Star,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import type { AssistantRole } from '@/types/assistant';

interface OnboardingScreenProps {
  onSelectRole: (role: AssistantRole) => void;
  isLoading?: boolean;
}

interface StepItem {
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
  extra?: string;
}

interface RoleCardProps {
  persona: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  steps: StepItem[];
  onClick: () => void;
  accentColor: string;
  accentColorLight: string;
  accentBg: string;
  accentBorder: string;
  delay: number;
  disabled?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Floating particle                                                  */
/* ------------------------------------------------------------------ */
const FloatingParticle: React.FC<{
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
  color: string;
}> = ({ size, x, y, delay, duration, color }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: color,
      opacity: 0,
      animation: `assistantFloat ${duration}s ease-in-out ${delay}s infinite`,
    }}
  />
);

/* ------------------------------------------------------------------ */
/*  Animated sparkle                                                   */
/* ------------------------------------------------------------------ */
const AnimatedSparkle: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative ${className ?? ''}`}>
    <Sparkles size={18} className="relative z-10" />
    <div
      className="absolute inset-0 rounded-full blur-md"
      style={{
        background: 'linear-gradient(135deg, #818cf8, #6366f1)',
        animation: 'assistantPulseGlow 2s ease-in-out infinite',
      }}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Collapsible "How it works"                                         */
/* ------------------------------------------------------------------ */
const HowItWorks: React.FC<{
  steps: StepItem[];
  accentColor: string;
  accentColorLight: string;
}> = ({ steps, accentColor, accentColorLight }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full mb-6">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        Learn more
        <ChevronDown
          size={13}
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? '300px' : '0px',
          opacity: open ? 1 : 0,
          marginTop: open ? '12px' : '0px',
        }}
      >
        <div className="relative">
          <div
            className="absolute left-[11px] top-[12px] w-0.5"
            style={{
              bottom: `${steps.length > 1 ? 28 : 0}px`,
              background: accentColorLight,
            }}
          />
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-start gap-3">
                <div
                  className="relative flex-shrink-0 w-[23px] h-[23px] rounded-full flex items-center justify-center z-10 ring-2 ring-white"
                  style={{ background: step.highlight ? accentColor : accentColorLight }}
                >
                  <span style={{ color: step.highlight ? '#fff' : accentColor }}>
                    {React.cloneElement(step.icon as React.ReactElement, { size: 11 })}
                  </span>
                </div>
                <div className="flex-1 pt-[1px]">
                  <span
                    className={`text-sm leading-snug ${
                      step.highlight ? 'font-semibold text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.highlight && step.extra && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: accentColor }}
                      />
                      <span className="text-xs font-medium" style={{ color: accentColor }}>
                        {step.extra}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Role card                                                          */
/* ------------------------------------------------------------------ */
const RoleCard: React.FC<RoleCardProps> = ({
  persona,
  icon,
  title,
  description,
  steps,
  onClick,
  accentColor,
  accentColorLight,
  accentBg,
  accentBorder,
  delay,
  disabled,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition:
          'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`group relative flex flex-col items-start text-left w-full
        rounded-2xl p-6 overflow-hidden
        hover:shadow-xl active:scale-[0.98]
        transition-shadow duration-300 ease-out
        bg-white cursor-pointer
        border ${accentBorder}
        disabled:opacity-60 disabled:cursor-wait`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500 blur-3xl"
        style={{ background: accentColor }}
      />

      <div className="relative mb-4">
        <div
          className={`flex items-center justify-center w-14 h-14 rounded-2xl ${accentBg} transition-all duration-300 group-hover:shadow-lg`}
        >
          {icon}
        </div>
      </div>

      <span
        className="inline-flex items-center text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: accentColor }}
      >
        {persona}
      </span>

      <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-gray-800 transition-colors">
        {title}
      </h3>

      <p className="text-sm text-gray-500 leading-relaxed mb-5">{description}</p>

      <HowItWorks steps={steps} accentColor={accentColor} accentColorLight={accentColorLight} />

      <div
        className="flex items-center gap-2 text-sm font-semibold mt-auto transition-all duration-300 group-hover:gap-3"
        style={{ color: accentColor }}
      >
        {disabled ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Starting...
          </>
        ) : (
          <>
            Get started
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-300"
            />
          </>
        )}
      </div>
    </button>
  );
};

/* ================================================================== */
/*  Onboarding Screen                                                  */
/* ================================================================== */
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSelectRole, isLoading }) => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AssistantRole | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (role: AssistantRole) => {
    setSelectedRole(role);
    onSelectRole(role);
  };

  return (
    <>
      <style>{`
        @keyframes assistantFloat {
          0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
          25% { opacity: 0.6; }
          50% { opacity: 0.4; transform: translateY(-30px) scale(1.1); }
          75% { opacity: 0.6; }
        }
        @keyframes assistantPulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.5); }
        }
        @keyframes assistantGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="relative flex flex-col items-center py-14 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08]"
            style={{
              top: '-10%',
              left: '-10%',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              animation: 'assistantGradient 8s ease-in-out infinite',
              backgroundSize: '200% 200%',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.06]"
            style={{
              bottom: '-5%',
              right: '-10%',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              animation: 'assistantGradient 10s ease-in-out 1s infinite',
              backgroundSize: '200% 200%',
            }}
          />
          <FloatingParticle size={6} x="15%" y="20%" delay={0} duration={4} color="#818cf8" />
          <FloatingParticle size={4} x="80%" y="15%" delay={1} duration={5} color="#6366f1" />
          <FloatingParticle size={5} x="70%" y="70%" delay={2} duration={4.5} color="#a78bfa" />
          <FloatingParticle size={3} x="25%" y="75%" delay={0.5} duration={3.5} color="#93c5fd" />
        </div>

        {/* Header */}
        <div
          className="relative z-10 flex flex-col items-center"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary-100"
            style={{
              background: 'linear-gradient(135deg, rgba(238,242,255,0.9), rgba(224,231,255,0.7))',
              color: '#4338ca',
            }}
          >
            <AnimatedSparkle />
            <span>Powered by AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4 leading-[1.15] tracking-tight">
            <span className="text-gray-900">Meet your</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(100deg, #3b82f6, #6366f1 40%, #a855f7 70%, #d946ef)',
              }}
            >
              AI Research Assistant
            </span>
          </h1>

          <p className="text-gray-500 text-center mb-12 max-w-lg text-base leading-relaxed">
            Our research assistant will help you brainstorm and submit proposals.
          </p>
        </div>

        {/* Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          <RoleCard
            persona="Funder"
            icon={<Icon name="fund" size={28} color="#2563eb" />}
            title="Create a Funding Opportunity"
            description="Post an RFP and let researchers compete for your funding."
            steps={[
              { icon: <Bot />, label: 'Draft your RFP with AI' },
              { icon: <Megaphone />, label: 'Publish & attract researchers' },
              {
                icon: <Users />,
                label: 'Peer review ranks proposals',
                highlight: true,
                extra: 'Community-driven signal',
              },
              { icon: <Wallet />, label: 'Fund the best research' },
            ]}
            accentColor="#2563eb"
            accentColorLight="#dbeafe"
            accentBg="bg-blue-50"
            accentBorder="border-blue-100 hover:border-blue-200"
            onClick={() => handleSelect('funder')}
            delay={300}
            disabled={isLoading && selectedRole === 'funder'}
          />
          <RoleCard
            persona="Researcher"
            icon={<FundingIcon size={28} color="#ea580c" />}
            title="Create a Proposal"
            description="Craft a compelling research proposal with AI assistance."
            steps={[
              { icon: <Lightbulb />, label: 'Brainstorm ideas with AI' },
              { icon: <PenTool />, label: 'Draft & refine your proposal' },
              {
                icon: <Star />,
                label: 'Community peer review',
                highlight: true,
                extra: 'Builds credibility & visibility',
              },
              { icon: <Wallet />, label: 'Get funded' },
            ]}
            accentColor="#ea580c"
            accentColorLight="#ffedd5"
            accentBg="bg-orange-50"
            accentBorder="border-orange-100 hover:border-orange-200"
            onClick={() => handleSelect('researcher')}
            delay={450}
            disabled={isLoading && selectedRole === 'researcher'}
          />
        </div>

        <div
          className="relative z-10 mt-10 flex items-center gap-2 text-xs text-gray-400"
          style={{ opacity: headerVisible ? 1 : 0, transition: 'opacity 1s ease-out 0.8s' }}
        >
          <Sparkles size={12} className="text-gray-300" />
          <span>Powered by AI — your data stays private & secure</span>
        </div>
      </div>
    </>
  );
};
