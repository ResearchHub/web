import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications',
};

export default function NotificationsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
