'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/utils/styles';
import { DollarBill } from '@/app/giving-tuesday/components/DollarBill';
import styles from '@/app/giving-tuesday/components/DollarSplit.module.css';

/**
 * One dollar that splits into your gift and our match. The animation waits on the single
 * bill until the stage is on screen, and pauses again when it scrolls away.
 */
export function DollarSplit() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        stage.toggleAttribute('data-playing', entry.isIntersecting);
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
      aria-label="A one dollar bill splits into two: your dollar and our matching dollar"
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
    </div>
  );
}
