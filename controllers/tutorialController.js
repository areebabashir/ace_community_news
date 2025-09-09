import Tutorial from "../Models/tutorialModel.js";

// Create tutorial
export const createTutorial = async (req, res) => {
  try {
    const data = req.body;

    // Build visuals from uploaded files
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

    data.visuals = visuals;

    const tutorial = await Tutorial.create(data);
    res.status(201).json({ message: "Tutorial created", tutorial });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tutorials
export const getAllTutorials = async (req, res) => {
  try {
    const tutorials = await Tutorial.findAll({ order: [["published_at", "DESC"]] });
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tutorial by ID
export const getTutorialById = async (req, res) => {
  try {
    const tutorial = await Tutorial.findByPk(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: "Tutorial not found" });
    }
    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update tutorial
export const updateTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findByPk(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: "Tutorial not found" });
    }

    const data = req.body;

    // Handle updated visuals if new files uploaded
    const visuals = tutorial.visuals || {};
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

    data.visuals = visuals;

    await tutorial.update(data);
    res.json({ message: "Tutorial updated", tutorial });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete tutorial
export const deleteTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findByPk(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: "Tutorial not found" });
    }

    await tutorial.destroy();
    res.json({ message: "Tutorial deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
