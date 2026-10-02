'use strict';


/* 1. Settings */
const TOTAL_QUESTIONS = 30;
const SECONDS_PER_QUESTION = 20;
const OPTION_COUNT = 4;
const DELAY_AFTER_ANSWER = 1100;   
const DELAY_AFTER_TIME_UP = 1400;  

const PRAISE = ['🎉 Great job!', '🌟 Correct!', '👏 Awesome!', '🔥 You got it!'];


/* 2. State */
const app = document.getElementById('app');

const game = {
  mode: null,            
  questionNumber: 0,
  score: 0,
  correctAnswer: null,
  locked: false,         
  timerId: null,
  timeLeft: 0,
};


/* 3. Helpers */
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomItem = (list) => list[randomInt(0, list.length - 1)];

const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);

function highlightCorrectAnswer() {
  app.querySelectorAll('.opts button').forEach((button) => {
    if (Number(button.dataset.value) === game.correctAnswer) {
      button.classList.add('good');
    }
  });
}


/* 4. Questions */
function makeQuestion() {
  const operator = game.mode === '?' ? randomItem(['+', '-', '×']) : game.mode;
  let a, b, answer;

  if (operator === '+') {
    a = randomInt(1, 20);
    b = randomInt(1, 20);
    answer = a + b;
  } else if (operator === '-') {
    a = randomInt(5, 25);
    b = randomInt(1, a);
    answer = a - b;
  } else {
    a = randomInt(2, 10);
    b = randomInt(2, 10);
    answer = a * b;
  }

  return { text: `${a} ${operator} ${b} = ?`, answer };
}

function makeOptions(answer) {
  const options = new Set([answer]);

  while (options.size < OPTION_COUNT) {
    const wrong = answer + randomInt(-5, 5);
    if (wrong >= 0) options.add(wrong);
  }

  return shuffle(options);
}


/* 5. Screens */
function showMenu() {
  app.innerHTML = `
    <div class="menu">
      <h1>➕ Math Quiz!</h1>
      <p>Pick a game:</p>
      <button data-mode="+">➕ Addition</button>
      <button data-mode="-">➖ Subtraction</button>
      <button data-mode="×">✖️ Multiplication</button>
      <button data-mode="?">🎲 Mix</button>
    </div>`;

  app.querySelectorAll('button').forEach((button) => {
    button.onclick = () => startGame(button.dataset.mode);
  });
}

function showQuestion() {
  const question = makeQuestion();
  const options = makeOptions(question.answer);
  const progress = ((game.questionNumber - 1) / TOTAL_QUESTIONS) * 100;

  game.correctAnswer = question.answer;
  game.locked = false;

  app.innerHTML = `
    <div class="top">
      <span>Question ${game.questionNumber}/${TOTAL_QUESTIONS}</span>
      <span id="timer">⏱️ ${SECONDS_PER_QUESTION}</span>
      <span>⭐ ${game.score}</span>
    </div>
    <div class="bar"><div style="width:${progress}%"></div></div>
    <div class="q">${question.text}</div>
    <div class="opts">
      ${options.map((o) => `<button data-value="${o}">${o}</button>`).join('')}
    </div>
    <div class="msg" id="msg"></div>`;

  app.querySelectorAll('.opts button').forEach((button) => {
    button.onclick = () => handleAnswer(button);
  });

  startTimer();
}

function showResults() {
  clearInterval(game.timerId);

  const { score } = game;
  const stars = score >= 9 ? 3 : score >= 6 ? 2 : score >= 3 ? 1 : 0;
  const message =
    score >= 9 ? 'Math champion! 🏆' :
    score >= 6 ? 'Very good! 👍' :
                 'Nice try! Practice more 💪';

  app.innerHTML = `
    <h1>🎊 Done!</h1>
    <p>You got <b>${score}</b> out of ${TOTAL_QUESTIONS}</p>
    <div class="stars">${'⭐'.repeat(stars) || '🙂'}</div>
    <p>${message}</p>
    <div class="menu">
      <button id="again">Play Again</button>
      <button id="change">Change Game</button>
    </div>`;

  document.getElementById('again').onclick = () => startGame(game.mode);
  document.getElementById('change').onclick = showMenu;
}


/* 6. Timer */
function startTimer() {
  clearInterval(game.timerId);
  game.timeLeft = SECONDS_PER_QUESTION;

  game.timerId = setInterval(() => {
    game.timeLeft--;

    const timer = document.getElementById('timer');
    if (timer) {
      timer.textContent = `⏱️ ${game.timeLeft}`;
      timer.style.color = game.timeLeft <= 3 ? 'var(--bad)' : '';
    }

    if (game.timeLeft <= 0) handleTimeUp();
  }, 1000);
}

function handleTimeUp() {
  clearInterval(game.timerId);
  if (game.locked) return;
  game.locked = true;

  highlightCorrectAnswer();
  document.getElementById('msg').textContent =
    `⏰ Time's up! The answer is ${game.correctAnswer}.`;

  setTimeout(nextQuestion, DELAY_AFTER_TIME_UP);
}


/* 7. Answering */
function handleAnswer(button) {
  if (game.locked) return;
  game.locked = true;
  clearInterval(game.timerId);

  const message = document.getElementById('msg');
  const isCorrect = Number(button.dataset.value) === game.correctAnswer;

  if (isCorrect) {
    game.score++;
    button.classList.add('good');
    message.textContent = randomItem(PRAISE);
  } else {
    button.classList.add('bad');
    highlightCorrectAnswer();
    message.textContent = `Oops! The answer is ${game.correctAnswer}.`;
  }

  setTimeout(nextQuestion, DELAY_AFTER_ANSWER);
}


/* 8. Start */
function startGame(mode) {
  game.mode = mode;
  game.questionNumber = 0;
  game.score = 0;
  nextQuestion();
}

function nextQuestion() {
  if (game.questionNumber >= TOTAL_QUESTIONS) return showResults();

  game.questionNumber++;
  showQuestion();
}

showMenu();
