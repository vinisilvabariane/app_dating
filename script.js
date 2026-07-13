const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const phaseButtons = document.querySelectorAll(".phase-card");
const phaseLabel = document.getElementById("phaseLabel");
const skillLabel = document.getElementById("skillLabel");
const timer = document.getElementById("timer");
const toast = document.getElementById("toast");
const interlude = document.getElementById("interlude");
const interludeText = document.getElementById("interludeText");
const interludeHint = document.getElementById("interludeHint");
const proposal = document.getElementById("proposal");
const proposalText = document.getElementById("proposalText");
const yesButton = document.getElementById("yesButton");
const thinkButton = document.getElementById("thinkButton");
const playgroundButton = document.getElementById("playgroundButton");
const surpriseScene = document.getElementById("surpriseScene");
const closeSurpriseButton = document.getElementById("closeSurpriseButton");
const surpriseAudio = document.getElementById("surpriseAudio");

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const WORLD_WIDTH = 7240;
const GRAVITY = 0.72;
const MOVE_ACCEL = 0.78;
const MAX_SPEED = 5.45;
const FRICTION = 0.82;
const JUMP_FORCE = 14.8;
const DASH_FORCE = 15.5;
const DASH_TIME = 0.16;

const keys = {
    left: false,
    right: false,
    jump: false,
    dash: false
};

const keys2 = {
    left: false,
    right: false,
    jump: false,
    dash: false
};

const skills = {
    doubleJump: false,
    dash: false
};

const phases = [
    {
        number: 1,
        name: "Pulso",
        start: { x: 60, y: 410 },
        checkpointMessage: "Fase 1: so pulo, calma e coragem.",
        unlock: "doubleJump",
        unlockText: "Double jump liberado. Agora da para pular de novo no ar.",
        portalText: "Boa. Se um pulo nao der, a gente aprende outro jeito de chegar.",
        orb: { x: 2180, y: 450, taken: false, type: "doubleJump" },
        portal: { x: 2280, y: 398, w: 58, h: 96 },
        platforms: [
            { x: 0, y: 494, w: 300, h: 80, color: "#334052" },
            { x: 430, y: 494, w: 250, h: 80, color: "#334052" },
            { x: 820, y: 456, w: 150, h: 24, color: "#334052" },
            { x: 1110, y: 410, w: 150, h: 24, color: "#334052" },
            { x: 1395, y: 456, w: 150, h: 24, color: "#334052" },
            { x: 1660, y: 494, w: 240, h: 80, color: "#334052" },
            { x: 1980, y: 430, w: 150, h: 24, color: "#334052" },
            { x: 2140, y: 494, w: 260, h: 80, color: "#334052" }
        ]
    },
    {
        number: 2,
        name: "Impulso",
        start: { x: 2500, y: 410 },
        checkpointMessage: "Fase 2: guarda o segundo pulo para o meio do caminho.",
        unlock: "dash",
        unlockText: "Dash liberado. Shift ou D no celular da um impulso para frente.",
        portalText: "Agora tem impulso. Mas o melhor e quando a direcao faz sentido.",
        orb: { x: 4180, y: 450, taken: false, type: "dash" },
        portal: { x: 4300, y: 398, w: 58, h: 96 },
        platforms: [
            { x: 2440, y: 494, w: 270, h: 80, color: "#334052" },
            { x: 2860, y: 438, w: 138, h: 24, color: "#334052" },
            { x: 3130, y: 360, w: 140, h: 24, color: "#334052" },
            { x: 3390, y: 430, w: 132, h: 24, color: "#334052" },
            { x: 3660, y: 346, w: 140, h: 24, color: "#334052" },
            { x: 3920, y: 426, w: 150, h: 24, color: "#334052" },
            { x: 4120, y: 494, w: 300, h: 80, color: "#334052" }
        ]
    },
    {
        number: 3,
        name: "Sintonia",
        start: { x: 4600, y: 410 },
        checkpointMessage: "Fase 3: double jump e dash em sintonia.",
        unlock: null,
        unlockText: "",
        portalText: "Voce passou tudo comigo. Agora eu preciso te perguntar uma coisa.",
        orb: null,
        portal: { x: 6900, y: 398, w: 58, h: 96 },
        platforms: [
            { x: 4540, y: 494, w: 260, h: 80, color: "#334052" },
            { x: 4990, y: 432, w: 128, h: 24, color: "#334052" },
            { x: 5295, y: 354, w: 132, h: 24, color: "#334052" },
            { x: 5595, y: 432, w: 138, h: 24, color: "#334052" },
            { x: 5900, y: 350, w: 138, h: 24, color: "#334052" },
            { x: 6215, y: 430, w: 140, h: 24, color: "#334052" },
            { x: 6540, y: 494, w: 440, h: 80, color: "#334052" }
        ]
    }
];

const level = {
    platforms: phases.flatMap((phase) => phase.platforms)
};

