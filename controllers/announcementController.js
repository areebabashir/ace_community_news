// controllers/announcementController.js
import Announcement from "../Models/announcementModel.js";
 
// Create
export const createAnnouncement = async (req, res) => {
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

    const announcement = await Announcement.create(data);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      order: [["published_at", "DESC"]],
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get By ID
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return res.status(404).json({ error: "Not found" });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
export const updateAnnouncement = async (req, res) => {
  try {
    const id = req.params.id;
    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Handle visuals - ensure consistent parsing from database
    let currentVisuals;
    try {
      if (typeof announcement.visuals === 'string') {
        currentVisuals = announcement.visuals ? JSON.parse(announcement.visuals) : { images: [] };
      } else if (typeof announcement.visuals === 'object' && announcement.visuals !== null) {
        currentVisuals = announcement.visuals;
      } else {
        currentVisuals = { images: [] };
      }
      
      // Ensure images array exists
      if (!currentVisuals.images) {
        currentVisuals.images = [];
      }
    } catch (err) {
      console.error('Error parsing announcement visuals:', err);
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

    // Prepare update data - only include fields that are being updated
    const updateData = {};
    
    // Add text fields if they exist in request body
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.headline !== undefined) updateData.headline = req.body.headline;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.author !== undefined) updateData.author = req.body.author;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.published_at !== undefined) updateData.published_at = req.body.published_at;
    if (req.body.source !== undefined) updateData.source = req.body.source;
    
    // Always update visuals if we processed any files or removals
    if (req.files || removedImages.length > 0 || removeExistingVideo) {
      updateData.visuals = updatedVisuals; // Store as object
    }

    // Update the announcement record
    const [updatedRowCount] = await Announcement.update(updateData, {
      where: { id: id }
    });

    if (updatedRowCount === 0) {
      return res.status(404).json({ error: "Announcement not found or no changes made" });
    }

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

    // Fetch the updated announcement to return
    const updatedAnnouncement = await Announcement.findByPk(id);
    
    // Parse visuals for response - ensure consistent object format
    let responseVisuals;
    try {
      if (typeof updatedAnnouncement.visuals === 'string') {
        responseVisuals = updatedAnnouncement.visuals ? JSON.parse(updatedAnnouncement.visuals) : { images: [] };
      } else if (typeof updatedAnnouncement.visuals === 'object' && updatedAnnouncement.visuals !== null) {
        responseVisuals = updatedAnnouncement.visuals;
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

    // Return the updated announcement with parsed visuals
    const responseData = {
      ...updatedAnnouncement.toJSON(),
      visuals: responseVisuals // Return as object for frontend
    };

    res.json({ 
      message: "Announcement updated successfully",
      announcement: responseData
    });

  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ 
      error: error.message || "Failed to update announcement",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Delete
export const deleteAnnouncement = async (req, res) => {
  try {
    const deleted = await Announcement.destroy({
      where: { id: req.params.id },
    });
    if (!deleted)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};