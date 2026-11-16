const correctCode = "111622"; // Use the date you first started dating: 11/16/22

const MAX_CODE_LENGTH = 6;
const screens = document.querySelectorAll(".screen");
const nextButtons = document.querySelectorAll("[data-next]");
const lockPad = document.getElementById("lock-pad");
const codeDisplayText = document.getElementById("code-display-text");
const unlockBtn = document.getElementById("unlock-btn");
const lockError = document.getElementById("lock-error");
const puzzleBoard = document.getElementById("puzzle-board");
const resetPuzzleBtn = document.getElementById("reset-puzzle-btn");
const continueToRecordingBtn = document.getElementById("continue-to-recording");
const memoryBoard = document.getElementById("memory-board");
const memoryStatus = document.getElementById("memory-status");
const continueToRecordingFromMemoryBtn = document.getElementById("continue-to-recording-from-memory");
const playMessageBtn = document.getElementById("play-message-btn");
const pauseMessageBtn = document.getElementById("pause-message-btn");
const voiceRecording = document.getElementById("voice-recording");
const recordingStatus = document.getElementById("recording-status");
const openLetterBtn = document.getElementById("open-letter-btn");
const openEnvelopeBtn = document.getElementById("open-envelope-btn");
const envelope = document.getElementById("envelope");
const letterModal = document.getElementById("letter-modal");
const closeLetterBtn = document.getElementById("close-letter-btn");
const readLetterNextBtn = document.getElementById("read-letter-next-btn");
const goToSlotBtn = document.getElementById("go-to-slot-btn");
const spinBtn = document.getElementById("spin-btn");
const claimJackpotBtn = document.getElementById("claim-jackpot-btn");
const slotMessage = document.getElementById("slot-message");
const jackpotModal = document.getElementById("jackpot-modal");
const slotMachine = document.querySelector(".slot-machine");

const phoneFrame = document.querySelector(".phone-frame");

const memoryArt = "pic.jpeg";
let puzzleState = [];
let emptyIndex = 8;
let puzzleSolved = false;
let enteredCode = "";

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
  });
}

nextButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.next));
});

function updateDisplay() {
  if (!enteredCode) {
    codeDisplayText.textContent = "";
    return;
  }

  codeDisplayText.textContent = "•".repeat(enteredCode.length);
}

function handleCorrectCode() {
  showScreen("puzzle-screen");
  enteredCode = "";
  updateDisplay();
  lockError.textContent = "";
}

function handleIncorrectCode() {
  lockError.textContent = "Incorrect passcode. Try again.";
  phoneFrame.classList.remove("shake");
  void phoneFrame.offsetWidth;
  phoneFrame.classList.add("shake");

  setTimeout(() => {
    enteredCode = "";
    updateDisplay();
    phoneFrame.classList.remove("shake");
  }, 500);
}

function evaluateCode() {
  if (enteredCode === correctCode) {
    handleCorrectCode();
    return;
  }

  handleIncorrectCode();
}

lockPad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const digit = button.dataset.digit;
  const action = button.dataset.action;

  if (digit) {
    if (enteredCode.length < MAX_CODE_LENGTH) {
      enteredCode += digit;
      updateDisplay();

      if (enteredCode.length === MAX_CODE_LENGTH) {
        setTimeout(() => {
          evaluateCode();
        }, 180);
      }
    }
    return;
  }

  if (action === "delete") {
    enteredCode = enteredCode.slice(0, -1);
    updateDisplay();
    return;
  }

  if (action === "clear") {
    enteredCode = "";
    updateDisplay();
  }
});

unlockBtn.addEventListener("click", () => {
  if (enteredCode.length === MAX_CODE_LENGTH) {
    evaluateCode();
  } else {
    lockError.textContent = "Incorrect passcode. Try again.";
    enteredCode = "";
    updateDisplay();
    phoneFrame.classList.remove("shake");
    void phoneFrame.offsetWidth;
    phoneFrame.classList.add("shake");
    setTimeout(() => phoneFrame.classList.remove("shake"), 500);
  }
});

function createPuzzleBoard() {
  const solvedState = Array.from({ length: 8 }, (_, index) => index + 1);
  solvedState.push(null);

  puzzleState = [...solvedState];
  let empty = 8;
  let steps = 0;

  while (steps < 20) {
    const neighbors = getNeighborIndexes(empty);
    const nextIndex = neighbors[Math.floor(Math.random() * neighbors.length)];

    [puzzleState[empty], puzzleState[nextIndex]] = [puzzleState[nextIndex], puzzleState[empty]];
    empty = nextIndex;
    steps += 1;
  }

  if (puzzleState.every((value, index) => value === solvedState[index])) {
    [puzzleState[0], puzzleState[1]] = [puzzleState[1], puzzleState[0]];
  }

  renderPuzzle();
}

