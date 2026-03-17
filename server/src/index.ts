import app from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase } from "./db/connectToDatabase.js";

async function startServer() {
  await connectToDatabase(env.mongoUri);

  app.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
  });
}

startServer();