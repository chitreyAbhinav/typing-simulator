/* ============================================================
   EXTREME NEON SCRIPT — FULL GAME ENGINE (FINAL FIXED VERSION)
=============================================================== */

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// UI elements
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const restartBtn = document.getElementById("restart-btn");
const startBtn = document.getElementById("start-btn");
const wordInput = document.getElementById("word-input");
const playerNameInput = document.getElementById("player-name");
const gameContainer = document.getElementById("game-container");
const inputArea = document.getElementById("input-area");

// Words database
let words = [
    "binary", "cyber", "matrix", "system",
    "compile", "code", "script", "glitch",
    "terminal", "quantum"
];

// Game data
let activeWords = [];
let wordTrails = [];
let particles = [];
let combo = 0;
let comboMultiplier = 1;

let score = 0;
let missed = 0;
let gameOver = false;
let spawnLoop;
let playerName = "";

/* ======================================================
   BACKGROUND PARTICLES
====================================================== */
class FloatingParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 2 + Math.random() * 3;
        this.speed = 0.2 + Math.random() * 0.6;
        this.alpha = 0.1 + Math.random() * 0.3;
    }
    draw() {
        ctx.fillStyle = `rgba(0, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
        }
        this.draw();
    }
}

for (let i = 0; i < 60; i++) particles.push(new FloatingParticle());

/* ======================================================
   WORD CLASS
====================================================== */
class Word {
    constructor(text) {
        this.text = text;
        this.x = Math.random() * (canvas.width - 200);
        this.y = -40;

        // ✅ Final FIX: faster falling speed
        this.baseSpeed = 2.5 + score * 0.06 + combo * 0.08;

        this.waveOffset = Math.random() * Math.PI * 2;
        this.flicker = 0;
    }

    draw() {
        ctx.font = "26px 'Courier New'";
        let flickerOpacity = 0.8 + Math.sin(this.flicker) * 0.2;

        ctx.fillStyle = `rgba(170,220,255,${flickerOpacity})`;
        ctx.fillText(this.text, this.x, this.y);
    }

    update() {
        // ✅ faster fall = prevents lane blocking
        this.y += this.baseSpeed;

        // ✅ slight wave motion (no lane interference)
        this.x += Math.sin(this.waveOffset + this.y * 0.015) * 0.25;

        this.flicker += 0.2;
        this.draw();
    }
}

/* ======================================================
   NEON TRAIL for words
====================================================== */
class Trail {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.alpha = 1;
    }
    draw() {
        ctx.fillStyle = `rgba(0,255,255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        this.y += 1.2;
        this.alpha -= 0.03;
        this.draw();
    }
}

