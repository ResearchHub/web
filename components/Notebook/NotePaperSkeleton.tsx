import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import { NotePaperWrapper } from './NotePaperWrapper';

export const NotePaperSkeleton = () => {
  return (
    <NotePaperWrapper>
      <NotebookSkeleton />
    </NotePaperWrapper>
  );
};
