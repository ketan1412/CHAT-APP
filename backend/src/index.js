import express from "express";
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import { connectDB } from "./lib/db.js";

dotenv.config()

const app = express();
const PORT = process.env.PORT

app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)

app.listen(PORT, () => {
    console.log("server listening on PORT "+ PORT)
    connectDB()
})