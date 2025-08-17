import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dbConnection from "./utils/connectDB.js";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";

const app = express();
dotenv.config();
dbConnection();
const PORT = process.env.PORT || 8800;

app.use(
  cors({
    origin: ["https://mern-task-manager-app.netlify.app", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api", routes);

app.get("/", (req, res) => {
  console.log("Hello World");
  res.json({ message: "Welcome to the Task Manager API" });
});

app.use(routeNotFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));