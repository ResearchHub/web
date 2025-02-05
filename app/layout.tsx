import NextAuthProvider from '@/components/providers/NextAuthProvider';
import ToasterProvider from '@/components/providers/ToasterProvider';
import localFont from 'next/font/local';
import './globals.css';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextAuthProvider>
          <AuthModalProvider>
            <NotificationProvider>
              <ExchangeRateProvider>{children}</ExchangeRateProvider>
            </NotificationProvider>
          </AuthModalProvider>
        </NextAuthProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}
