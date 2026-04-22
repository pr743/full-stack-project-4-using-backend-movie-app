import express from "express";
import { getProfile, login, logout, register } from "../controllers/authController.js";
import { deleteUser, getAdminStats, getUsers } from "../controllers/adminController.js";



const router = express.Router();



router.get("/stats", getAdminStats);

router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);


export default router;