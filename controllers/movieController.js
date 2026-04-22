import cloudinary from "../config/cloudinary.js";
import Movie from "../models/Movie.js";
import fs from "fs";



const deleteLocalFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted local file: ${filePath}`);
    }
};



const getPublicId = (url) => {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    return filename.split(".")[0];
};

const uploadToCloudinary = async (movieId, posterPath) => {
    try {
        const [posterResult, videoResult] = await Promise.all([
            cloudinary.uploader.upload(posterPath, {
                folder: "movies",
                resource_type: "image",
            }),
        ]);

        await Movie.findByIdAndUpdate(movieId, {
            posterUrl: posterResult.secure_url,

            posterPublicId: posterResult.public_id,

            status: "ready",
        });

        console.log("Poster URL:", posterResult.secure_url);

    } catch (error) {
        await Movie.findByIdAndUpdate(movieId, { status: "failed" });
    } finally {
        deleteLocalFile(posterPath);
    }
};
export const addMovie = async (req, res) => {
    try {
        console.log("Body:", req.body);
        console.log("FILES:", req.files);


        const { title, description, genre, trailerUrl, duration, rating, tagline, releaseDate } = req.body || {};

        const posterFile = req.files?.poster?.[0];

        if (!title || !description || !posterFile || !trailerUrl || !duration || !rating || !tagline || !releaseDate || !genre) {

            if (posterFile) deleteLocalFile(posterFile.path);
            return res.status(400).json({
                success: false,
                message: `Missing: ${!title ? "title " : ""}${!description ? "description " : ""}${!posterFile ? "poster " : ""}`,
            });
        }

        const movie = await Movie.create({
            title,
            description,
            genre,
            trailerUrl,
            duration,
            rating,
            releaseDate,
            tagline,
            posterUrl: "uploading",
            status: "processing",
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Movie saved! Media is uploading in background.",
            data: movie,
        });
        uploadToCloudinary(movie._id, posterFile.path)

    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }


        if (movie.posterUrl && movie.posterUrl !== "uploading") {
            const publicId = getPublicId(movie.posterUrl);
            await cloudinary.uploader.destroy(publicId);
        }


        await movie.deleteOne();

        res.status(200).json({
            success: true,
            message: "Movie + media deleted successfully",
        });

    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



export const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Movie ID",
            });
        }

        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }

        const {
            title,
            description,
            genre,
            trailerUrl,
            duration,
            rating,
            tagline,
            releaseDate,
        } = req.body;

        let updatedData = {};

        if (title) updatedData.title = title;
        if (description) updatedData.description = description;
        if (genre) updatedData.genre = genre;
        if (trailerUrl) updatedData.trailerUrl = trailerUrl;
        if (duration) updatedData.duration = duration;
        if (tagline) updatedData.tagline = tagline;


        if (rating) {
            const cleanRating = parseFloat(rating);

            if (isNaN(cleanRating)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid rating value",
                });
            }

            updatedData.rating = cleanRating;
        }


        if (releaseDate) {
            updatedData.releaseDate = new Date(releaseDate);
        }


        if (req.files?.poster) {
            const posterFile = req.files.poster[0];

            if (movie.posterUrl && movie.posterUrl !== "uploading") {
                const publicId = getPublicId(movie.posterUrl);
                await cloudinary.uploader.destroy(publicId);
            }

            const result = await cloudinary.uploader.upload(posterFile.path, {
                folder: "movies",
                resource_type: "image",
            });

            updatedData.posterUrl = result.secure_url;

            deleteLocalFile(posterFile.path);
        }

        const updatedMovie = await Movie.findByIdAndUpdate(
            id,
            updatedData,
            { returnDocument: "after" }
        );

        res.status(200).json({
            success: true,
            data: updatedMovie,
        });

    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const toggleWatchlist = async (req, res) => {
    try {
        const user = req.user;
        const movieId = req.params.movieId;

        if (!user.watchlist) {
            user.watchlist = [];
        }

        const index = user.watchlist.findIndex(
            (id) => id.toString() === movieId
        );

        if (index > -1) {
            user.watchlist.splice(index, 1);
        } else {
            user.watchlist.push(movieId);
        }

        await user.save();

        res.json({
            success: true,
            watchlist: user.watchlist,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};



export const getSingleMovie = async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    res.json({
        success: true,
        data: movie,
    });
};



export const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find();

        res.json({
            success: true,
            data: movies,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};








export const rateMovie = async (req, res) => {
    try {
        const { value } = req.body;

        const movie = await Movie.findById(req.params.id);

        const existing = movie.ratings.find((r) => r.user.toString() === req.user._id.toString());


        if (existing) {
            existing.value = value;

        } else {
            movie.ratings.push({
                user: req.user._id,
                value
            });
        }


        await movie.save();


        res.json({
            success: true,
            ratings: movie.ratings
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })

    }
};



export const toggleLike = async (req, res) => {
    try {
        const userId = req.user._id;
        const movieId = req.params.id;

        const movie = await Movie.findById(movieId);


        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }


        if (!movie.likes) movie.likes = [];
        if (!movie.dislikes) movie.dislikes = [];

        const alreadyLiked = movie.likes.some(
            (id) => id.toString() === userId.toString()
        );

        if (alreadyLiked) {

            movie.likes = movie.likes.filter(
                (id) => id.toString() !== userId.toString()
            );
        } else {

            movie.likes.push(userId);


            movie.dislikes = movie.dislikes.filter(
                (id) => id.toString() !== userId.toString()
            );
        }

        await movie.save();

        res.json({
            success: true,
            likes: movie.likes,
            dislikes: movie.dislikes,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const toggleDislike = async (req, res) => {
    try {
        const userId = req.user._id;
        const movieId = req.params.id;

        const movie = await Movie.findById(movieId);


        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }


        if (!movie.likes) movie.likes = [];
        if (!movie.dislikes) movie.dislikes = [];

        const alreadyDisliked = movie.dislikes.some(
            (id) => id.toString() === userId.toString()
        );

        if (alreadyDisliked) {
            movie.dislikes = movie.dislikes.filter(
                (id) => id.toString() !== userId.toString()
            );
        } else {
            movie.dislikes.push(userId);


            movie.likes = movie.likes.filter(
                (id) => id.toString() !== userId.toString()
            );
        }

        await movie.save();

        res.json({
            success: true,
            likes: movie.likes,
            dislikes: movie.dislikes,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};