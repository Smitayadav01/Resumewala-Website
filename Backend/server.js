import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
console.log("DNS:", dns.getServers());

import express from "express";
import connectDB from "./config/db.js";
import userRouter from './routes/userRouter.js';
import profileRouter from "./routes/profile.js";
import adminRouter from "./routes/admin.js";
import cors from "cors";
import jobRoutes from "./routes/job.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from "dotenv";
import contactRoutes from "./routes/contact.js";
import employerRoutes from "./routes/employerRoutes.js";
import adminEmployerRoutes from "./routes/adminEmployerRoutes.js";
import cron from "node-cron";
import { sendDailySummary } from "./services/dailySummary.js";
import { expireOldJobs } from "./services/jobExpiryCron.js";
import resumeOrderRoutes from "./routes/resumeOrder.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}));

app.use('/uploads', express.static(join(__dirname, 'uploads')));

connectDB();

app.get('/', (req, res) => res.send("Hello world"));

app.use("/api/auth", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/admin", adminRouter);
app.use("/api/jobs", jobRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminEmployerRoutes);
app.use("/api/resume", resumeOrderRoutes);


cron.schedule("30 2 * * *", () => {
  console.log("[Cron] Running daily summary...");
  sendDailySummary();          
});

//  Add this cron after existing cron
cron.schedule("0 0 * * *", () => {         // runs at midnight every day
  console.log("[Cron] Running job expiry check...");
  expireOldJobs();
});

app.listen(5000, () => console.log("Server running on 5000"));