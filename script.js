"use strict";
function getID(input) {
  return document.getElementById(input);
}

function getAllQueries(input) {
  return document.querySelectorAll(input);
}

function getQueries(input) {
  return document.querySelector(input);
}
////////////////////////////////////////////////////////////////////////////////
// Pages
const gamePage = getID("game-page");
const scorePage = getID("score-page");
const splashPage = getID("splash-page");
const countdownPage = getID("countdown-page");
// Splash Page
const startForm = getID("start-form");
const radioContainers = getAllQueries(".radio-container");
const radioInputs = getAllQueries(".input");
const bestScores = getAllQueries(".best-score-value");
// Countdown Page
const countdown = getQueries(".countdown");
//Game Page
const itemContainer = getQueries(".item-container");
//Score Page
const finalTimeEl = getQueries(".final-time");
const baseTimeEl = getQueries(".base-time");
const penaltyTimeEl = getQueries(".penalty-time");
//Play Again Btn
const playAgainBtn = getID("play-again-btn");
/////////////////////////////////////////////////////////////////////////////////

//Equations
let equationsArray = [];
let questionAmount = 0;
let playerGuessArray = [];

//Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

//Countdown Page
let countdownNumber = 3;

//Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

//Scores
let bestScoreArray = [];

//Scroll
let valueY = 0;

//Refresh Splash Page Best Scores
function bestScoresToDOM() {
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  });
}

//Check Local Storage for Best Scores, set bestScoreArray
function getSavedBestScores() {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];

    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
}

//Update Best Score Array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    //Select correct Best Score to update
    if (questionAmount == score.questions) {
      //Return Best Score as number with one decimal
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      //Update if the new final score is less or replacing zero
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  //Update Splash Page
  bestScoresToDOM();
  //Save to Local Storage
  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
}

//Get the value from selected radio button
function getRadioValue() {
  let radioValue;
  radioContainers.forEach((radioEl) => {
    if (radioEl.children[1].checked) {
      radioValue = radioEl.children[1].value;
    }
  });
  return radioValue;
}

//Navigate from Splash Page to Countdown
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  beginCountdown();
}

//Start Countdown
function beginCountdown() {
  countdown.textContent = countdownNumber;
  let c = setInterval(() => {
    countdownNumber--;
    countdown.textContent = countdownNumber;
    if (countdownNumber === 0) {
      countdown.textContent = "GO!";
      clearInterval(c);
      setTimeout(() => {
        showGamePage();
      }, 1000);
    }
  }, 1000);
}

//Reset Game
function playAgain() {
  gamePage.addEventListener("click", startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  countdownNumber = 3;
  playAgainBtn.hidden = true;
}

//Show Score Page
function showScorePage() {
  //Show Play again btn after 1 second
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
}

//Format & Display Time in DOM
function scoresToDOM() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);

  //Add scores to DOM
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${baseTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  //Scroll to Top, go to Score Page
  itemContainer.scrollTo({
    top: 0,
    behavior: "instant",
  });
  showScorePage();
}

//Stop Timer, Process Results, go to Score Page
function checkTime() {
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);

    //Check for wrong guesses, add penalty time
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated === playerGuessArray[index]) {
        //Correct Guess, No Penalty
      } else {
        //Incorrect Guess, Add Penalty
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    scoresToDOM();
  }
}

//Add a tenth of a second to timePlayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

//Start timer when game page is clicked
function startTimer() {
  //Reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
}

//Scroll, Store user selection in playerGuessArray
function select(guessedTrue) {
  //Scroll 80 px
  valueY += 80;
  itemContainer.scroll(0, valueY);
  //Add guess to playerGuessArray
  return guessedTrue
    ? playerGuessArray.push("true")
    : playerGuessArray.push("false");
}

//Start Game
function showGamePage() {
  countdownPage.hidden = true;
  gamePage.hidden = false;
}

//Get a random number up to max number
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through for each correct equation, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  // Loop through for each wrong equation, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(2);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

//Add equations to DOM
function equationsToDOM() {
  equationsArray.forEach((equation) => {
    //Item
    const item = document.createElement("div");
    item.classList.add("item");
    //Equation Text
    const equationText = document.createElement("h1");
    equationText.textContent = equation.value;
    //Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

//Shuffle array elements randomly
function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

//Form that decides question amount
function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  if (!questionAmount) return;
  showCountdown();
  populateGamePage();
}

//Dynamically adding correct/incorrect equations
function populateGamePage() {
  itemContainer.textContent = "";
  //Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  //Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  //Append
  itemContainer.appendChild(topSpacer, selectedItem);
  //Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();
  //Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

startForm.addEventListener("click", () => {
  radioContainers.forEach((radioEl) => {
    //Remove Selected Label Styling
    radioEl.classList.remove("selected-label");
    //Add back if radio input is checked
    if (radioEl.children[1].checked) {
      radioEl.classList.add("selected-label");
    }
  });
});

//Event Listeners
startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);
//On Load
getSavedBestScores();
