export type AuthScreen =
  | 'SELECT_PROVIDER'
  | 'LOGIN'
  | 'SIGNUP'
  | 'VERIFY_EMAIL'
  | 'FORGOT_PASSWORD';

export type AuthAppearance = 'default' | 'catalyst';
export type CatalystSurface = 'dark' | 'light';

export interface BaseScreenProps {
  onBack?: () => void;
  onClose: () => void;
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}
