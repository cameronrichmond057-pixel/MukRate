let option1 = null;
let option2 = null;

function pickRandomPair() {
    if (images.length < 2) return;
    let pair = [];
    while (pair.length < 2) {
        let candidate = images[Math.floor(Math.random() * images.length)];
        if (!pair.includes(candidate)) pair.push(candidate);
    }
    return pair;
}

function getPersonName(filename) {
    const namePart = filename.split("/").pop().split(".")[0];
    const parts = namePart.split("-");
    if (parts.length >= 2) {
        const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const last = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        return first + " " + last;
    }
    return namePart;
}

// Webcam setup
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const photoName = document.getElementById('photoName');

// Ask for webcam permission
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert('Camera access denied: ' + err);
  });

// Handle photo capture
takePhotoBtn.addEventListener('click', async () => {
  const name = photoName.value.trim();
  if (!name) {
    alert('Please enter your name!');
    return;
  }

  // Draw video frame to canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert canvas to blob
  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('image', blob, 'webcam.png'); // temporary filename
    formData.append('name', name);

    // Send to server
    const res = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();
    alert(`${result.image.name} uploaded!`);

    // Reload images.js dynamically
    fetch('images.js')
      .then(response => response.text())
      .then(text => {
        eval(text);
        currentIndex = images.length - 1; // start with newly uploaded image
        showImage();
        updateLeaderboard();
      });

    // Clear name field
    photoName.value = '';
  }, 'image/png');
});


async function updateLeaderboard() {
    try {
        const res = await fetch("/leaderboard");
        const points = await res.json();

        const list = document.getElementById("leaderboard-list");
        list.innerHTML = "";

        Object.entries(points)
            .sort((a, b) => b[1] - a[1])
            .forEach(([img, score], index) => {
                const filename = img.split("/").pop();
                const personName = getPersonName(filename);

                const li = document.createElement("li");
                li.innerHTML = `
                    <span class="rank">${index + 1}.</span>
                    <span class="img-name">
                        <img src="${img}" alt="${personName}">
                        <strong>${personName}</strong>
                    </span>
                    <span class="score">${score} / 10</span>
                `;
                list.appendChild(li);
            });
    } catch (err) {
        console.error("Failed to load leaderboard:", err);
    }
}

function renderOptions() {
    [option1, option2] = pickRandomPair();
    if (!option1 || !option2) return;

    document.getElementById("option1").innerHTML = `<img src="${option1}" alt="">`;
    document.getElementById("option2").innerHTML = `<img src="${option2}" alt="">`;
}

async function vote(winner, loser) {
    try {
        await fetch("/vote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ winner, loser })
        });

        await updateLeaderboard();
        renderOptions();
    } catch (err) {
        console.error("Vote failed:", err);
    }
}

document.getElementById("option1").addEventListener("click", () => vote(option1, option2));
document.getElementById("option2").addEventListener("click", () => vote(option2, option1));

updateLeaderboard();
renderOptions();
