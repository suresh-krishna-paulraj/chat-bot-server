import type { AIMessageChunk } from "@langchain/core/messages";

export interface LoadResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface QueryRequest {
  question: string;
  nameSpace: string;
  chatHistory?: ChatMessage[];
}

export interface QueryResponse {
  success: boolean;
  question: string;
  response: AIMessageChunk | null;
  answer?: string;
  context?: Array<{
    score: number;
    metadata: any;
  }>;
  message?: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
}
