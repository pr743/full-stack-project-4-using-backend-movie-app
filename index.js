import express from "express";

import dotenv from "dotenv"

import cors from "cors"
import dns from "dns";


import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";




dns.setServers(["1.1.1.1", "8.8.8.8"]);


dotenv.config();
const app = express();

connectDB();


app.use(
    cors({
        origin: "https://movie-app-teal-tau.vercel.app/login",
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());


app.use(express.urlencoded({ extended: true }));



app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);


app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});


app.get("/", (req, res) => {
    res.send("Movie app  Backend running on sever");

});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
