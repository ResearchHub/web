import { ApiClient } from './client';
import {
  toAgentModelCatalog,
  type AgentModelCatalog,
  type AgentModelCatalogResponse,
} from '@/types/notebookModels';

/**
 * The user-selectable model catalog, shared by every agent workflow that
 * takes a model (the notebook assistant today, proposal drafting next).
 *
 * Gated exactly like those workflows, so a 401/403 here means the same thing
 * as one on the chat itself: this user has no assistant, and the picker
 * simply isn't there.
 */
export class AgentModelService {
  static async listModels(): Promise<AgentModelCatalog> {
    const response = await ApiClient.get<AgentModelCatalogResponse>('/api/research_ai/models/');
    return toAgentModelCatalog(response);
  }
}
