let students = JSON.parse(localStorage.getItem("students")) || [];

function register() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if (!username || !password) {
        document.getElementById("error").innerText = "Username and password required!";
        return;
    }

    if (students.length >= 500) {
        document.getElementById("error").innerText = "Max student limit reached!";
        return;
    }

    if (students.some(student => student.username === username)) {
        document.getElementById("error").innerText = "Username already taken!";
        return;
    }

    students.push({ username, password, challenges: [] });
    localStorage.setItem("students", JSON.stringify(students));
    document.getElementById("error").innerText = "Registered! Now login.";
}

function login() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    let user = students.find(student => student.username === username && student.password === password);

    if (!user) {
        document.getElementById("error").innerText = "Invalid login!";
        return;
    }

    sessionStorage.setItem("user", username);
    window.location.href = "dashboard.html";
}

function logout() {
    sessionStorage.removeItem("user");
    window.location.href = "index.html";
}

function addChallenge() {
    let user = sessionStorage.getItem("user");
    let challengeText = document.getElementById("new-challenge").value.trim();

    if (!challengeText) return;

    let userIndex = students.findIndex(student => student.username === user);
    students[userIndex].challenges.push({ text: challengeText, progress: Array(30).fill(null), completed: false });

    localStorage.setItem("students", JSON.stringify(students));
    document.getElementById("new-challenge").value = "";
    loadChallenges();
}

function updateDayStatus(challengeIndex, dayIndex) {
    let user = sessionStorage.getItem("user");
    let student = students.find(s => s.username === user);

    if (!student.challenges[challengeIndex].progress) {
        student.challenges[challengeIndex].progress = Array(30).fill(null);
    }

    let currentStatus = student.challenges[challengeIndex].progress[dayIndex];

    if (currentStatus === "✔") {
        student.challenges[challengeIndex].progress[dayIndex] = null; // Unmark
    } else {
        student.challenges[challengeIndex].progress[dayIndex] = "✔"; // Mark as done
    }

    localStorage.setItem("students", JSON.stringify(students));
    loadChallenges();
}

function removeChallenge(challengeIndex) {
    let user = sessionStorage.getItem("user");
    let student = students.find(s => s.username === user);

    student.challenges.splice(challengeIndex, 1);
    localStorage.setItem("students", JSON.stringify(students));
    loadChallenges();
}

function markChallengeComplete(challengeIndex) {
    let user = sessionStorage.getItem("user");
    let student = students.find(s => s.username === user);

    student.challenges[challengeIndex].progress = student.challenges[challengeIndex].progress.map(day => day || "❌");

    student.challenges[challengeIndex].completed = true;
    localStorage.setItem("students", JSON.stringify(students));
    loadChallenges();
}

function loadChallenges() {
    let user = sessionStorage.getItem("user");
    let student = students.find(s => s.username === user);
    let challengeList = document.getElementById("challenge-list");

    challengeList.innerHTML = "";

    student.challenges.forEach((challenge, challengeIndex) => {
        let challengeItem = document.createElement("div");
        challengeItem.className = "challenge-item";
        
        let challengeTitle = document.createElement("h3");
        challengeTitle.innerText = challenge.text;
        challengeItem.appendChild(challengeTitle);

        if (!challenge.progress) {
            challenge.progress = Array(30).fill(null);
        }

        let completedDays = challenge.progress.filter(day => day === "✔").length;
        let missedDays = challenge.progress.filter(day => day === "❌").length;

        let summary = document.createElement("p");
        summary.innerText = `✔ Done: ${completedDays} | ❌ Missed: ${missedDays}`;
        challengeItem.appendChild(summary);

        let dayTracker = document.createElement("div");
        dayTracker.className = "day-tracker";

        for (let i = 0; i < 30; i++) {
            let dayCircle = document.createElement("div");
            dayCircle.className = "day-circle";
            dayCircle.innerText = i + 1;

            if (challenge.progress[i] === "✔") {
                dayCircle.classList.add("completed");
            } else if (challenge.progress[i] === "❌") {
                dayCircle.classList.add("missed");
            }

            dayCircle.onclick = function () {
                updateDayStatus(challengeIndex, i);
            };

            dayTracker.appendChild(dayCircle);
        }

        challengeItem.appendChild(dayTracker);

        let removeBtn = document.createElement("button");
        removeBtn.innerText = "Remove";
        removeBtn.className = "remove-btn";
        removeBtn.onclick = function () {
            removeChallenge(challengeIndex);
        };

        let completeBtn = document.createElement("button");
        completeBtn.innerText = "Mark Complete";
        completeBtn.className = "complete-btn";
        completeBtn.onclick = function () {
            markChallengeComplete(challengeIndex);
        };

        challengeItem.appendChild(completeBtn);
        challengeItem.appendChild(removeBtn);

        if (challenge.completed) {
            challengeItem.classList.add("challenge-completed");
            challengeTitle.innerText += " (Completed 🎉)";
        }

        challengeList.appendChild(challengeItem);
    });
}

window.onload = function () {
    let user = sessionStorage.getItem("user");

    if (window.location.pathname.includes("dashboard.html")) {
        if (!user) window.location.href = "index.html";
        document.getElementById("user").innerText = user;
        loadChallenges();
    }
};
