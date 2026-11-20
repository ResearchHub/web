import { ApiClient } from './client';
import type { Artifact } from '@/types/artifact';

/** Read access to the artifacts the agent chats make; only the agent writes them. */
export class ArtifactService {
  private static readonly BASE_PATH = '/api/research_ai/artifacts/';

  /** The artifact showing `version`, or its latest version when omitted. */
  static async getArtifact(id: number, version?: number): Promise<Artifact> {
    const query = version == null ? '' : `?version=${version}`;
    return ApiClient.get<Artifact>(`${this.BASE_PATH}${id}/${query}`);
  }
}