const state = {
    started: false,
    finished: false,
    accepted: false,
    playground: false,
    inTransition: false,
    currentPhase: 0,
    maxUnlockedPhase: 0,
    cameraX: 0,
    elapsed: 0,
    lastFrame: 0,
    toastTimer: 0,
    interludeAfter: null,
    interludeFullText: "",
    interludeIndex: 0,
    interludeTick: 0,
    player: createPlayer(phases[0].start),
    player2: null
};

function createPlayer(start) {
    return {
        x: start.x,
        y: start.y,
        w: 34,
        h: 52,
        vx: 0,
        vy: 0,
        grounded: false,
        facing: 1,
        coyote: 0,
        doubleUsed: false,
        dashUsed: false,
        dashTimer: 0,
        anim: 0,
        trail: []
    };
}

function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(canvas.width / VIEW_WIDTH, 0, 0, canvas.height / VIEW_HEIGHT, 0, 0);
}

function startPhase(index) {
    const phase = phases[index];

    resetInputs();
    state.started = true;
    state.finished = false;
    state.playground = false;
    state.inTransition = false;
    state.currentPhase = index;
    state.player = createPlayer(phase.start);
    state.player2 = null;
    state.cameraX = clamp(phase.start.x - VIEW_WIDTH * 0.42, 0, WORLD_WIDTH - VIEW_WIDTH);

    startScreen.classList.remove("is-visible");
    interlude.classList.remove("is-visible");
    proposal.classList.remove("is-visible");
    surpriseScene.classList.remove("is-visible");

    setSkillsForPhase(index);
    updateOrbState();
    updateHud();
    showToast(phase.checkpointMessage);
}

function startPlayground() {
    resetInputs();
    state.started = true;
    state.finished = false;
    state.playground = true;
    state.inTransition = false;
    state.currentPhase = 2;
    state.player = createPlayer({ x: 80, y: 410 });
    state.player2 = createPlayer({ x: 138, y: 410 });
    state.cameraX = 0;

    skills.doubleJump = true;
    skills.dash = true;
    startScreen.classList.remove("is-visible");
    proposal.classList.remove("is-visible");
    surpriseScene.classList.remove("is-visible");
    updateHud();
    showToast("Playground com dois players: P1 usa WASD, P2 usa setas. Shift da dash.");
}

function resetInputs() {
    for (const key of Object.keys(keys)) {
        keys[key] = false;
        keys2[key] = false;
    }
}

function setSkillsForPhase(index) {
    skills.doubleJump = index >= 1;
    skills.dash = index >= 2;
}

function updateOrbState() {
    for (const phase of phases) {
        if (!phase.orb) {
            continue;
        }

        phase.orb.taken =
            (phase.orb.type === "doubleJump" && skills.doubleJump) ||
            (phase.orb.type === "dash" && skills.dash);
    }
}

function getActivePlatforms() {
    if (state.playground) {
        return level.platforms;
    }

    return phases[state.currentPhase].platforms;
}

function update(delta) {
    if (state.inTransition) {
        updateDialogue(delta);
        hideToastIfNeeded(delta);
        return;
    }

    if (!state.started || state.finished) {
        hideToastIfNeeded(delta);
        return;
    }

    state.elapsed += delta;
    hideToastIfNeeded(delta);
    updateTimer();
    updatePlayer(delta, state.player, keys);
    if (state.playground && state.player2) {
        updatePlayer(delta, state.player2, keys2);
    }
    updateCamera();

    if (!state.playground) {
        updateSkillOrb();
        updatePortal();
    }
}

function updatePlayer(delta, player, input) {
    const wasGrounded = player.grounded;
    player.anim += delta;

    if (player.dashTimer > 0) {
        player.dashTimer -= delta;
        player.vy *= 0.86;
    } else {
        if (input.left) {
            player.vx -= MOVE_ACCEL;
            player.facing = -1;
        }

        if (input.right) {
            player.vx += MOVE_ACCEL;
            player.facing = 1;
        }

        if (!input.left && !input.right) {
            player.vx *= FRICTION;
        }

        player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED);
        player.vy += GRAVITY;
        player.vy = Math.min(player.vy, 18);
    }

    if (input.jump) {
        tryJump(player);
        input.jump = false;
    }

    if (input.dash) {
        tryDash(player);
        input.dash = false;
    }

    if (!player.grounded && player.coyote > 0) {
        player.coyote -= delta;
    }

    player.x += player.vx;
    collideHorizontal(player);

    player.y += player.vy;
    player.grounded = false;
    collideVertical(player);

    if (player.grounded) {
        player.doubleUsed = false;
        player.dashUsed = false;
    }

    if (wasGrounded && !player.grounded && player.vy >= 0) {
        player.coyote = 0.1;
    }

    player.x = clamp(player.x, 0, WORLD_WIDTH - player.w);
    updateTrail(player);

    if (player.y > VIEW_HEIGHT + 180) {
        respawn("Respawn. So volta para o ultimo checkpoint.");
    }
}

