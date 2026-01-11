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
