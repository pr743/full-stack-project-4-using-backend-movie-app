import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type:
            String,
        unique: true
    },

    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    watchlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie"
    }]
});

export default mongoose.model("User", userSchema);