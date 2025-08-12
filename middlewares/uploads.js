import multer from "multer";
import path from "path";
import fs from "fs";


// === 1. Configure storage ===
// We’ll store files locally for now (you can switch to S3, Cloudinary later)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    if (file.fieldname === "images") {
      uploadPath = "uploads/club_news/images";
    } else if (file.fieldname === "video") {
      uploadPath = "uploads/club_news/videos";
    } else {
      uploadPath = "uploads/club_news/others";
    }

    // Check if directory exists, if not create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// === 2. File type filter ===
const fileFilter = (allowedMimeTypes) => {
  return (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  };
};

// === 3. Middleware Factory ===
// Flexible: we pass in field config and limits
export const createUploader = (fieldConfigs, sizeLimitsMB) => {
  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allAllowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
      ];
      if (allAllowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG, PNG, WebP, and MP4 allowed"), false);
      }
    },
    limits: {
      fileSize: sizeLimitsMB * 1024 * 1024, // MB → bytes
    },
  }).fields(fieldConfigs);
};

// === 4. Specific Middleware for Club News ===
export const uploadClubNewsVisuals = (req, res, next) => {
  // Max 3 images, 1 video
  const upload = createUploader(
    [
      { name: "images", maxCount: 3 },
      { name: "video", maxCount: 1 },
    ],
    20 // max size per file (largest case for video)
  );

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Validate total files
    const imagesCount = req.files?.images?.length || 0;
    const videoCount = req.files?.video?.length || 0;

    if (imagesCount > 3) {
      return res.status(400).json({ error: "Max 3 images allowed" });
    }
    if (videoCount > 1) {
      return res.status(400).json({ error: "Only 1 video allowed" });
    }
    if (imagesCount + videoCount > 4) {
      return res
        .status(400)
        .json({ error: "Total files cannot exceed 4 (images + video)" });
    }

    next();
  });
};