function updateCamera() {
    if (state.playground && state.player2) {
        const middle = (state.player.x + state.player2.x) / 2;
        state.cameraX = clamp(middle - VIEW_WIDTH * 0.42, 0, WORLD_WIDTH - VIEW_WIDTH);
        return;
    }

    state.cameraX = clamp(state.player.x - VIEW_WIDTH * 0.42, 0, WORLD_WIDTH - VIEW_WIDTH);
}

function tryJump(player) {
    if (player.grounded || player.coyote > 0) {
        player.vy = -JUMP_FORCE;
        player.grounded = false;
        player.coyote = 0;
        return;
    }

    if (skills.doubleJump && !player.doubleUsed) {
        player.vy = -JUMP_FORCE * 0.92;
        player.doubleUsed = true;
        burstAt(player.x + player.w / 2, player.y + player.h, "#7fd8be", 10);
    }
}

function tryDash(player) {
    if (!skills.dash) {
        showToast("O dash ainda nao foi liberado.");
        return;
    }

    if (player.dashUsed) {
        return;
    }

    player.dashUsed = true;
    player.dashTimer = DASH_TIME;
    player.vx = DASH_FORCE * player.facing;
    player.vy = Math.min(player.vy, 1.2);
    burstAt(player.x + player.w / 2, player.y + player.h / 2, "#ffd166", 14);
}

function collideHorizontal(player) {
    for (const platform of getActivePlatforms()) {
        if (!rectsOverlap(player, platform)) {
            continue;
        }

        if (player.vx > 0) {
            player.x = platform.x - player.w;
        } else if (player.vx < 0) {
            player.x = platform.x + platform.w;
        }
        player.vx = 0;
    }
}

function collideVertical(player) {
    for (const platform of getActivePlatforms()) {
        if (!rectsOverlap(player, platform)) {
            continue;
        }

        if (player.vy > 0) {
            player.y = platform.y - player.h;
            player.vy = 0;
            player.grounded = true;
        } else if (player.vy < 0) {
            player.y = platform.y + platform.h;
            player.vy = 0;
        }
    }
}

function updateSkillOrb() {
    const phase = phases[state.currentPhase];
    if (!phase.orb || phase.orb.taken) {
        return;
    }

    const orb = phase.orb;
    const box = { x: orb.x - 25, y: orb.y - 25, w: 50, h: 50 };
    if (!rectsOverlap(state.player, box)) {
        return;
    }

    orb.taken = true;
    skills[phase.unlock] = true;
    burstAt(orb.x, orb.y, phase.unlock === "doubleJump" ? "#7fd8be" : "#ffd166", 28);
    showToast(phase.unlockText);
    updateHud();
}

function updatePortal() {
    const phase = phases[state.currentPhase];

    if (!rectsOverlap(state.player, phase.portal)) {
        return;
    }

    if (phase.unlock && !skills[phase.unlock]) {
        showToast("Antes do portal, pega a skill brilhando ali pertinho.");
        state.player.x -= 22;
        state.player.vx = -2;
        return;
    }

    enterPortal();
}

function enterPortal() {
    const phase = phases[state.currentPhase];
    state.inTransition = true;
    state.player.vx = 0;
    state.player.vy = 0;
    burstAt(phase.portal.x + phase.portal.w / 2, phase.portal.y + phase.portal.h / 2, "#8ed3ff", 38);

    if (state.currentPhase === phases.length - 1) {
        showInterlude(phase.portalText, () => {
            state.maxUnlockedPhase = 2;
            updatePhaseMenu();
            finishGame();
        });
        return;
    }

    const nextPhase = state.currentPhase + 1;
    state.maxUnlockedPhase = Math.max(state.maxUnlockedPhase, nextPhase);
    updatePhaseMenu();
    showInterlude(phase.portalText, () => startPhase(nextPhase));
}

function showInterlude(text, after) {
    state.interludeFullText = text;
    state.interludeIndex = 0;
    state.interludeTick = 0;
    state.interludeAfter = after;
    interludeText.textContent = "";
    interludeHint.classList.remove("is-visible");
    interlude.classList.add("is-visible");
}

function updateDialogue(delta) {
    if (!state.interludeFullText || state.interludeIndex >= state.interludeFullText.length) {
        interludeHint.classList.add("is-visible");
        return;
    }

    state.interludeTick += delta;
    while (state.interludeTick >= 0.035 && state.interludeIndex < state.interludeFullText.length) {
        state.interludeTick -= 0.035;
        state.interludeIndex += 1;
        const visibleText = state.interludeFullText.slice(0, state.interludeIndex);
        interludeText.textContent = visibleText;

        const lastChar = visibleText[visibleText.length - 1];
        if (lastChar && lastChar.trim()) {
            playTalkBlip();
        }
    }

    if (state.interludeIndex >= state.interludeFullText.length) {
        interludeHint.classList.add("is-visible");
    }
}

