import { Router } from "express";
import { LangChainController } from "../controllers/langchain.controller.js";

const router = Router();
const langChainController = new LangChainController();

// Load data route
router.post("/load", (req, res) => langChainController.loadData(req, res));

// Query data route
router.post("/query", (req, res) => langChainController.queryData(req, res));

export default router;
