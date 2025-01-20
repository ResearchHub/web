// app/notebook/[room]/page.tsx

import Document from './Document';

interface PageProps {
  params: Promise<{ room: string }>;
}

export default async function Page({ params }: PageProps) {
  const { room } = await params;
  return <Document room={room} />;
}
