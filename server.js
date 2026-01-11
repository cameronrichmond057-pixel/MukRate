const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // serve frontend

// Load points from file
let points = {};
const dataFile = "points.json";
if (fs.existsSync(dataFile)) {
    points = JSON.parse(fs.readFileSync(dataFile));
}
const multer = require('multer');
const path = require('path');

// Setup storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); // save uploaded images here
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  const { name } = req.body;
  if (!req.file || !name) return res.status(400).send('Name and image required');

  // Load existing images.js
  const imagesJsPath = path.join(__dirname, 'public', 'images.js');
  let imagesArr = require(imagesJsPath).images;

  const newImage = {
    name: name,
    path: `/images/${req.file.filename}`,
    points: 5
  };

  imagesArr.push(newImage);

  // Write updated images.js
  const fileContent = `const images = ${JSON.stringify(imagesArr, null, 2)};`;
  fs.writeFileSync(imagesJsPath, fileContent);

  res.json({ message: 'Uploaded successfully', image: newImage });
});


// GET leaderboard
app.get("/leaderboard", (req, res) => {
    res.json(points);
});

// POST vote
// body: { winner: "filename", loser: "filename" }
app.post("/vote", (req, res) => {
    const { winner, loser } = req.body;

    if (winner) points[winner] = Math.min((points[winner] || 5) + 1, 10);
    if (loser) points[loser] = Math.max((points[loser] || 5) - 1, 0);

    fs.writeFileSync(dataFile, JSON.stringify(points));
    res.json({ success: true, points });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
