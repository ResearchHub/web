import { ApiClient } from './client';
import { toast } from 'react-hot-toast';

export async function isOrcidConnected(): Promise<boolean> {
  try {
    const { authenticated, needs_reauth } = await ApiClient.post<any>('/api/orcid/check');
    return authenticated && !needs_reauth;
  } catch {
    return false;
  }
}

export async function resyncOrcidPublications(): Promise<void> {
  await ApiClient.post('/api/orcid/sync');
}

export async function connectOrcidAccount(returnUrl = window.location.href): Promise<void> {
  const { auth_url } = await ApiClient.post<any>('/api/orcid/connect', { return_to: returnUrl });
  window.location.href = auth_url;
}

export async function handleOrcidSync(): Promise<boolean> {
  try {
    if (await isOrcidConnected()) {
      toast.success("Resync started! We'll refresh your authorship shortly.");
      await resyncOrcidPublications();
      return true;
    } else {
      await connectOrcidAccount();
      return false;
    }
  } catch {
    toast.error('Could not start ORCID operation. Please try again.');
    return false;
  }
}
