import multer from "multer";
import fs from "fs";


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
    },
});

const uploadCloud = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "poster") {
            if (!file.mimetype.startsWith("image/")) {
                return cb(new Error("Poster must be an image file"), false);
            }
        }
        if (file.fieldname === "video") {
            if (!file.mimetype.startsWith("video/")) {
                return cb(new Error("Video must be a video file"), false);
            }
        }
        cb(null, true);
    },
});

export default uploadCloud;