import SportsNews from "../Models/sportsNewsModel.js";

// CREATE
export async function createSportsNews(req, res) {
  try {
    const news = await SportsNews.create(req.body);
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
    const [updated] = await SportsNews.update(req.body, { where: { id: req.params.id } });
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
