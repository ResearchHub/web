// This is a minimal paper parsing scheme for rending saved works in the User's saved page
import { RawApiFeedEntry, transformFeedEntry, FeedEntry } from '@/types/feed';

export function parseUserSavedPapers(jsonData: any[]): FeedEntry[] {
  return jsonData.map((item) => {
    // Map the saved paper data to RawApiFeedEntry format
    const rawFeedEntry: RawApiFeedEntry = {
      id: item?.documents?.id ?? 0,
      content_type: 'PAPER',
      content_object: {
        id: item?.documents?.id ?? 0,
        title: item?.documents?.paper_title ?? '',
        abstract: item?.documents?.abstract ?? '',
        slug: item?.documents?.slug ?? '',
        created_date: item?.documents?.paper_publish_date ?? '',
        authors:
          item?.documents?.authors?.map((author: any) => ({
            id: author?.id ?? 0,
            first_name: author?.first_name ?? '',
            last_name: author?.last_name ?? '',
            description: '',
            headline: '',
            profile_image: '',
            user: {
              id: author?.id ?? 0,
              first_name: author?.first_name ?? '',
              last_name: author?.last_name ?? '',
              email: '',
              is_verified: false,
            },
          })) ?? [],
        hub: item?.hubs?.[0]
          ? {
              id: item?.hubs[0]?.id ?? 0,
              name: item?.hubs[0]?.name ?? '',
              slug: item?.hubs[0]?.slug ?? '',
            }
          : null,
        external_source: item?.documents?.external_source ?? '',
        document_type: item?.document_type ?? '',
      },
      created_date: item?.documents?.paper_publish_date ?? '',
      action: 'publish',
      action_date: item?.documents?.paper_publish_date ?? '',
      author: item?.documents?.authors?.[0]
        ? {
            id: item?.documents?.authors[0]?.id ?? 0,
            first_name: item?.documents?.authors[0]?.first_name ?? '',
            last_name: item?.documents?.authors[0]?.last_name ?? '',
            description: '',
            headline: '',
            profile_image: '',
            user: {
              id: item?.documents?.authors[0]?.id ?? 0,
              first_name: item?.documents?.authors[0]?.first_name ?? '',
              last_name: item?.documents?.authors[0]?.last_name ?? '',
              email: '',
              is_verified: false,
            },
          }
        : {
            id: 0,
            first_name: '',
            last_name: '',
            description: '',
            headline: '',
            profile_image: '',
            user: {
              id: 0,
              first_name: '',
              last_name: '',
              email: '',
              is_verified: false,
            },
          },
    };

    // Transform the RawApiFeedEntry to a FeedEntry
    return transformFeedEntry(rawFeedEntry);
  });
}
