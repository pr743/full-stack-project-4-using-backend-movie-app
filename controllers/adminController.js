import Movie from "../models/Movie.js";
import User from "../models/user.js";

export const getAdminStats = async (req, res) => {
    try {
        const totalMovies = await Movie.countDocuments();
        const totalUsers = await User.countDocuments();


        const users = await User.find({}, "watchlist");

        let totalWatchlist = 0;
        users.forEach((u) => {
            totalWatchlist += u.watchlist?.length || 0;
        });

        res.json({
            success: true,
            data: {
                totalMovies,
                totalUsers,
                totalWatchlist,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



export const getUsers = async (req, res) => {
    const users = await User.find();
    res.json({ data: users });
};

export const deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
};