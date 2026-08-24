'use client';

import Image from 'next/image';
import { Icon } from '@/components/ui/icons';
import { PoolFundCta } from '../../components/PoolFundCta';

export function SubstationMemes() {
  return (
    <section className="substation-memes" id="evidence">
      <div className="substation-memes-inner">
        <figure className="substation-memes-featured">
          <div className="substation-memes-featured-img-wrap">
            <Image
              src="/pool/substation/last-laugh.jpg"
              alt="Laughing Leonardo DiCaprio superimposed over the electrical substation looming behind the San Francisco 49ers practice facility"
              fill
              sizes="(max-width: 1240px) 100vw, 1200px"
              className="substation-memes-featured-img"
            />
          </div>
          <figcaption className="substation-memes-featured-body">
            <p className="substation-memes-featured-tagline">
              Don&apos;t let the Substation have the last laugh.
            </p>
            <PoolFundCta className="substation-memes-featured-btn">
              <Icon name="giveRSC" size={20} color="white" />
              Fund the research
            </PoolFundCta>
          </figcaption>
        </figure>
      </div>

      <style jsx>{`
        .substation-memes {
          padding: 96px 28px;
          background:
            radial-gradient(circle at 15% 20%, rgba(67, 56, 202, 0.25), transparent 50%),
            radial-gradient(circle at 85% 80%, rgba(57, 113, 255, 0.12), transparent 45%),
            linear-gradient(168deg, #0a0f1e 0%, #101a45 60%, #0d1330 100%);
          color: #e2e8f0;
        }
        .substation-memes-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .substation-memes-featured {
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .substation-memes-featured-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #060a16;
          border: 1px solid rgba(74, 127, 255, 0.3);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 90px -36px rgba(0, 0, 0, 0.85);
        }
        .substation-memes-featured :global(.substation-memes-featured-img) {
          object-fit: cover;
          object-position: center 32%;
        }
        .substation-memes-featured-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-top: 48px;
        }
        .substation-memes-featured-tagline {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 64px;
          line-height: 1.05;
          font-weight: 700;
          letter-spacing: -0.028em;
          color: #4a7fff;
          text-wrap: balance;
          max-width: 17ch;
          margin: 0 0 34px;
          text-shadow: 0 0 60px rgba(74, 127, 255, 0.4);
        }
        @media (max-width: 1100px) {
          .substation-memes-featured-tagline {
            font-size: 46px;
          }
        }
        @media (max-width: 640px) {
          .substation-memes {
            padding: 72px 20px;
          }
          .substation-memes-featured-img-wrap {
            aspect-ratio: 4 / 3;
            border-radius: 18px;
          }
          .substation-memes-featured-body {
            margin-top: 34px;
          }
          .substation-memes-featured-tagline {
            font-size: 32px;
            margin-bottom: 26px;
          }
        }
      `}</style>
      {/* Global: styled-jsx doesn't add its scoping class to `Link`-rendered
          anchors, so the CTA rule must be global to apply. */}
      <style jsx global>{`
        .substation-memes-featured-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 56px;
          padding: 0 36px;
          border-radius: 15px;
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(to right, #4a7fff, #3971ff);
          box-shadow: 0 10px 26px -8px rgba(57, 113, 255, 0.65);
          text-decoration: none;
          transition:
            transform 0.15s ease,
            background 0.15s ease,
            box-shadow 0.15s ease;
        }
        .substation-memes-featured-btn:hover {
          background: linear-gradient(to right, #3971ff, #2563eb);
          box-shadow: 0 16px 32px -8px rgba(57, 113, 255, 0.8);
          transform: translateY(-1px);
          color: #ffffff;
        }
        @media (max-width: 640px) {
          .substation-memes-featured-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
