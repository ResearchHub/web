'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/utils/styles';
import { DollarBill } from '@/app/giving-tuesday/components/DollarBill';
import styles from '@/app/giving-tuesday/components/DollarSplit.module.css';

/**
 * One dollar that splits into your gift and our match. The animation waits on the single
 * bill until the stage is on screen, then plays once and stays on the two bills.
 */
export function DollarSplit() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        stage.setAttribute('data-playing', '');
        observer.disconnect();
      },
      { threshold: 0.6 }
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      role="img"
      aria-label="A one dollar bill splits into your dollar and our matching dollar, and a flask of research fills to the top"
    >
      <div className={cn(styles.side, styles.match)}>
        <DollarBill id="bill-match" className={styles.bill} />
        <span className={cn(styles.tag, 'text-[#3971ff]')}>Our match</span>
      </div>
      <div className={cn(styles.side, styles.gift)}>
        <DollarBill id="bill-gift" className={styles.bill} />
        <span className={cn(styles.tag, 'text-[#0b1530]')}>Your gift</span>
      </div>
      <p className={styles.one}>You give $1</p>
      <div className={styles.outcome}>
        <ResearchFlask />
        <p className="text-left">
          <span className="block text-lg font-bold text-[#0b1530]">
            A better outcome for science
          </span>
          <span className="block text-sm text-[#4b5563]">
            Twice the funding for the same research
          </span>
        </p>
      </div>
    </div>
  );
}

/** A flask that is half full with your dollar and fills to the top once the match lands. */
function ResearchFlask() {
  return (
    <svg viewBox="0 0 64 80" className={styles.flask} aria-hidden>
      <defs>
        <clipPath id="flask-body">
          <path d="M24 8h16v22l17 36q3 10-7 10H14q-10 0-7-10l17-36z" />
        </clipPath>
        <linearGradient id="flask-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7aa2ff" />
          <stop offset="1" stopColor="#3971ff" />
        </linearGradient>
      </defs>
      <path d="M24 8h16v22l17 36q3 10-7 10H14q-10 0-7-10l17-36z" fill="#ffffff" />
      <g clipPath="url(#flask-body)">
        <rect
          className={styles.liquid}
          x="0"
          y="30"
          width="64"
          height="46"
          fill="url(#flask-liquid)"
        />
        <g className={styles.bubbles}>
          <circle className={styles.bubble} cx="26" cy="70" r="3" fill="#ffffff" />
          <circle className={styles.bubble} cx="38" cy="72" r="2.2" fill="#ffffff" />
          <circle className={styles.bubble} cx="32" cy="74" r="2.6" fill="#ffffff" />
        </g>
      </g>
      <path
        d="M24 8h16v22l17 36q3 10-7 10H14q-10 0-7-10l17-36z"
        fill="none"
        stroke="#0b1530"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="19" y="3" width="26" height="7" rx="3.5" fill="#0b1530" />
      <path className={styles.sparkle} d="M56 14l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFB547" />
    </svg>
  );
}
