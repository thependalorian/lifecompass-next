// lib/agent/models.ts

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export enum SearchType {
  VECTOR = "vector",
  HYBRID = "hybrid",
  GRAPH = "graph",
}

export interface Message {
  id?: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface Session {
  id: string;
  userId?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
}

export interface AgentDependencies {
  sessionId: string;
  userId?: string;
  searchPreferences?: {
    useVector: boolean;
    useGraph: boolean;
    defaultLimit: number;
  };
  voiceMode?: boolean;
  metadata?: Record<string, any>;
}

export interface ChunkResult {
  chunkId: string;
  documentId: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
  documentTitle: string;
  documentSource: string;
}

export interface GraphSearchResult {
  fact: string;
  uuid: string;
  validAt?: string;
  invalidAt?: string;
  sourceNodeUuid?: string;
}

export interface ToolCall {
  toolName: string;
  args: Record<string, any>;
  toolCallId?: string;
}

export interface AgentResponse {
  message: string;
  sessionId: string;
  sources: ChunkResult[];
  toolsUsed: ToolCall[];
  metadata: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  searchType?: SearchType;
}
