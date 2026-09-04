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
 * Eligibility and generation capabilities are specific to the authenticated
 * user. Callers revalidate on opening and after a model_not_allowed response.
 */
export class AgentModelService {
  static async listModels(): Promise<AgentModelCatalog> {
    const response = await ApiClient.get<AgentModelCatalogResponse>('/api/research_ai/models/');
    return toAgentModelCatalog(response);
  }
}
