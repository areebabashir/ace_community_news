import SportsNews from "../Models/sportsNewsModel.js";

// CREATE
export async function createSportsNews(req, res) {
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

    const news = await SportsNews.create(data);
    res.status(201).json({ message: "Sports news added successfully", id: news.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// READ ALL
export async function getAllSportsNews(req, res) {
  try {
    const rows = await SportsNews.findAll({ order: [["published_at", "DESC"]] });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// READ ONE
export async function getSportsNewsById(req, res) {
  try {
    const news = await SportsNews.findByPk(req.params.id);
    if (!news) return res.status(404).json({ message: "Sports news not found" });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// UPDATE
export async function updateSportsNews(req, res) {
  console.log("updateSportsNews");
  try {
    const id = req.params.id;
    const sportsNews = await SportsNews.findByPk(id);

    if (!sportsNews) {
      return res.status(404).json({ message: "Sports news not found" });
    }

    // Handle visuals - ensure consistent parsing from database
    let currentVisuals;
    try {
      if (typeof sportsNews.visuals === 'string') {
        currentVisuals = sportsNews.visuals ? JSON.parse(sportsNews.visuals) : { images: [] };
      } else if (typeof sportsNews.visuals === 'object' && sportsNews.visuals !== null) {
        currentVisuals = sportsNews.visuals;
      } else {
        currentVisuals = { images: [] };
      }
      
      // Ensure images array exists
      if (!currentVisuals.images) {
        currentVisuals.images = [];
      }
    } catch (err) {
      console.error('Error parsing sports news visuals:', err);
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
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.published_at !== undefined) updateData.published_at = req.body.published_at;
    
    // Always update visuals if we processed any files or removals
    if (req.files || removedImages.length > 0 || removeExistingVideo) {
      updateData.visuals = updatedVisuals;
    }

    // Update the sports news record
    const [updatedRowCount] = await SportsNews.update(updateData, {
      where: { id: id }
    });

    if (updatedRowCount === 0) {
      return res.status(404).json({ error: "Sports news not found or no changes made" });
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

    // Fetch the updated sports news to return
    const updatedSportsNews = await SportsNews.findByPk(id);
    
    // Parse visuals for response
    let responseVisuals;
    try {
      if (typeof updatedSportsNews.visuals === 'string') {
        responseVisuals = updatedSportsNews.visuals ? JSON.parse(updatedSportsNews.visuals) : { images: [] };
      } else if (typeof updatedSportsNews.visuals === 'object' && updatedSportsNews.visuals !== null) {
        responseVisuals = updatedSportsNews.visuals;
      } else {
        responseVisuals = { images: [] };
      }
      
      if (!responseVisuals.images) {
        responseVisuals.images = [];
      }
    } catch (err) {
      console.error('Error parsing response visuals:', err);
      responseVisuals = { images: [] };
    }

    // Return the updated sports news with parsed visuals
    const responseData = {
      ...updatedSportsNews.toJSON(),
      visuals: responseVisuals
    };

    res.json({ 
      message: "Sports news updated successfully",
      sportsNews: responseData
    });

  } catch (error) {
    console.error('Error updating sports news:', error);
    res.status(500).json({ 
      error: error.message || "Failed to update sports news",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// DELETE
export async function deleteSportsNews(req, res) {
  try {
    const deleted = await SportsNews.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Sports news not found" });
    res.json({ message: "Sports news deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}