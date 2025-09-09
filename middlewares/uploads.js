import multer from "multer";
import path from "path";
import fs from "fs";

// === 1. Configure storage ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    // Dynamic folder selection based on request property
    if (req.uploadFolder) {
      if (file.fieldname === "images") {
        uploadPath = `uploads/${req.uploadFolder}/images`;
      } else if (file.fieldname === "video") {
        uploadPath = `uploads/${req.uploadFolder}/videos`;
      } else {
        uploadPath = `uploads/${req.uploadFolder}/others`;
      }
    } else {
      // fallback (should not happen if middleware sets req.uploadFolder)
      uploadPath = "uploads/misc";
    }

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
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WebP, and MP4 allowed"), false);
  }
};

// === 3. Factory function ===
const createUploader = (fieldConfigs, sizeLimitsMB) => {
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: sizeLimitsMB * 1024 * 1024, // MB → bytes
    },
  }).fields(fieldConfigs);
};

// === 4. Reusable file handling function ===
const handleUpload = (folderName) => {
  return (req, res, next) => {
    req.uploadFolder = folderName; // tells storage where to save

    const upload = createUploader(
      [
        { name: "images", maxCount: 3 },
        { name: "video", maxCount: 1 },
      ],
      20 // max size in MB per file
    );

    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

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
};

// === 5. Separate middlewares for each type ===
export const uploadClubNewsVisuals = handleUpload("club_news");
export const uploadAnnouncementVisuals = handleUpload("announcements");
export const uploadSportsNewsVisuals = handleUpload("sports_news");
export const uploadTutorialVisuals = handleUpload("tutorials"); 
export const uploadAdsVisuals = handleUpload("ads");
export const uploadProductVisuals = handleUpload("products");
