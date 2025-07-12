import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { ReferralService } from '@/services/referral.service';

// These settings ensure our route always gets fresh data
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect('/auth/signin');
  }

  // Get URL and search params
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirect') || '/';
  const referralCode = searchParams.get('refr');

  if (!referralCode) {
    // No referral code provided, redirect to original destination
    return redirect(redirectUrl);
  }

  try {
    // Apply referral code to user using server session
    await ReferralService.addReferralCode({
      referral_code: referralCode,
      user_id: Number(session.userId),
    });

    // Redirect to original destination
    return redirect(redirectUrl);
  } catch (error) {
    console.error('Failed to apply referral code:', error);
    // TODO: Handle error. or at least log it somewhere to monitor it

    // Still redirect even if referral fails
    // You could also redirect to an error page if needed
    return redirect(redirectUrl);
  }
}
