import React from 'react';

export default function PreviouslyFundedLayout({
  children,
  peek,
}: {
  readonly children: React.ReactNode;
  readonly peek: React.ReactNode;
}) {
  return (
    <>
      {children}
      {peek}
    </>
  );
}
