import { buildArticleMetadata } from '@/lib/metadata';
import { generateDocumentStructuredData } from '@/lib/structured-data';
import { Work } from '@/types/work';
import { truncateText } from '@/utils/stringUtils';

export function getWorkMetadata({
  work,
  url,
  titleSuffix = '',
}: {
  work: Work;
  url: string;
  titleSuffix?: string;
}) {
  const title = `${work.title}${titleSuffix ? ` - ${titleSuffix}` : ''}`;
  const description = truncateText(work.abstract || work.title, 65);

  const structuredData = generateDocumentStructuredData({
    ...work,
    authors: work.authors?.map((a) => ({
      name: a.authorProfile?.fullName || '',
      url: a.authorProfile?.profileUrl,
    })),
  });

  return {
    ...buildArticleMetadata({
      title,
      description,
      url,
      image: work.image,
      publishedTime: work.createdDate,
      authors: work.authors?.map((a) => a.authorProfile?.fullName) || [],
      tags: work.topics?.map((t) => t.name) || [],
    }),
    ...(structuredData && {
      other: {
        'application/ld+json': JSON.stringify(structuredData),
      },
    }),
  };
}
