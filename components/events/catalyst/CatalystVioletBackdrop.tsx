'use client';

export function CatalystVioletBackdrop() {
  return (
    <>
      <div className="catalyst-violet-bg" aria-hidden="true" />
      <div className="catalyst-violet-grid" aria-hidden="true" />

      <style jsx>{`
        .catalyst-violet-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            108% 86% at 24% 22%,
            #7b43be 0%,
            #5a2db0 24%,
            #3a1f86 46%,
            #20104e 72%,
            #0c0720 100%
          );
        }
        .catalyst-violet-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 22px 22px;
          -webkit-mask-image: radial-gradient(120% 100% at 30% 20%, transparent 35%, #000 100%);
          mask-image: radial-gradient(120% 100% at 30% 20%, transparent 35%, #000 100%);
        }
      `}</style>
    </>
  );
}
