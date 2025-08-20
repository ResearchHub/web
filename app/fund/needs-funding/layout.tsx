import React from 'react';

export default function NeedsFundingLayout({
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
