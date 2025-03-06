'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAcceptOrgInvite, useFetchOrgByInviteToken } from '@/hooks/useOrganization';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function JoinOrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [{ isLoading: isAccepting }, acceptOrgInvite] = useAcceptOrgInvite();
  const [{ data: organization, isLoading: isFetching, error }, fetchOrgByInviteToken] =
    useFetchOrgByInviteToken();

  const token = params.token as string;

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        await fetchOrgByInviteToken(token);
      } catch (error) {
        toast.error(
          'Failed to fetch organization details. The invitation may be invalid or expired.'
        );
      }
    };

    if (token && status !== 'loading') {
      fetchOrganization();
    }
  }, [token, status]);

  const handleJoinOrg = async () => {
    if (!organization) return;

    try {
      await acceptOrgInvite(token);
      toast.success(`Successfully joined ${organization.name}`);

      // Redirect to the organization page
      router.push(`/organization/${organization.slug}`);
    } catch (error) {
      toast.error('Failed to join organization. The invitation may be invalid or expired.');
    }
  };

  if (status === 'loading' || isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen max-w-md mx-auto text-center px-4">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <svg
            className="h-12 w-12 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
        <p className="text-gray-600 mb-6">
          This invitation link is invalid or has expired. Please contact the organization
          administrator for a new invitation.
        </p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-md mx-auto text-center px-4">
      <div className="mb-8">
        {organization.coverImage ? (
          <Image
            src={organization.coverImage}
            alt={organization.name}
            width={120}
            height={120}
            className="rounded-lg mx-auto"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto">
            {organization.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Join {organization.name}</h1>
      <p className="text-gray-600 mb-8">
        You have been invited to join <strong>{organization.name}</strong>. Click the button below
        to accept the invitation.
      </p>

      {status === 'authenticated' ? (
        <Button onClick={handleJoinOrg} disabled={isAccepting} className="w-full">
          {isAccepting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            'Join Organization'
          )}
        </Button>
      ) : (
        <div className="space-y-4 w-full">
          <p className="text-sm text-gray-500">You need to sign in to join this organization</p>
          <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(`/org/join/${token}`)}`}>
            <Button className="w-full">Sign in to join</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
