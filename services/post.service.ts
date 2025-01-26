import { ApiClient } from './client';
import { Work, WorkType, Authorship, transformAuthorship } from '@/types/work';
import { Hub } from '@/types/hub';

interface PostResponse {
  id: number;
  title: string;
  slug: string;
  created_date: string;
  document_type: string;
  doi: string;
  authors: any[];
  unified_document: {
    id: number;
    is_removed: boolean;
    document_type: string;
    reviews?: {
      avg: number;
      count: number;
    };
  };
  discussion_count: number;
  score: number;
  full_markdown: string;
  hubs: Hub[];
}

function transformWorkFromPost(post: PostResponse): Work {
  return {
    id: post.id,
    type: post.document_type.toLowerCase() as WorkType,
    title: post.title,
    slug: post.slug,
    createdDate: post.created_date,
    publishedDate: post.created_date,
    authors: Array.isArray(post.authors) ? post.authors.map(transformAuthorship) : [],
    abstract: undefined,
    previewContent: post.full_markdown,
    doi: post.doi,
    journal: undefined,
    topics: Array.isArray(post.hubs)
      ? post.hubs.map((hub) => ({
          id: hub.id,
          name: hub.name,
          slug: hub.slug,
        }))
      : [],
    formats: [],
    license: undefined,
    pdfCopyrightAllowsDisplay: true,
    figures: [],
    versions: [],
    metrics: {
      votes: post.score || 0,
      comments: post.discussion_count || 0,
      saves: 0,
      reviewScore: post.unified_document?.reviews?.avg || 0,
      reviews: post.unified_document?.reviews?.count || 0,
      earned: 0,
      views: 0,
    },
  };
}

export class PostService {
  private static readonly BASE_PATH = '/api/researchhubpost';

  static async get(id: string): Promise<Work> {
    const response = await ApiClient.get<PostResponse>(`${this.BASE_PATH}/${id}/`);
    return transformWorkFromPost(response);
  }
}
