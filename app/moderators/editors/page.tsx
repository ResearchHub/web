import { UserService } from '@/services/user.service';
import EditorsDashboardContent from './components/EditorsDashboardContent';

// Access depends on the session, so skip build-time prerendering.
export const dynamic = 'force-dynamic';

export default async function EditorsPage() {
  // Check if user has permissions for the PERMISSIONS_DASH application
  const hasPermissionsAccess = await UserService.gatekeeper('PERMISSIONS_DASH');

  return <EditorsDashboardContent hasWriteAccess={hasPermissionsAccess} />;
}
