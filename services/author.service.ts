import { ApiClient } from './client';

interface AuthorResponse {
  id: number;
  first_name: string;
  last_name: string;
  slug: string;
  profile_image?: string;
  description?: string;
}

interface AuthorsApiResponse {
  results: AuthorResponse[];
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}

export class AuthorService {
  private static readonly BASE_PATH = '/api/author';

  static async getAuthors(): Promise<Author[]> {
    const response = await ApiClient.get<AuthorsApiResponse>(`${this.BASE_PATH}/`);
    return response.results.map((author) => ({
      id: author.id,
      name: author.first_name + ' ' + author.last_name,
      slug: author.slug,
      imageUrl: author.profile_image,
      description: author.description,
    }));
  }

  static async followAuthor(authorId: number): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/${authorId}/follow/`);
  }

  static async unfollowAuthor(authorId: number): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/${authorId}/unfollow/`);
  }
}
