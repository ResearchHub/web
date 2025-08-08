import React from 'react';

export default function GrantsLayout({
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