let memoryDeck = [];
let memoryFlippedCards = [];
let memoryLocked = false;
let memoryMatchedPairs = 0;

function createMemoryGame() {
  const images = ["m1.jpg", "m2.jpg", "m3.jpg", "m4.jpg", "m5.jpg", "m6.jpg"];
  const deck = [...images, ...images]
    .map((image, index) => ({ id: `${image}-${index}`, image }))
    .sort(() => Math.random() - 0.5);

  memoryDeck = deck;
  memoryFlippedCards = [];
  memoryMatchedPairs = 0;
  memoryLocked = false;
  memoryStatus.textContent = "Find all the matching memories.";
  continueToRecordingFromMemoryBtn.classList.add("hidden");
  memoryBoard.innerHTML = "";

  deck.forEach((card) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "memory-card";
    button.dataset.image = card.image;
    button.innerHTML = `
      <span class="memory-card-inner">
        <span class="card-front">?</span>
        <span class="card-back" style="background-image: url('${card.image}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></span>
      </span>
    `;
    button.addEventListener("click", () => handleMemoryCardClick(button));
    memoryBoard.appendChild(button);
  });
}

function handleMemoryCardClick(card) {
  if (memoryLocked || card.classList.contains("flipped") || card.classList.contains("matched")) {
    return;
  }

  card.classList.add("flipped");
  memoryFlippedCards.push(card);

  if (memoryFlippedCards.length === 2) {
    memoryLocked = true;

    const [firstCard, secondCard] = memoryFlippedCards;

    if (firstCard.dataset.image === secondCard.dataset.image) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      memoryMatchedPairs += 1;
      memoryStatus.textContent = `Nice! ${memoryMatchedPairs} pair${memoryMatchedPairs > 1 ? "s" : ""} matched.`;
      memoryFlippedCards = [];
      memoryLocked = false;

      if (memoryMatchedPairs === memoryDeck.length / 2) {
        memoryStatus.textContent = "You matched all our favorite memories!";
        continueToRecordingFromMemoryBtn.classList.remove("hidden");
      }
      return;
    }

    memoryStatus.textContent = "Almost! Try again.";
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      memoryFlippedCards = [];
      memoryLocked = false;
    }, 700);
  }
}

function getNeighborIndexes(index) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  const neighbors = [];

  if (row > 0) neighbors.push(index - 3);
  if (row < 2) neighbors.push(index + 3);
  if (col > 0) neighbors.push(index - 1);
  if (col < 2) neighbors.push(index + 1);

  return neighbors;
}

function renderPuzzle() {
  puzzleBoard.innerHTML = "";

  puzzleState.forEach((value, index) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "puzzle-tile";

    if (value === null) {
      tile.classList.add("empty");
      tile.setAttribute("aria-label", "Empty puzzle space");
      tile.disabled = true;
    } else {
      const row = Math.floor((value - 1) / 3);
      const col = (value - 1) % 3;
      tile.style.backgroundImage = `url("${memoryArt}")`;
      tile.style.backgroundSize = "300% 300%";
      tile.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
      tile.setAttribute("aria-label", `Puzzle piece ${value}`);
      tile.addEventListener("click", () => moveTile(index));
    }

    puzzleBoard.appendChild(tile);
  });

  const solved = puzzleState.every((value, index) => value === (index < 8 ? index + 1 : null));
  if (solved && !puzzleSolved) {
    puzzleSolved = true;
    continueToRecordingBtn.classList.remove("hidden");
  }
}

function moveTile(index) {
  if (puzzleSolved) return;

  const currentEmptyIndex = puzzleState.indexOf(null);
  const neighbors = getNeighborIndexes(currentEmptyIndex);

  if (!neighbors.includes(index)) return;

  [puzzleState[currentEmptyIndex], puzzleState[index]] = [puzzleState[index], puzzleState[currentEmptyIndex]];
  renderPuzzle();
}

resetPuzzleBtn.addEventListener("click", () => {
  puzzleSolved = false;
  continueToRecordingBtn.classList.add("hidden");
  createPuzzleBoard();
});

continueToRecordingBtn.addEventListener("click", () => showScreen("memory-screen"));
continueToRecordingFromMemoryBtn.addEventListener("click", () => showScreen("recording-screen"));