function advanceInterlude() {
    if (!state.inTransition) {
        return;
    }

    if (state.interludeIndex < state.interludeFullText.length) {
        state.interludeIndex = state.interludeFullText.length;
        interludeText.textContent = state.interludeFullText;
        interludeHint.classList.add("is-visible");
        return;
    }

    const after = state.interludeAfter;
    state.interludeAfter = null;
    state.interludeFullText = "";
    state.inTransition = false;
    interlude.classList.remove("is-visible");

    if (after) {
        after();
    }
}

function playTalkBlip() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            return;
        }

        const audio = playTalkBlip.audio || new AudioContext();
        playTalkBlip.audio = audio;

        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = "square";
        oscillator.frequency.value = random(430, 520);
        gain.gain.setValueAtTime(0.022, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.045);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start();
        oscillator.stop(audio.currentTime + 0.045);
    } catch {
        // Audio is optional; browsers can block it depending on gesture policy.
    }
}

function respawn(message) {
    const start = state.playground ? { x: 80, y: 410 } : phases[state.currentPhase].start;
    state.player = createPlayer(start);
    if (state.playground) {
        state.player2 = createPlayer({ x: 138, y: 410 });
    }
    state.cameraX = clamp(start.x - VIEW_WIDTH * 0.42, 0, WORLD_WIDTH - VIEW_WIDTH);
    showToast(message);
}

function finishGame() {
    state.finished = true;
    state.inTransition = false;
    interlude.classList.remove("is-visible");
    proposal.classList.add("is-visible");
}

function acceptProposal() {
    state.accepted = true;
    proposalText.textContent = "Pronto. Agora oficialmente a melhor fase e a nossa.";
    yesButton.style.display = "none";
    thinkButton.style.display = "none";
    playgroundButton.classList.add("is-visible");
    releaseSurprise();
}

function dodgeThinkButton() {
    const card = thinkButton.closest(".proposal-card");
    const maxX = Math.max(40, card.clientWidth - thinkButton.offsetWidth - 40);
    const maxY = Math.max(40, card.clientHeight - thinkButton.offsetHeight - 40);

    thinkButton.style.position = "relative";
    thinkButton.style.left = `${random(-maxX / 2, maxX / 2)}px`;
    thinkButton.style.top = `${random(-12, maxY / 4)}px`;
    thinkButton.textContent = "Tem certeza?";
}

function releaseSurprise() {
    proposal.classList.remove("is-visible");
    surpriseScene.classList.add("is-visible");
    launchExplosion();
    launchConfetti();

    surpriseAudio.currentTime = 0;
    surpriseAudio.volume = 0.45;
    surpriseAudio.play().catch(() => {
        showToast("Aperte de novo para liberar a musica.");
    });
}

function closeSurprise() {
    surpriseScene.classList.remove("is-visible");
    surpriseAudio.pause();

    if (state.accepted) {
        proposal.classList.add("is-visible");
    }
}

function showToast(message) {
    state.toastTimer = 3.4;
    toast.textContent = message;
    toast.classList.add("is-visible");
}

function hideToastIfNeeded(delta) {
    if (state.toastTimer <= 0) {
        return;
    }

    state.toastTimer -= delta;
    if (state.toastTimer <= 0) {
        toast.classList.remove("is-visible");
    }
}

function updateHud() {
    phaseLabel.textContent = state.playground ? "Livre" : `${state.currentPhase + 1}/3`;

    const unlocked = [];
    if (skills.doubleJump) {
        unlocked.push("DJ");
    }
    if (skills.dash) {
        unlocked.push("Dash");
    }

    skillLabel.textContent = unlocked.length ? unlocked.join(" + ") : "-";
}

function updatePhaseMenu() {
    for (const button of phaseButtons) {
        const index = Number(button.dataset.phase);
        const locked = index > state.maxUnlockedPhase;

        button.disabled = locked;
        button.classList.toggle("is-locked", locked);
    }
}

function updateTimer() {
    const totalSeconds = Math.floor(state.elapsed);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    timer.textContent = `${minutes}:${seconds}`;
}

function draw() {
    ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    drawSky();
    drawBackground();

    ctx.save();
    ctx.translate(-state.cameraX, 0);
    drawPhaseLabels();
    drawLevel();
    drawPortals();
    drawPlayerTrail(state.player, "#ffd166");
    if (state.player2) {
        drawPlayerTrail(state.player2, "#7fd8be");
    }
    drawPlayer(state.player, "#f25f7a");
    if (state.player2) {
        drawPlayer(state.player2, "#7fd8be");
    }
    ctx.restore();

    drawVignette();
}

function drawSky() {
    const bands = [
        ["#6aa7d8", 0, 84],
        ["#7fb9df", 84, 70],
        ["#9bc9df", 154, 66],
        ["#ffd58d", 220, 74],
        ["#f7a07e", 294, 92],
        ["#6b8f7a", 386, 154]
    ];

    for (const [color, y, height] of bands) {
        ctx.fillStyle = color;
        ctx.fillRect(0, y, VIEW_WIDTH, height);
    }

    drawPixelSun(760 - state.cameraX * 0.04, 142);
}

