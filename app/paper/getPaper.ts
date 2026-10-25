import { notFound } from 'next/navigation';
import { PaperService } from '@/services/paper.service';
import { Work } from '@/types/work';

/**
 * Only the papers published in the journal still have pages; the API answers
 * 404 for every other paper, and so does the page.
 */
export async function getPaper(id: string): Promise<Work> {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    return await PaperService.get(id);
  } catch {
    notFound();
  }
}
