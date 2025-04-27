import { useSession } from 'next-auth/react';

export const useStorageKey = (baseKey: string) => {
  const { data: session } = useSession();
  const userId = session?.userId;

  // If no user is logged in, just return the base key
  // Or you might want to return null to prevent storage for non-logged in users
  if (!userId) return baseKey;

  return `user-${userId}-${baseKey}`;
};
