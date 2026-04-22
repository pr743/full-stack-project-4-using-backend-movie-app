import Review from "../models/Review.js";

export const addReview = async (req, res) => {
    const { rating, comment } = req.body;

    const review = await Review.create({
        user: req.user._id,
        movie: req.params.movieId,
        rating,
        comment,
    });

    res.json(review);
};