function drawBackground() {
    drawPixelCloudLayer(0.08, 76, "#eaf6f4");
    drawMountainLayer(0.12, 356, "#6e8d84", "#5f7c77", 178);
    drawMountainLayer(0.2, 420, "#7faa86", "#6f957b", 132);
    drawTownLayer(0.3, 430);
    drawTreeLayer(0.44, 466);
    drawFlowerLayer(0.68, 506);
}

function drawPhaseLabels() {
    if (state.playground) {
        ctx.fillStyle = "rgba(35, 31, 32, 0.75)";
        ctx.font = "900 18px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Playground livre", 80, 142);
        return;
    }

    const phase = phases[state.currentPhase];
    ctx.fillStyle = "rgba(35, 31, 32, 0.75)";
    ctx.font = "900 18px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Fase ${phase.number}: ${phase.name}`, phase.start.x, 142);
}

function drawLevel() {
    for (const platform of getActivePlatforms()) {
        drawPlatform(platform);
    }

    const phase = phases[state.currentPhase];
    if (phase.orb && !phase.orb.taken && !state.playground) {
        drawSkillOrb(phase.orb);
    }
}

function drawPlatform(platform) {
    roundedRect(platform.x - 3, platform.y - 3, platform.w + 6, platform.h + 6, 7, "#1f2530");
    roundedRect(platform.x, platform.y, platform.w, platform.h, 6, platform.color);

    ctx.fillStyle = "#8be0a5";
    ctx.fillRect(platform.x + 5, platform.y + 5, platform.w - 10, 9);
    ctx.fillStyle = "#c8f7b4";
    ctx.fillRect(platform.x + 12, platform.y + 2, Math.max(20, platform.w - 24), 4);

    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    for (let x = platform.x + 18; x < platform.x + platform.w - 10; x += 34) {
        ctx.fillRect(x, platform.y + 20, 12, 5);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(platform.x + 5, platform.y + platform.h - 8, platform.w - 10, 4);
}

function drawPortals() {
    if (state.playground) {
        return;
    }

    const phase = phases[state.currentPhase];
    drawPortal(phase.portal, phase.number === 3 ? "FIM" : "PROX");
}

function drawPortal(portal, label) {
    const time = performance.now() / 280;
    const cx = portal.x + portal.w / 2;
    const cy = portal.y + portal.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1 + Math.sin(time) * 0.04, 1);
    ctx.fillStyle = "rgba(142, 211, 255, 0.72)";
    ctx.strokeStyle = "#231f20";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, portal.w / 2, portal.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#fff7f0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, portal.w / 3, portal.h / 2.8, time, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#231f20";
    ctx.font = "900 12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, portal.y - 12);
}

function drawSkillOrb(orb) {
    const time = performance.now() / 260;
    const y = orb.y + Math.sin(time + orb.x) * 5;
    const color = orb.type === "doubleJump" ? "#7fd8be" : "#ffd166";

    ctx.save();
    ctx.translate(orb.x, y);
    ctx.rotate(time * 0.7);
    ctx.fillStyle = color;
    ctx.strokeStyle = "#231f20";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -23);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 23);
    ctx.lineTo(-20, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#231f20";
    ctx.font = "900 12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(orb.type === "doubleJump" ? "DJ" : "DASH", orb.x, y + 44);
}

function drawPlayerTrail(player, color) {
    for (const ghost of player.trail) {
        ctx.globalAlpha = ghost.life;
        roundedRect(ghost.x, ghost.y, player.w, player.h, 9, color);
    }
    ctx.globalAlpha = 1;
}

