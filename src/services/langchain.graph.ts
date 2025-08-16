import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import calculatorTool from "../tools/calculator.js";

export async function buildToolGraph() {
  // 1️⃣ LLM with tool binding
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env["GOOGLE_API_KEY"] || "",
    model: "gemini-2.0-flash",
  }).bindTools([calculatorTool]);

  // 2️⃣ Create a ToolNode for automatic execution
  const toolNode = new ToolNode([calculatorTool]);

  // 3️⃣ Graph definition
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", model) // model step
    .addNode("tools", toolNode) // tools step
    .addEdge("agent", "tools") // if tool call → go to tools
    .addEdge("tools", "agent") // after tool runs → back to model
    .addEdge("agent", END); // if no tool call → finish

  // 4️⃣ Compile the graph
  const app = workflow.compile();
  return app;
}
