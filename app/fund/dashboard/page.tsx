import { redirect } from 'next/navigation';

/** Back-compat: dashboard moved to `/my-funding`. */
export default function FunderDashboardRoute() {
  redirect('/my-funding');
}