function drawPlayer(player, shirtColor) {
    const p = player;
    const cx = p.x + p.w / 2;
    const moving = Math.abs(p.vx) > 0.4 && p.grounded;
    const step = moving ? Math.sin(p.anim * 13) : 0;
    const bob = moving ? Math.abs(step) * -2 : 0;
    const airborne = !p.grounded;
    const dashPose = p.dashTimer > 0;
    const bodyColor = skills.dash ? shirtColor : "#f25f7a";

    ctx.save();
    ctx.translate(cx, p.y + p.h / 2 + bob);
    ctx.scale(p.facing, 1);

    if (dashPose) {
        ctx.fillStyle = "rgba(255, 209, 102, 0.34)";
        ctx.fillRect(-32, -18, 50, 34);
    }

    ctx.fillStyle = "#1f2530";
    ctx.fillRect(-13, 21, 10, 5);
    ctx.fillRect(5, 21, 10, 5);

    const leftLeg = airborne ? 8 : step * 4;
    const rightLeg = airborne ? -3 : -step * 4;
    ctx.fillStyle = "#3b3148";
    ctx.fillRect(-12, 10, 8, 13 + leftLeg * 0.2);
    ctx.fillRect(4, 10, 8, 13 + rightLeg * 0.2);

    ctx.fillStyle = bodyColor;
    ctx.fillRect(-16, -1, 32, 19);
    ctx.fillStyle = "rgba(255,255,255,0.24)";
    ctx.fillRect(-11, 3, 12, 4);

    const armSwing = airborne ? 6 : step * 5;
    ctx.fillStyle = "#fff7f0";
    ctx.fillRect(-22, 1 + armSwing * 0.2, 7, 15);
    ctx.fillRect(15, 1 - armSwing * 0.2, 7, 15);

    ctx.fillStyle = "#fff7f0";
    ctx.fillRect(-15, -25, 30, 25);
    ctx.fillStyle = "#f4c7a1";
    ctx.fillRect(-12, -22, 24, 20);
    ctx.fillStyle = "#3b3148";
    ctx.fillRect(-14, -26, 28, 8);
    ctx.fillRect(-17, -19, 7, 8);

    drawHeart(0, -36, 6, skills.doubleJump ? "#7fd8be" : "#f25f7a");

    ctx.fillStyle = "#231f20";
    ctx.fillRect(-7, -14, 3, 3);
    ctx.fillRect(6, -14, 3, 3);
    ctx.fillRect(-4, -7, 10, 3);

    ctx.restore();
}

function updateTrail(player) {
    player.trail = player.trail
        .map((ghost) => ({ ...ghost, life: ghost.life - 0.08 }))
        .filter((ghost) => ghost.life > 0);

    if (player.dashTimer > 0) {
        player.trail.push({ x: player.x, y: player.y, life: 0.44 });
    }
}

function drawPixelSun(x, y) {
    const px = Math.round(x / 8) * 8;
    const py = Math.round(y / 8) * 8;

    ctx.fillStyle = "#ffe17a";
    ctx.fillRect(px - 32, py - 32, 64, 64);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(px - 40, py - 16, 80, 32);
    ctx.fillStyle = "rgba(255, 247, 240, 0.28)";
    ctx.fillRect(px - 56, py - 8, 112, 16);
}

function drawPixelCloudLayer(speed, y, color) {
    const tile = 360;
    const offset = -((state.cameraX * speed) % tile);

    for (let x = offset - tile; x < VIEW_WIDTH + tile; x += tile) {
        drawPixelCloud(x + 48, y, color);
        drawPixelCloud(x + 226, y + 42, "rgba(255, 247, 240, 0.72)");
    }
}

function drawPixelCloud(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 18, 104, 24);
    ctx.fillRect(x + 20, y, 64, 42);
    ctx.fillRect(x + 52, y + 10, 72, 32);
    ctx.fillRect(x + 12, y + 42, 84, 12);
}

function drawMountainLayer(speed, baseY, mainColor, shadowColor, peakHeight) {
    const tile = 280;
    const offset = -((state.cameraX * speed) % tile);

    for (let x = offset - tile; x < VIEW_WIDTH + tile; x += tile) {
        drawPixelMountain(x, baseY, peakHeight, mainColor, shadowColor);
        drawPixelMountain(x + 138, baseY + 18, peakHeight - 32, mainColor, shadowColor);
    }
}

function drawPixelMountain(x, baseY, height, mainColor, shadowColor) {
    const steps = 9;
    const stepWidth = 28;
    const stepHeight = Math.floor(height / steps);

    for (let i = 0; i < steps; i += 1) {
        const width = stepWidth * (steps - i);
        const y = baseY - stepHeight * (i + 1);
        const left = x + stepWidth * i / 2;
        ctx.fillStyle = i % 2 ? mainColor : shadowColor;
        ctx.fillRect(left, y, width, stepHeight + 1);
    }

    ctx.fillStyle = "rgba(255, 247, 240, 0.38)";
    ctx.fillRect(x + 74, baseY - height + 16, 32, 16);
    ctx.fillRect(x + 58, baseY - height + 32, 64, 14);
}

function drawTownLayer(speed, baseY) {
    const tile = 560;
    const offset = -((state.cameraX * speed) % tile);

    for (let x = offset - tile; x < VIEW_WIDTH + tile; x += tile) {
        drawPixelHouse(x + 26, baseY, "#f7c879", "#b35a63");
        drawPixelHouse(x + 184, baseY + 8, "#d7ecd0", "#3f7f83");
        drawPixelHouse(x + 350, baseY + 14, "#ffe0a6", "#7f6d9e");
    }
}

function drawPixelHouse(x, groundY, wall, roof) {
    ctx.fillStyle = roof;
    ctx.fillRect(x + 8, groundY - 56, 64, 16);
    ctx.fillRect(x, groundY - 40, 80, 12);
    ctx.fillStyle = wall;
    ctx.fillRect(x + 8, groundY - 28, 64, 36);
    ctx.fillStyle = "#3b3148";
    ctx.fillRect(x + 20, groundY - 14, 10, 12);
    ctx.fillRect(x + 48, groundY - 14, 10, 12);
}

