// controllers/announcementController.js
import Announcement from "../Models/announcementModel.js";
 
// Create
export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
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
    const updated = await Announcement.update(req.body, {
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
