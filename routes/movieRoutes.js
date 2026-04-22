import express from "express";
import {
    addMovie,
    deleteMovie,
    updateMovie,
    getSingleMovie,
    getMovies,
    toggleWatchlist,
    rateMovie,
    toggleLike,
    toggleDislike,
} from "../controllers/movieController.js";

import uploadCloud from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import { isAdmin } from "../middleware/role.js";

const router = express.Router();


router.post("/watchlist/:movieId", protect, toggleWatchlist);


router.get("/", getMovies);
router.get("/:id", getSingleMovie);

router.post(
    "/",
    protect,
    isAdmin,
    uploadCloud.fields([{ name: "poster", maxCount: 1 }]),
    addMovie
);

router.put(
    "/:id",
    protect,
    isAdmin,
    uploadCloud.fields([{ name: "poster", maxCount: 1 }]),
    updateMovie
);

router.delete("/:id", protect, isAdmin, deleteMovie);


router.post("/rate/:id", protect, rateMovie);
router.post("/like/:id", protect, toggleLike);
router.post("/dislike/:id", protect, toggleDislike);

export default router;