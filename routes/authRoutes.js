import express from "express";
import { getProfile, login, logout, register } from "../controllers/authController.js";



const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);


router.get("/profile",getProfile);


export default router;