import { connection } from 'next/server';
import { UserService } from '@/services/user.service';
import EditorsDashboardContent from './components/EditorsDashboardContent';

export default async function EditorsPage() {
  await connection(); // stop build-time prerender for this page

  // Check if user has permissions for the PERMISSIONS_DASH application
  const hasPermissionsAccess = await UserService.gatekeeper('PERMISSIONS_DASH');

  return <EditorsDashboardContent hasWriteAccess={hasPermissionsAccess} />;
}
