import dotenv from "dotenv";

dotenv.config();

export const {
  APP_PORT,
  DATABASE_URL,
  JWT_SECTRET,
  CLIENT_SOCKET,
  MONGO_ATLAS,
} = process.env;