/* ======================================================
   PARTICLE EXPLOSION (Correct word)
====================================================== */
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dx = (Math.random() - 0.5) * 6;
        this.dy = (Math.random() - 0.5) * 6;
        this.alpha = 1;
        this.color = ["#00eaff", "#ff00ff", "#00ffae"][Math.floor(Math.random() * 3)];
    }
    draw() {
        ctx.fillStyle = `${this.color + this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.alpha -= 0.03;
        this.draw();
    }
}

/* ======================================================
   GAME LOOP
====================================================== */
function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => p.update());

    // Trails
    for (let i = wordTrails.length - 1; i >= 0; i--) {
        wordTrails[i].update();
        if (wordTrails[i].alpha <= 0) wordTrails.splice(i, 1);
    }

    // Words
    for (let i = activeWords.length - 1; i >= 0; i--) {
        let w = activeWords[i];
        wordTrails.push(new Trail(w.x + 20, w.y + 10));

        w.update();

        if (w.y > canvas.height) {
            activeWords.splice(i, 1);
            missed++;

            combo = 0;
            comboMultiplier = 1;
            screenShake(8);

            if (missed >= 3) endGame();
        }
    }

    requestAnimationFrame(gameLoop);
}

/* ======================================================
   PERFECT SPAWN SYSTEM (FINAL STABLE VERSION)
====================================================== */
function spawnWord() {

    // ✅ Keep screen clean
    if (activeWords.length >= 8) return;

    const text = words[Math.floor(Math.random() * words.length)];

    const laneWidth = 180;
    const laneCount = Math.floor(canvas.width / laneWidth);

    const laneUsage = new Array(laneCount).fill(false);

    for (let w of activeWords) {
        const lane = Math.floor(w.x / laneWidth);
        if (lane >= 0 && lane < laneCount) laneUsage[lane] = true;
    }

    let freeLanes = [];
    for (let i = 0; i < laneCount; i++) {
        if (!laneUsage[i]) freeLanes.push(i);
    }

    let lane;
    if (freeLanes.length > 0) {
        lane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
    } else {
        lane = Math.floor(Math.random() * laneCount);
    }

    const newWord = new Word(text);
    newWord.x = lane * laneWidth + 50;

    activeWords.push(newWord);
}

/* ======================================================
   SHAKE EFFECT
====================================================== */
let shakeAmount = 0;

function screenShake(amount) {
    shakeAmount = amount;
    let interval = setInterval(() => {
        shakeAmount *= 0.7;
        if (shakeAmount < 0.5) {
            clearInterval(interval);
            shakeAmount = 0;
        }
    }, 50);
}

(function patchContextTranslate() {
    const original = ctx.translate;
    ctx.translate = function (x, y) {
        original.call(ctx, x + (Math.random() - 0.5) * shakeAmount,
                           y + (Math.random() - 0.5) * shakeAmount);
    };
})();

/* ======================================================
   START GAME
====================================================== */
startBtn.addEventListener("click", () => {
    playerName = playerNameInput.value.trim();
    if (playerName === "") return alert("Enter your name");

    startScreen.style.display = "none";
    gameContainer.style.display = "block";

    inputArea.style.display = "block";  // show input bar

    resetGame();
    wordInput.focus();
});

/* ======================================================
   TYPING LOGIC
====================================================== */
wordInput.addEventListener("input", () => {
    let typed = wordInput.value.trim();
    let found = false;

    for (let i = 0; i < activeWords.length; i++) {
        if (typed === activeWords[i].text) {

            let w = activeWords[i];

            combo++;
            comboMultiplier = 1 + combo * 0.15;

            score += Math.floor(1 * comboMultiplier);
            activeWords.splice(i, 1);
            wordInput.value = "";

            for (let j = 0; j < 14; j++) particles.push(new Particle(w.x, w.y));

            wordInput.classList.add("input-correct");
            setTimeout(() => wordInput.classList.remove("input-correct"), 200);

            found = true;
            break;
        }
    }

    if (!found && typed.length > 0) {
        wordInput.classList.add("input-wrong");
        screenShake(10);
        setTimeout(() => wordInput.classList.remove("input-wrong"), 250);
    }
});

/* ======================================================
   END GAME
====================================================== */
function endGame() {
    gameOver = true;
    clearInterval(spawnLoop);
    gameContainer.style.display = "none";
    gameOverScreen.style.display = "flex";

    inputArea.style.display = "none";  // hide typing bar

    for (let i = 0; i < 60; i++) {
        particles.push(new Particle(canvas.width/2, canvas.height/2));
    }
}

/* ======================================================
   RESET GAME
====================================================== */
function resetGame() {
    activeWords = [];
    wordTrails = [];
    combo = 0;
    comboMultiplier = 1;
    score = 0;
    missed = 0;
    gameOver = false;

    // ✅ Slower spawn rate to avoid clutter
    spawnLoop = setInterval(spawnWord, 1500);

    gameLoop();
}

/* ======================================================
   RESTART
====================================================== */
restartBtn.addEventListener("click", () => {
    gameOverScreen.style.display = "none";
    gameContainer.style.display = "block";
    inputArea.style.display = "block";
    wordInput.value = "";
    resetGame();
    wordInput.focus();
});
// ✅ Always refocus on the typing box if player clicks anywhere
window.addEventListener("click", () => {
    if (!gameOver && inputArea.style.display === "block") {
        wordInput.focus();
    }
});
// ✅ Ensure input is focused on every key press (prevents lost focus)
window.addEventListener("keydown", () => {
    if (!gameOver && inputArea.style.display === "block") {
        wordInput.focus();
    }
});
