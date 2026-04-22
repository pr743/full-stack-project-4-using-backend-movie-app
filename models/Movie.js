import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        posterUrl: {
            type: String,
            default: "uploading",
        },

        trailerUrl: {
            type: String,
        },


        duration: {
            type: String,

        },

        releaseDate: {
            type: String,

        },


        rating: {
            type: Number,
            min: 0,
            max: 10
        },

        genre: {
            type: String,
            required: true,
        },

        tagline: {
            type: String,
            trim: true,

        },



        ratings: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                value: {
                    type: Number,
                }
            }
        ],

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: [],
            }
        ],


        dislikes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: [],
            }
        ],

        status: {
            type: String,
            enum: ["processing", "ready", "failed"],
            default: "processing",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;