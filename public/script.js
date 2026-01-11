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
