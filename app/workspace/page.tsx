import { Metadata } from 'next';
import { WorkspaceClient } from './WorkspaceClient';

export const metadata: Metadata = {
  title: 'Workspace',
  robots: { index: false, follow: false },
};

export default function WorkspaceRoute() {
  return <WorkspaceClient />;
}
