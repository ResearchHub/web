import React from 'react';

export default function NeedsFundingLayout({
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
