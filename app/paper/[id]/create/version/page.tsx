import { PaperService } from '@/services/paper.service';
import { MetadataService, WorkMetadata } from '@/services/metadata.service';
import { Work } from '@/types/work';
import UploadVersionForm from './UploadVersionForm';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  // Fetch the existing paper data on the server so that we can pre-populate the form.
  const paper: Work = await PaperService.get(resolvedParams.id);

  // Fetch metadata (topics) if unifiedDocumentId is available
  let metadata: WorkMetadata | undefined = undefined;
  if (paper.unifiedDocumentId) {
    try {
      metadata = await MetadataService.get(paper.unifiedDocumentId.toString());
    } catch (e) {
      console.error('Failed to fetch metadata for paper', e);
    }
  }

  return (
    <UploadVersionForm
      initialPaper={paper}
      previousPaperId={Number(resolvedParams.id)}
      metadata={metadata}
    />
  );
}
