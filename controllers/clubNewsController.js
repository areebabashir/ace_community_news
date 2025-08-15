// controllers/clubNewsController.js
import { log } from "console";
import ClubNews from "../Models/ClubNewsModel.js";

// Create or Save Draft
export const createNews = async (req, res) => {
  try {
    const data = req.body;

    // Build visuals data from uploaded files
    const visuals = {};
    if (req.files) {
      if (req.files.images) {
        visuals.images = req.files.images.map(file => ({
          filename: file.filename,
          path: file.path,
        }));
      }
      if (req.files.video && req.files.video.length > 0) {
        visuals.video = {
          filename: req.files.video[0].filename,
          path: req.files.video[0].path,
        };
      }
    }

    // Add visuals JSON to data
    data.visuals = visuals;

    const news = await ClubNews.create(data);

    res.status(201).json({ message: "News created", news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Published News (or filtered by club or status)
export const getPublishedNews = async (req, res) => {
  try {
    const news = await ClubNews.findAll({ where: { status: "published" }, order: [["publish_date", "DESC"]] });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getDraftNews = async (req, res) => {
  try {
    console.log("getting draft")
    const news = await ClubNews.findAll({ where: { status: "draft" } });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Pending Approval News (for Super Admin)
export const getPendingNews = async (req, res) => {
  try {
    const news = await ClubNews.findAll({ where: { status: "pending_approval" }, order: [["createdAt", "DESC"]] });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getNewsById = async (req, res) => {
  try {
    const news = await ClubNews.findByPk(req.params.id);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update News (only if draft or pending)
export const updateNews = async (req, res) => {
  try {
    const id = req.params.id;
    const news = await ClubNews.findByPk(id);

    if (!news) return res.status(404).json({ message: "News not found" });

    if (["published"].includes(news.status)) {
      return res.status(400).json({ message: "Cannot update published news" });
    }

    // Handle visuals - ensure consistent parsing from database
    let currentVisuals;
    try {
      if (typeof news.visuals === 'string') {
        currentVisuals = news.visuals ? JSON.parse(news.visuals) : { images: [] };
      } else if (typeof news.visuals === 'object' && news.visuals !== null) {
        currentVisuals = news.visuals;
      } else {
        currentVisuals = { images: [] };
      }
      
      // Ensure images array exists
      if (!currentVisuals.images) {
        currentVisuals.images = [];
      }
    } catch (err) {
      console.error('Error parsing visuals:', err);
      currentVisuals = { images: [] };
    }

    // Handle removed images
    let removedImages = [];
    if (req.body.removed_images) {
      try {
        removedImages = JSON.parse(req.body.removed_images);
      } catch (err) {
        console.error('Error parsing removed_images:', err);
        removedImages = [];
      }
    }
    
    // Filter out removed images from current images
    const updatedImages = currentVisuals.images.filter(
      img => !removedImages.includes(img.filename)
    );

    // Add new images with proper structure
    const newImages = (req.files?.images || []).map(file => ({
      filename: file.filename,
      path: file.path.replace(/\\/g, '/')
    }));

    // Handle video
    let video = currentVisuals.video || null;
    
    // Check if we should remove existing video
    const removeExistingVideo = req.body.remove_existing_video === 'true';
    if (removeExistingVideo && video?.path) {
      // Remove old video file
      try {
        const fs = await import('fs');
        const path = await import('path');
        fs.unlinkSync(path.join(process.cwd(), video.path));
      } catch (err) {
        console.error('Error deleting existing video:', err);
      }
      video = null;
    }

    // Add new video if uploaded
    if (req.files?.video?.[0]) {
      // Remove old video file if exists and not already removed
      if (video?.path && !removeExistingVideo) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          fs.unlinkSync(path.join(process.cwd(), video.path));
        } catch (err) {
          console.error('Error deleting old video:', err);
        }
      }
      
      video = {
        filename: req.files.video[0].filename,
        path: req.files.video[0].path.replace(/\\/g, '/')
      };
    }

    // Prepare the final visuals object with proper structure
    const updatedVisuals = {
      images: [...updatedImages, ...newImages]
    };

    // Only add video if it exists
    if (video) {
      updatedVisuals.video = video;
    }

    // Prepare update data
    const updateData = {
      title: req.body.title,
      headline: req.body.headline,
      body: req.body.body,
      created_by_role: req.body.created_by_role,
      display_publisher: req.body.display_publisher === 'true',
      club_id: req.body.club_id || news.club_id,
      status: req.body.status || news.status,
      visuals: JSON.stringify(updatedVisuals) // Stringify for database storage
    };

    // Update the news record
    await news.update(updateData);

    // Cleanup removed image files
    if (removedImages.length > 0) {
      const fs = await import('fs');
      const path = await import('path');
      
      removedImages.forEach(filename => {
        const img = currentVisuals.images.find(i => i.filename === filename);
        if (img?.path) {
          try {
            fs.unlinkSync(path.join(process.cwd(), img.path));
          } catch (err) {
            console.error('Error deleting removed image:', err);
          }
        }
      });
    }
    const updatedNews = await ClubNews.findByPk(id);

    // Fetch the updated news to return
    await updatedNews.reload();
    
    // Parse visuals for response - ensure consistent object format
    let responseVisuals;
    try {
      if (typeof updatedNews.visuals === 'string') {
        responseVisuals = updatedNews.visuals ? JSON.parse(updatedNews.visuals) : { images: [] };
      } else if (typeof updatedNews.visuals === 'object' && updatedNews.visuals !== null) {
        responseVisuals = updatedNews.visuals;
      } else {
        responseVisuals = { images: [] };
      }
      
      // Ensure images array exists
      if (!responseVisuals.images) {
        responseVisuals.images = [];
      }
    } catch (err) {
      console.error('Error parsing response visuals:', err);
      responseVisuals = { images: [] };
    }

    // Return the updated news with parsed visuals
    const responseData = {
      ...updatedNews.toJSON(),
      visuals: responseVisuals // Return as object for frontend
    };

    res.json({ 
      message: "News updated successfully",
      news: responseData
    });

  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ 
      error: error.message || "Failed to update news",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Submit for Approval
export const submitForApproval = async (req, res) => {
  try {
    const id = req.params.id;
    const news = await ClubNews.findByPk(id);

    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.status !== "draft") {
      return res.status(400).json({ message: "Only draft news can be submitted" });
    }

    await news.update({ status: "pending_approval" });
    res.json({ message: "News submitted for approval" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve News (Super Admin)
export const approveNews = async (req, res) => {
  try {
    const id = req.params.id;
    const news = await ClubNews.findByPk(id);

    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.status !== "pending_approval") {
      return res.status(400).json({ message: "Only pending news can be approved" });
    }

    await news.update({ status: "published" });
    res.json({ message: "News approved and published" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject News (Super Admin)
export const rejectNews = async (req, res) => {
  try {
    const id = req.params.id;
    const { rejection_comments } = req.body;
    const news = await ClubNews.findByPk(id);

    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.status !== "pending_approval") {
      return res.status(400).json({ message: "Only pending news can be rejected" });
    }

    await news.update({ status: "rejected", rejection_comments });
    res.json({ message: "News rejected", news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getRejectedNews = async (req, res) => {
  try {
    const news = await ClubNews.findAll({ where: { status: "rejected" }, order: [["createdAt", "DESC"]] });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
