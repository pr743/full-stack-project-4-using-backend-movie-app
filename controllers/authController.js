import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};


export const register = async (req, res) => {
    try {

        const { name, email, password, adminSecret } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        let role = "user";

        if (
            adminSecret &&
            adminSecret.trim() === process.env.ADMIN_SECRET
        ) {
            role = "admin";
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        res.status(201).json({
            success: true,
            user,
        });

    } catch (error) {
        console.log("REGISTER ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        res.json({
            success: true,
            user,
        });

    } catch (error) {
        console.log("LOGIN ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};


export const logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
};




export const getProfile = async (req, res) => {
    try {
        const user = req.user;


        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                Watchlist: user.watchlist || []
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}