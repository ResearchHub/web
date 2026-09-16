export default function ReferralLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white">
      <main className="relative">{children}</main>
    </div>
  );
}
