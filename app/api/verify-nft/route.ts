import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { transactionHash } = await request.json();

    const response = await fetch(`${process.env.DJANGO_API_URL}/api/verify-nft/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionHash }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify NFT' }, { status: 500 });
  }
}
