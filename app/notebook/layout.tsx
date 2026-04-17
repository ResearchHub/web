import { Metadata } from 'next';
import NotebookClientLayout from './NotebookClientLayout';

export const metadata: Metadata = {
  title: 'Notebook',
};

export default function NotebookLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <NotebookClientLayout>{children}</NotebookClientLayout>;
}
