import axios from "axios";

export const api = axios.create({
  validateStatus: () => true,
  baseURL: process.env.API_URL || "https://tool.robloxdupe.site",
  headers: { "Content-Type": "application/json" },
});
