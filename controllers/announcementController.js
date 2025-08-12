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
    const data = req.body;

    // Build visuals data from uploaded files if any
    if (req.files) {
      const visuals = {};
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
      // Add visuals JSON to data
      data.visuals = visuals;
    }

    const updated = await Announcement.update(data, {
      where: { id: req.params.id },
    });
    if (updated[0] === 0)
      return res.status(404).json({ error: "Not found or no changes" });
    res.json({ message: "Announcement updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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