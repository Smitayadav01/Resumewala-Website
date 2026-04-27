import express from "express";
import connectDB from "./config/db.js";
import userRouter from './routes/userRouter.js'
import profileRouter from "./routes/profile.js"
import adminRouter from "./routes/admin.js"
import cors from "cors";
import jobRoutes from "./routes/job.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from "dotenv";
import contactRoutes from "./routes/contact.js";

dotenv.config();

const app = express();

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
}));


app.use('/uploads', express.static(join(__dirname, 'uploads')));

connectDB()

app.get('/', (req, res) => {
    return res.send("Hellow woerld")
})

app.use("/api/auth", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/admin", adminRouter);
app.use("/api/jobs", jobRoutes);
app.use("/api/contact", contactRoutes);

app.listen(5000, () => console.log("Server running on 5000"));
