import cluster from "cluster";
import http from "http";
import os from "os";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { createLoggerUtil } from "./utils/logger.js";

dotenv.config({ path: '../.env' }); // load .env
const logger = createLoggerUtil("server");

const PORT = process.env.PORT || 8000;

const numCPUs = os.cpus().length;
logger.info(`Number of CPUs: ${numCPUs}`);

if (cluster.isPrimary) {
  logger.info(`Master ${process.pid} is running...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    logger.error(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
    
  connectDB()
    .then(() => {
      const server = http.createServer(app);
      server.listen(PORT, () => {
        logger.info(`⚙️ Worker ${process.pid} is running at port ${PORT}`);
      });
    })
    .catch((err) => {
      logger.error("MONGO db connection failed !!! ", err);
      process.exit(1);
    });
}