function drawTreeLayer(speed, baseY) {
    const tile = 340;
    const offset = -((state.cameraX * speed) % tile);

    for (let x = offset - tile; x < VIEW_WIDTH + tile; x += tile) {
        drawPixelTree(x + 42, baseY, 1);
        drawPixelTree(x + 214, baseY + 8, 0.8);
    }
}

function drawPixelTree(x, baseY, scale) {
    const unit = 8 * scale;
    const trunkX = Math.round(x + unit * 3);

    ctx.fillStyle = "#624338";
    ctx.fillRect(trunkX, baseY - unit * 5, unit * 1.2, unit * 5);
    ctx.fillStyle = "#7a5140";
    ctx.fillRect(trunkX + unit * 0.25, baseY - unit * 4.6, unit * 0.45, unit * 4.2);

    ctx.fillStyle = "#254d48";
    ctx.fillRect(x + unit * 1, baseY - unit * 10, unit * 5, unit * 2);
    ctx.fillRect(x, baseY - unit * 8.2, unit * 7, unit * 2);
    ctx.fillRect(x + unit * 0.8, baseY - unit * 6.4, unit * 5.8, unit * 1.8);

    ctx.fillStyle = "#3f7f65";
    ctx.fillRect(x + unit * 2, baseY - unit * 9.5, unit * 3.8, unit * 1);
    ctx.fillRect(x + unit * 1.5, baseY - unit * 7.5, unit * 4.8, unit * 1);
}

function drawFlowerLayer(speed, y) {
    const tile = 180;
    const offset = -((state.cameraX * speed) % tile);

    ctx.fillStyle = "#49685b";
    ctx.fillRect(0, 512, VIEW_WIDTH, 28);
    ctx.fillStyle = "#5f8269";
    ctx.fillRect(0, 500, VIEW_WIDTH, 14);

    for (let x = offset - tile; x < VIEW_WIDTH + tile; x += tile) {
        ctx.fillStyle = "#6ec6a5";
        ctx.fillRect(x + 24, y, 5, 14);
        ctx.fillRect(x + 118, y + 5, 5, 10);
        ctx.fillStyle = "#f25f7a";
        ctx.fillRect(x + 18, y - 5, 17, 8);
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(x + 112, y, 17, 8);
    }
}

function drawCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(255, 247, 240, 0.84)";
    ctx.beginPath();
    ctx.arc(0, 22, 26, 0, Math.PI * 2);
    ctx.arc(28, 8, 33, 0, Math.PI * 2);
    ctx.arc(64, 22, 26, 0, Math.PI * 2);
    ctx.rect(-4, 22, 76, 25);
    ctx.fill();
    ctx.restore();
}

function drawNote(x, y) {
    roundedRect(x - 14, y - 28, 34, 42, 4, "#fff7f0");
    ctx.strokeStyle = "#231f20";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 14, y - 28, 34, 42);
    ctx.fillStyle = "#f25f7a";
    ctx.fillRect(x - 7, y - 18, 20, 3);
    ctx.fillRect(x - 7, y - 9, 16, 3);
    ctx.fillRect(x - 7, y, 19, 3);
}

function drawHeart(x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 18, size / 18);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-22, -2, -12, -18, 0, -8);
    ctx.bezierCurveTo(12, -18, 22, -2, 0, 12);
    ctx.fill();
    ctx.restore();
}

