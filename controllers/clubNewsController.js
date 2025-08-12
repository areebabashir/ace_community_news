// controllers/clubNewsController.js
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
    const news = await ClubNews.findAll({ where: { status: "draft" }});
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

// Update News (only if draft or pending)
export const updateNews = async (req, res) => {
  try {
    const id = req.params.id;
    const news = await ClubNews.findByPk(id);

    if (!news) return res.status(404).json({ message: "News not found" });

    if (["published"].includes(news.status)) {
      return res.status(400).json({ message: "Cannot update published news" });
    }

    await news.update(req.body);
    res.json({ message: "News updated", news });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