playMessageBtn.addEventListener("click", () => {
  voiceRecording.play().catch(() => {
    recordingStatus.textContent = "Could not play Lalab.mp3. Check that the recording is a valid MP3.";
  });
});

pauseMessageBtn.addEventListener("click", () => {
  if (!voiceRecording.paused) {
    voiceRecording.pause();
    recordingStatus.textContent = "Paused. Press play whenever you want to listen again.";
  }
});

voiceRecording.addEventListener("play", () => {
  recordingStatus.textContent = "Playing your message...";
});

voiceRecording.addEventListener("ended", () => {
  recordingStatus.textContent = "Your message is ready for replay anytime.";
  openLetterBtn.classList.remove("hidden");
});

voiceRecording.addEventListener("error", () => {
  recordingStatus.textContent = "Could not play Lalab.mp3. Check that the recording is a valid MP3.";
});

openLetterBtn.addEventListener("click", () => showScreen("envelope-screen"));

openEnvelopeBtn.addEventListener("click", () => {
  envelope.classList.add("open");
  openEnvelopeBtn.setAttribute("aria-expanded", "true");
  letterModal.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    letterModal.classList.remove("hidden");
  }, 250);
});

closeLetterBtn.addEventListener("click", () => {
  letterModal.classList.add("hidden");
  letterModal.setAttribute("aria-hidden", "true");
  envelope.classList.remove("open");
  openEnvelopeBtn.setAttribute("aria-expanded", "false");
});

readLetterNextBtn.addEventListener("click", () => {
  letterModal.classList.add("hidden");
  letterModal.setAttribute("aria-hidden", "true");
  envelope.classList.remove("open");
  openEnvelopeBtn.setAttribute("aria-expanded", "false");
  goToSlotBtn.classList.remove("hidden");
});

goToSlotBtn.addEventListener("click", () => {
  showScreen("slot-screen");
  slotMessage.textContent = "One spin and the luck is yours.";
  claimJackpotBtn.classList.add("hidden");
});

spinBtn.addEventListener("click", () => {
  const reels = document.querySelectorAll(".reel-column");
  const reelSymbols = ["✨", "⭐", "💎", "🎁", "☘️", "🌙", "💍", "🍀", "💖"];
  const jackpotSymbol = "💖";
  const spinDuration = (reels.length - 1) * 500 + 12 * 90;

  slotMachine.classList.remove("shake");
  void slotMachine.offsetWidth;
  slotMachine.classList.add("shake");
  claimJackpotBtn.classList.add("hidden");
  spinBtn.disabled = true;
  slotMessage.textContent = "Spinning...";

  reels.forEach((reel, index) => {
    reel.textContent = reelSymbols[0];
    reel.style.transform = "translateY(0)";
    reel.style.opacity = "1";

    setTimeout(() => {
      let spinStep = 0;
      const spinTimer = setInterval(() => {
        const symbol = reelSymbols[spinStep % reelSymbols.length];
        reel.textContent = symbol;
        reel.style.transform = `translateY(${spinStep % 2 === 0 ? 0 : -10}px)`;
        spinStep += 1;

        if (spinStep >= 12) {
          clearInterval(spinTimer);
          reel.textContent = jackpotSymbol;
          reel.style.transform = "translateY(0)";
          reel.style.opacity = "1";
        }
      }, 90);
    }, index * 500);
  });

  setTimeout(() => {
    slotMessage.textContent = "Jackpot! You won the anniversary prize 💖";
    claimJackpotBtn.classList.remove("hidden");
    spinBtn.disabled = false;
  }, spinDuration + 100);
});

claimJackpotBtn.addEventListener("click", async () => {
  const email = "bjonkeith@gmail.com";
  claimJackpotBtn.disabled = true;
  claimJackpotBtn.textContent = "Sending...";
  jackpotModal.classList.remove("hidden");
  jackpotModal.setAttribute("aria-hidden", "false");
  jackpotModal.focus();

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: "Anniversary surprise website",
        message: "The anniversary jackpot was claimed. She is ready for her surprise gift!",
        _subject: "Jackpot claimed!",
        _template: "table"
      })
    });
    const result = await response.json();

    if (!response.ok || result.success === false || result.success === "false") {
      throw new Error("Notification service rejected the request.");
    }

  } catch {
    claimJackpotBtn.disabled = false;
    claimJackpotBtn.textContent = "Claim jackpot";
  }
});

createPuzzleBoard();
createMemoryGame();
showScreen("welcome-screen");
