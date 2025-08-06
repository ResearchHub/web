import ResetPasswordForm from './components/ResetPasswordForm';

interface Props {
  params: Promise<{
    uid: string;
    token: string;
  }>;
}

export default async function ResetPasswordPage({ params }: Props) {
  const { uid, token } = await params;
  return <ResetPasswordForm uid={uid} token={token} />;
}
