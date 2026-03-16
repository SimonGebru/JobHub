import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 8080,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  greenhouseBoards: process.env.GREENHOUSE_BOARDS
    ? process.env.GREENHOUSE_BOARDS.split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [],
    leverCompanies: process.env.LEVER_COMPANIES
    ? process.env.LEVER_COMPANIES.split(",").map((item) => item.trim()).filter(Boolean)
    : [],
};