import app from "../app.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default (req: VercelRequest, res: VercelResponse) => {
  app(req, res);
};
