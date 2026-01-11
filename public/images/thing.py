import os
import json

# Folder containing images
image_folder = "images"

# Get all files in the folder (filter for jpg/png)
image_files = [f for f in os.listdir(image_folder) if f.lower().endswith((".jpg", ".jpeg", ".png"))]

# Save as JSON
with open("images.json", "w") as f:
    json.dump(image_files, f, indent=4)

print(f"Saved {len(image_files)} images to images.json")
