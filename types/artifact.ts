/**
 * Artifacts the agent chats make (`/api/research_ai/artifacts/`): standalone
 * pages, components, diagrams, documents and code the user views beside the
 * chat. Wire shapes stay snake_case, like the rest of the agent chat types.
 */

export type ArtifactKind = 'html' | 'react' | 'svg' | 'mermaid' | 'markdown' | 'code';

export interface ArtifactVersion {
  /** Versions count from 1; every agent create or update adds one. */
  number: number;
  content: string;
  created_date: string;
}

export interface Artifact {
  id: number;
  conversation_id: number;
  /** Open-ended: a newer backend may add kinds, which render as plain code. */
  kind: ArtifactKind | string;
  title: string;
  /** Code artifacts only, e.g. `python`; blank otherwise. */
  language: string;
  latest_version: number;
  created_date: string;
  updated_date: string;
  /** The version this response shows: the latest, or the one asked for. */
  version: ArtifactVersion;
}
