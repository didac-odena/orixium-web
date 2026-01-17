import { authHandlers } from "./auth-handlers.js";
import { tradingHandlers } from "./trading-handlers.js";

export const handlers = [
  ...authHandlers,
  ...tradingHandlers,
];
