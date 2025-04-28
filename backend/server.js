const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const shortid = require("shortid");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    default: shortid.generate,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400,
  },
  clicks: {
    type: Number,
    default: 0,
  },
});

const URL = mongoose.model("URL", urlSchema);

app.post("/api/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "Please provide a URL" });
  }

  try {
    let url = await URL.findOne({ originalUrl });

    if (url) {
      return res.json(url);
    }

    url = new URL({
      originalUrl,
      shortCode: shortid.generate(),
    });

    await url.save();
    return res.json(url);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/urls", async (req, res) => {
  try {
    const urls = await URL.find().sort({ createdAt: -1 });
    return res.json(urls);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/:shortCode", async (req, res) => {
  try {
    const url = await URL.findOne({ shortCode: req.params.shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    url.clicks++;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
