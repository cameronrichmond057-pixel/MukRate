const fs = require("fs");
const path = require("path");

// Path to your images folder
const imagesFolder = path.join(__dirname, "images");

// Output file
const outputFile = path.join(__dirname, "images.js");

// Read all files in the images folder
fs.readdir(imagesFolder, (err, files) => {
    if (err) {
        console.error("Failed to read images folder:", err);
        return;
    }

    // Filter only image files (jpg, png, jpeg)
    const images = files.filter(file =>
        file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".jpeg")
    );

    // Create JS array string
    const jsContent = `const images = [\n${images.map(img => `    "images/${img}"`).join(",\n")}\n];\n`;

    // Write to images.js
    fs.writeFile(outputFile, jsContent, err => {
        if (err) {
            console.error("Failed to write images.js:", err);
            return;
        }
        console.log(`images.js created successfully with ${images.length} images!`);
    });
});
