import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { userPrompt } from "../prompt.js";
import calculatorTool from "../tools/calculator.js";
import type { LoadResponse, QueryResponse } from "../types/index.js";
import { xTools } from "../tools/x.js";

dotenv.config();

export class LangChainService {
  private embeddings: GoogleGenerativeAIEmbeddings;
  private pinecone: Pinecone;
  private pineconeIndex: any;

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
      apiKey: process.env["GOOGLE_API_KEY"] || "",
    });

    this.pinecone = new Pinecone();
    this.pineconeIndex = this.pinecone.Index(
      process.env["PINECONE_INDEX_NAME"] || ""
    );
  }

  async loadData(chatId: string, pdfLink: string): Promise<LoadResponse> {
    try {
      // Load the data
      const response = await fetch(pdfLink);
      const blob = await response.blob();
      const loader = new PDFLoader(blob);
      const rawData = await loader.load();
      console.log("PDF loaded");

      // Split the data into chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const chunkedDocs = await splitter.splitDocuments(rawData);
      console.log("Chunked docs loaded");

      console.log("Pinecone index loaded");

      await PineconeStore.fromDocuments(chunkedDocs, this.embeddings, {
        pineconeIndex: this.pineconeIndex,
        maxConcurrency: 5,
        namespace: chatId,
      });

      console.log("data stored successfully");
      return { success: true, message: "Data loaded and stored successfully" };
    } catch (error) {
      console.error("Error loading data:", error);
      return {
        success: false,
        message: "Error loading data",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async queryData(
    question: string,
    nameSpace: string,
    chatHistory: Array<{ role: string; content: string }> = []
  ): Promise<QueryResponse> {
    try {
      const queryVector = await this.embeddings.embedQuery(question);
      const nsIndex = this.pineconeIndex.namespace(nameSpace);
      const results = await nsIndex.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
      });

      // Context is available but not used in current implementation
      const context = results.matches
        .map((match: any) => match.metadata?.["text"])
        .join("\n\n -- \n\n");

      // Create a map of all available tools
      const allTools = [calculatorTool, ...xTools];
      const toolMap = new Map();
      allTools.forEach((tool) => {
        toolMap.set(tool.name, tool);
      });

      const ai = new ChatGoogleGenerativeAI({
        apiKey: process.env["GOOGLE_API_KEY"] || "",
        model: "gemini-2.0-flash",
      }).bindTools(allTools);

      const response = await ai.invoke([
        {
          role: "user",
          content: userPrompt(context, question, chatHistory),
        },
      ]);

      console.log("Response:", response);
      if (response.tool_calls && response.tool_calls.length > 0) {
        // Handle all tool calls
        const toolResponses = [];

        for (const toolCall of response.tool_calls) {
          const toolName = toolCall?.name;
          const toolArgs = toolCall?.args;

          // Find the appropriate tool to invoke
          const selectedTool = toolMap.get(toolName);
          if (!selectedTool) {
            throw new Error(`Tool '${toolName}' not found`);
          }

          const toolResponse = await selectedTool.invoke(toolArgs as any);
          toolResponses.push({
            toolName,
            response: toolResponse,
          });
        }

        // Combine all tool responses
        const combinedResponse = toolResponses
          .map((tr) => `${tr.toolName}: ${JSON.stringify(tr.response)}`)
          .join("\n\n");

        return {
          success: true,
          question,
          response: response,
          answer: combinedResponse,
          context: results.matches.map((match: any) => ({
            score: match.score,
            metadata: match.metadata,
          })),
        };
      }

      return {
        success: true,
        question,
        response: response,
        answer: String(response.content),
        context: results.matches.map((match: any) => ({
          score: match.score,
          metadata: match.metadata,
        })),
      };
    } catch (error) {
      console.error("Error querying:", error);
      return {
        success: false,
        response: null,
        question,
        message: "Error querying data",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
