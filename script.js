"use strict";

/* 1. HTML elements ko select karna */
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const gameArea = document.getElementById("gameArea");
const gameBoard = document.getElementById("gameBoard");
const movesDisplay = document.getElementById("moves");
const matchedDisplay = document.getElementById("matched");
const timerDisplay = document.getElementById("timer");
const messageDisplay = document.getElementById("message");
const restartButton = document.getElementById("restartButton");

/* 2. Game settings */
const emojis = ["🐱", "🐶", "🦊", "🐼", "🦁", "🐸", "🐵", "🐰"];
const TIME_LIMIT = 60;

/* 3. Game ki starting values */
let firstCard = null;
let secondCard = null;
let moves = 0;
let matchedPairs = 0;
let secondsLeft = TIME_LIMIT;
let lockBoard = false;
let gameStarted = false;
let gameOver = false;
let timerInterval = null;
let mismatchTimeout = null;

/* 4. Start button ka click event */
startButton.addEventListener("click", startGame);

/* 5. Restart button ka click event */
restartButton.addEventListener("click", startGame);

/* 6. Naya game shuru karna */
function startGame() {
    // Purane timer aur pending card timeout ko band karna
    clearInterval(timerInterval);
    clearTimeout(mismatchTimeout);

    timerInterval = null;
    mismatchTimeout = null;

    // Game ki values reset karna
    firstCard = null;
    secondCard = null;
    moves = 0;
    matchedPairs = 0;
    secondsLeft = TIME_LIMIT;
    lockBoard = false;
    gameStarted = true;
    gameOver = false;

    // Purana score display reset karna
    movesDisplay.textContent = "0";
    matchedDisplay.textContent = "0/8";
    timerDisplay.textContent = "01:00";
    messageDisplay.textContent = "Find all 8 matching pairs! Good luck! 🎯";

    // Start screen chhupana aur game dikhana
    startScreen.hidden = true;
    gameArea.hidden = false;
    startButton.hidden = true;
    restartButton.hidden = false;

    // Purane cards remove karna
    gameBoard.replaceChildren();

    // Har emoji ki do copies banana
    const cards = [...emojis, ...emojis];

    // Cards ko random order mein mix karna
    shuffleCards(cards);

    // Har emoji ke liye button card banana
    cards.forEach(function (emoji) {
        const card = document.createElement("button");

        card.type = "button";
        card.classList.add("memory-card");
        card.textContent = "?";
        card.setAttribute("aria-label", "Hidden memory card");
        card.dataset.emoji = emoji;

        // Card click hone par flipCard function chalana
        card.addEventListener("click", function () {
            flipCard(card);
        });

        // Card ko game board mein add karna
        gameBoard.appendChild(card);
    });

    // Timer pehle card par click karne ke baad shuru hoga
}

/* 7. Cards ko random order mein mix karna */
function shuffleCards(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        const temporary = cards[i];
        cards[i] = cards[randomIndex];
        cards[randomIndex] = temporary;
    }
}

/* 8. Card ko flip karna */
function flipCard(card) {
    // Game khatam ho to card na khule
    if (gameOver || !gameStarted || lockBoard) {
        return;
    }

    // Pehle se khule ya matched card ko dobara select na karein
    if (
        card.classList.contains("matched") ||
        card.classList.contains("flipped")
    ) {
        return;
    }

    // Pehle click par countdown shuru karna
    if (timerInterval === null) {
        timerInterval = setInterval(updateTimer, 1000);
    }

    // Emoji ko dikhana
    card.textContent = card.dataset.emoji;
    card.classList.add("flipped");
    card.setAttribute("aria-label", card.dataset.emoji);

    // Agar pehla card select nahi hua, to isay pehla card bana dein
    if (firstCard === null) {
        firstCard = card;
        return;
    }

    // Doosra card select karna
    secondCard = card;

    // Har do selected cards par move count barhana
    moves++;
    movesDisplay.textContent = String(moves);

    // Dono cards ka muqabla karna
    checkMatch();
}

/* 9. Check karna ke dono cards match karte hain ya nahi */
function checkMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

    if (isMatch) {
        // Matched cards ko green style dena
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        // Matched cards ko dobara click se rokna
        firstCard.disabled = true;
        secondCard.disabled = true;

        // Matched pair count update karna
        matchedPairs++;
        matchedDisplay.textContent = matchedPairs + "/8";

        messageDisplay.textContent = "Great job! You found a pair! 🎉";

        // Selected cards reset karna
        resetSelectedCards();

        // Agar saare 8 pairs mil gaye to win
        if (matchedPairs === emojis.length) {
            finishGame();
        }
    } else {
        // Jab tak cards hide nahi hote, board lock rahega
        lockBoard = true;
        messageDisplay.textContent = "Not a match! Try again. 💪";

        // 800 milliseconds baad cards ko band karna
        mismatchTimeout = setTimeout(function () {
            mismatchTimeout = null;

            // Agar game khatam ho gaya ho to kuch na karein
            if (gameOver) {
                return;
            }

            firstCard.textContent = "?";
            secondCard.textContent = "?";

            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            firstCard.setAttribute("aria-label", "Hidden memory card");
            secondCard.setAttribute("aria-label", "Hidden memory card");

            resetSelectedCards();
        }, 800);
    }
}

/* 10. Selected cards ko reset karna */
function resetSelectedCards() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

/* 11. Countdown timer update karna */
function updateTimer() {
    if (gameOver) {
        return;
    }

    secondsLeft--;

    const minutes = Math.floor(secondsLeft / 60);
    const remainingSeconds = secondsLeft % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    timerDisplay.textContent =
        formattedMinutes + ":" + formattedSeconds;

    // Time zero ho to game khatam
    if (secondsLeft <= 0) {
        secondsLeft = 0;
        timerDisplay.textContent = "00:00";
        endGame();
    }
}

/* 12. Player jeet jaye to */
function finishGame() {
    gameOver = true;
    gameStarted = false;

    clearInterval(timerInterval);
    clearTimeout(mismatchTimeout);

    timerInterval = null;
    mismatchTimeout = null;

    messageDisplay.textContent =
        "Congratulations! You matched all 8 pairs! 🏆";

    // Game khatam hone par cards ko click se rokna
    const allCards = gameBoard.querySelectorAll(".memory-card");

    allCards.forEach(function (card) {
        card.disabled = true;
    });

    restartButton.textContent = "↻ Play Again";
}

/* 13. Waqt khatam ho jaye to */
function endGame() {
    gameOver = true;
    gameStarted = false;
    lockBoard = true;

    clearInterval(timerInterval);
    clearTimeout(mismatchTimeout);

    timerInterval = null;
    mismatchTimeout = null;

    messageDisplay.textContent =
        "Time's up! Game over. Press Restart Game to try again. ⏰";

    // Saare cards disable karna
    const allCards = gameBoard.querySelectorAll(".memory-card");

    allCards.forEach(function (card) {
        card.disabled = true;
    });

    // Restart button ko available rakhna
    restartButton.textContent = "↻ Restart Game";
}

/* 14. Page khulne par sirf Start screen dikhana */
startScreen.hidden = false;
gameArea.hidden = true;
startButton.hidden = false;
restartButton.hidden = true;