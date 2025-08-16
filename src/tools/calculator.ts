import { tool } from "@langchain/core/tools";
import { z } from "zod";

const calculatorSchema = z.object({
  operation: z
    .enum(["add", "subtract", "multiply", "divide"])
    .describe("The operation to perform"),
  number1: z.number().describe("The first number"),
  number2: z.number().describe("The second number"),
});

const calculatorTool = tool(
  async ({ operation, number1, number2 }) => {
    switch (operation) {
      case "add":
        return number1 + number2;
      case "subtract":
        return number1 - number2;
      case "multiply":
        return number1 * number2;
      case "divide":
        return number1 / number2;
    }
  },
  {
    name: "calculator",
    description:
      "A calculator tool that can perform basic arithmetic operations (add, subtract, multiply, divide) on two numbers. Use this for mathematical calculations like '3 + 3' or 'what is 5 times 7'.",
    schema: calculatorSchema,
  }
);

export default calculatorTool;
