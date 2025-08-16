import type { Request, Response } from "express";
import { LangChainService } from "../services/langchain.service.js";
import type { QueryRequest, ApiResponse } from "../types/index.js";

export class LangChainController {
  private langChainService: LangChainService;

  constructor() {
    this.langChainService = new LangChainService();
  }

  async loadData(req: Request, res: Response): Promise<Response> {
    try {
      const { chatId, pdfLink } = req.body;
      const result = await this.langChainService.loadData(chatId, pdfLink);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  }

  async queryData(req: Request, res: Response): Promise<Response> {
    try {
      const { question, nameSpace, chatHistory } = req.body as QueryRequest;

      if (!question) {
        return res.status(400).json({
          success: false,
          message: "Question is required",
        } as ApiResponse);
      }

      const result = await this.langChainService.queryData(
        question,
        nameSpace,
        chatHistory || []
      );
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  }
}
