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

    const [updated] = await SportsNews.update(data, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: "Sports news not found" });
    res.json({ message: "Sports news updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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