import { Router } from "express";
import type { Request, Response } from "express";
import langChainRoutes from "./langchain.routes.js";
import type { HealthResponse } from "../types/index.js";

const router = Router();

// Health check route
router.get("/health", (_req: Request, res: Response) => {
  const response: HealthResponse = {
    status: "OK",
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// Root route
router.get("/", (_req: Request, res: Response) => {
  res.json({ message: "LangChain API is running" });
});

// Mount LangChain routes
router.use("/api", langChainRoutes);

export default router;