function drawVignette() {
    const gradient = ctx.createRadialGradient(VIEW_WIDTH / 2, VIEW_HEIGHT / 2, 120, VIEW_WIDTH / 2, VIEW_HEIGHT / 2, 680);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(1, "rgba(35,31,32,0.12)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
}

function roundedRect(x, y, width, height, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.fill();
}

function burstAt(x, y, color, amount) {
    for (let i = 0; i < amount; i += 1) {
        const piece = document.createElement("span");
        piece.className = "spark";
        piece.style.left = `${((x - state.cameraX) / VIEW_WIDTH) * 100}vw`;
        piece.style.top = `${(y / VIEW_HEIGHT) * 100}vh`;
        piece.style.background = color;
        piece.style.setProperty("--tx", `${random(-150, 150)}px`);
        piece.style.setProperty("--ty", `${random(-120, 110)}px`);
        document.body.appendChild(piece);
        window.setTimeout(() => piece.remove(), 900);
    }
}

function launchExplosion() {
    const colors = ["#f25f7a", "#ffd166", "#7fd8be", "#8ed3ff", "#fff7f0"];

    for (let i = 0; i < 160; i += 1) {
        const piece = document.createElement("span");
        piece.className = "spark big";
        piece.style.left = "50vw";
        piece.style.top = "50vh";
        piece.style.background = colors[i % colors.length];
        piece.style.setProperty("--tx", `${random(-520, 520)}px`);
        piece.style.setProperty("--ty", `${random(-330, 330)}px`);
        document.body.appendChild(piece);
        window.setTimeout(() => piece.remove(), 1000);
    }
}

function launchConfetti() {
    const colors = ["#f25f7a", "#ffd166", "#7fd8be", "#8ed3ff", "#ffffff"];

    for (let i = 0; i < 90; i += 1) {
        const piece = document.createElement("span");
        piece.className = "confetti";
        piece.style.left = `${random(0, 100)}vw`;
        piece.style.background = colors[i % colors.length];
        piece.style.animationDelay = `${random(0, 0.8)}s`;
        piece.style.transform = `rotate(${random(0, 180)}deg)`;
        document.body.appendChild(piece);
        window.setTimeout(() => piece.remove(), 3400);
    }
}

function rectsOverlap(a, b) {
    return a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function onKeyDown(event) {
    if (state.inTransition && event.code === "KeyE") {
        advanceInterlude();
        event.preventDefault();
        return;
    }

    if (state.playground) {
        onPlaygroundKeyDown(event);
        return;
    }

    if (event.code === "ArrowLeft" || event.code === "KeyA") {
        keys.left = true;
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
        keys.right = true;
    }
    if (event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Space") {
        keys.jump = true;
        event.preventDefault();
    }
    if (event.code === "ShiftLeft" || event.code === "ShiftRight" || event.code === "KeyK") {
        keys.dash = true;
        event.preventDefault();
    }
}

function onKeyUp(event) {
    if (state.playground) {
        onPlaygroundKeyUp(event);
        return;
    }

    if (event.code === "ArrowLeft" || event.code === "KeyA") {
        keys.left = false;
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
        keys.right = false;
    }
    if (event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Space") {
        keys.jump = false;
    }
    if (event.code === "ShiftLeft" || event.code === "ShiftRight" || event.code === "KeyK") {
        keys.dash = false;
    }
}

function onPlaygroundKeyDown(event) {
    if (event.code === "KeyA") {
        keys.left = true;
    }
    if (event.code === "KeyD") {
        keys.right = true;
    }
    if (event.code === "KeyW" || event.code === "Space") {
        keys.jump = true;
        event.preventDefault();
    }
    if (event.code === "ShiftLeft") {
        keys.dash = true;
        event.preventDefault();
    }

    if (event.code === "ArrowLeft") {
        keys2.left = true;
    }
    if (event.code === "ArrowRight") {
        keys2.right = true;
    }
    if (event.code === "ArrowUp" || event.code === "Enter") {
        keys2.jump = true;
        event.preventDefault();
    }
    if (event.code === "ShiftRight" || event.code === "Numpad0") {
        keys2.dash = true;
        event.preventDefault();
    }
}

function onPlaygroundKeyUp(event) {
    if (event.code === "KeyA") {
        keys.left = false;
    }
    if (event.code === "KeyD") {
        keys.right = false;
    }
    if (event.code === "KeyW" || event.code === "Space") {
        keys.jump = false;
    }
    if (event.code === "ShiftLeft") {
        keys.dash = false;
    }

    if (event.code === "ArrowLeft") {
        keys2.left = false;
    }
    if (event.code === "ArrowRight") {
        keys2.right = false;
    }
    if (event.code === "ArrowUp" || event.code === "Enter") {
        keys2.jump = false;
    }
    if (event.code === "ShiftRight" || event.code === "Numpad0") {
        keys2.dash = false;
    }
}

function bindTouchControls() {
    const buttons = document.querySelectorAll(".touch-button");
    for (const button of buttons) {
        const key = button.dataset.key;

        button.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            keys[key] = true;
            button.setPointerCapture(event.pointerId);
        });

        button.addEventListener("pointerup", (event) => {
            event.preventDefault();
            keys[key] = false;
        });

        button.addEventListener("pointercancel", () => {
            keys[key] = false;
        });

        button.addEventListener("pointerleave", () => {
            if (key === "left" || key === "right") {
                keys[key] = false;
            }
        });
    }
}

function gameLoop(timestamp) {
    if (!state.lastFrame) {
        state.lastFrame = timestamp;
    }

    const delta = Math.min(0.033, (timestamp - state.lastFrame) / 1000);
    state.lastFrame = timestamp;

    update(delta);
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
startButton.addEventListener("click", () => startPhase(0));
yesButton.addEventListener("click", acceptProposal);
thinkButton.addEventListener("mouseenter", dodgeThinkButton);
thinkButton.addEventListener("click", dodgeThinkButton);
playgroundButton.addEventListener("click", startPlayground);
closeSurpriseButton.addEventListener("click", closeSurprise);

for (const button of phaseButtons) {
    button.addEventListener("click", () => {
        const index = Number(button.dataset.phase);
        if (index <= state.maxUnlockedPhase) {
            startPhase(index);
        }
    });
}

bindTouchControls();
resizeCanvas();
updateHud();
updatePhaseMenu();
requestAnimationFrame(gameLoop);
