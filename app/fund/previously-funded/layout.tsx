import React from 'react';

export default function PreviouslyFundedLayout({
  children,
  peek,
}: {
  children: React.ReactNode;
  peek: React.ReactNode;
}) {
  return (
    <>
      {children}
      {peek}
    </>
  );
}
