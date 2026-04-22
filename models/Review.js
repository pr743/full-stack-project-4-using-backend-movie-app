import mongoose from "mongoose";




const reviewSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie"
    },

    rating: {
        type: Number,
    },

    comment: {
        type: String,
    }
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);