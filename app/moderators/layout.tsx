import { Metadata } from 'next';
import ModerationClientLayout from './ModerationClientLayout';

export const metadata: Metadata = {
  title: 'Moderation',
};

export default function ModerationLayout({ children }: { children: React.ReactNode }) {
  return <ModerationClientLayout>{children}</ModerationClientLayout>;
}
