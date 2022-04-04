const cardTypes = ['heart', 'blur', 'bar', 'pet', 'pokemon', 'chair', 'star', 'puzzle'];

const levelData = [
  { row: 2, column: 2, memoryTime: 5, pairingTime: 1000 },
  { row: 4, column: 4, memoryTime: 10, pairingTime: 50 },
  { row: 6, column: 6, memoryTime: 10, pairingTime: 60 },
  { row: 6, column: 6, memoryTime: 10, pairingTime: 60 }
];

class Deck {
  static displayArea = document.querySelector('.gameArea');

  constructor(row, column) {
    this.cardStack = [];

    for (let i = 0; i < row * column; i++) {
      let newCard = new Card(cardTypes[parseInt(i / 2)]);

      this.cardStack.push(newCard);
    }

    this.shuffle();
    this.printTo(Deck.displayArea);
  }

  shuffle() {
    let stack = this.cardStack;

    for (let i = stack.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [stack[i], stack[j]] = [stack[j], stack[i]];
    }
  }

  printTo(targetElement) {
    this.cardStack.forEach((card) => {
      targetElement.appendChild(card.element);
    });
  }

  showAll() {
    this.cardStack.forEach(card => {
      card.flip('show');
    });
  }

  hideAll() {
    this.cardStack.forEach(card => {
      card.flip('hide');
    });
  }
}

class Card {
  constructor(type) {
    this.type = type;
    this.show = false;
    this.removed = false;
    this.element = this.createCardElement();
  }

  createCardElement() {
    let element = document.createElement('div');
    element.classList.add('card', this.type);
    element.addEventListener('click', () => { this.click(); });

    return element;
  }

  flip(msg = 'toggle') {
    if (msg === 'toggle') {
      this.show = !this.show;
      this.element.classList.toggle('hide');
    }
    else if (msg === 'show') {
      this.show = true;
      this.element.classList.remove('hide');
    }
    else if (msg === 'hide') {
      this.show = false;
      this.element.classList.add('hide');
    }
  }

  hide() {
    this.element.classList = '';
  }

  click() {
    gameController.currentGame.select(this);
  }


}

const gameController = {
  CURRENT_LEVEL: 1,
  currentGame: null,
  timeText: document.querySelector('.timeText'),
  levelText: document.querySelector('.levelText'),


  startGame: function (setLevel = 1) {
    this.CURRENT_LEVEL = setLevel;
    this.clearTimer();
    let { row, column, pairingTime } = levelData[this.CURRENT_LEVEL - 1];
    this.showMiddleMessage(`LEVEL ${this.CURRENT_LEVEL} <br> ${row} x ${column} ${pairingTime}s`);
    this.setLevelText('LEVEL ' + this.CURRENT_LEVEL);

    setTimeout(() => {
      this.showMiddleMessage('');
      this.currentGame = new Game(levelData[this.CURRENT_LEVEL - 1]);
      this.currentGame.start();
    }, 2000);
  },

  setLevelText: function (msg) {
    this.levelText.innerText = msg;
  },

  setTimer: function (second, callback, caller) {
    let count = second;
    this.timeText.innerText = second;

    let intervalId = secondsTimer = setInterval(() => {
      this.timeText.innerText = --count;
    }, 1000);

    let timeoutId = setTimeout(() => {
      callback.call(caller);
      clearInterval(intervalId);
    }, second * 1000);

    this.lastInterval = intervalId;
    this.lastTimeout = timeoutId;
  },

  clearTimer: function () {
    clearInterval(this.lastInterval);
    clearTimeout(this.lastTimeout);
    this.timeText.innerText = '';
  },

  endGame: function (allClear) {
    this.currentGame = null;
    this.clearTimer();

    if (allClear) {
      this.showMiddleMessage("ALL CLEAR!!");

      setTimeout(() => {
        this.showMiddleMessage("");
        this.startGame(++this.CURRENT_LEVEL);
      }, 2000);
    } else {
      this.showMiddleMessage("FAILED..");

      setTimeout(() => {
        Deck.displayArea.innerHTML = "<button class='startButton'>RESTART</button>";
        document.querySelector('.startButton').addEventListener('click', () => {
          gameController.startGame();
        });
      }, 2000);
    }
  },

  showMiddleMessage(message) {
    document.documentElement.style.setProperty("--row", 1);
    document.documentElement.style.setProperty("--column", 1);
    Deck.displayArea.innerHTML = message;
  },
}

class Game {
  constructor(gameConfig) {
    let { row, column, memoryTime, pairingTime } = gameConfig;

    this.MEMORY_TIME = memoryTime;
    this.PAIRING_TIME = pairingTime;
    this.FIRST_SELECTED = null;
    this.SECOND_SELECTED = null;
    this.PLAYER_ACTIVE = false;

    this.setDisplayArea(row, column);
    this.deck = new Deck(row, column);
  }

  setDisplayArea(row, column) {
    let style = document.documentElement.style;

    style.setProperty("--row", row);
    style.setProperty("--column", column);
  }

  checkSameType() {
    return this.FIRST_SELECTED.type === this.SECOND_SELECTED.type;
  }

  clearSelect() {
    this.FIRST_SELECTED = null;
    this.SECOND_SELECTED = null;
  }

  start() {
    this.startMemory();
  }

  startMemory() {
    gameController.setTimer(this.MEMORY_TIME, this.startPairing, this);
  }

  startPairing() {
    this.PLAYER_ACTIVE = true;
    this.deck.hideAll();

    gameController.setTimer(this.PAIRING_TIME, this.timeUP, this);
  }

  timeUP() {
    setTimeout(() => {
      this.deck.showAll();
      gameController.endGame();
    }, 500);
  }

  select(card) {
    if (!this.PLAYER_ACTIVE) return;
    if (card.removed) return;// card been paired
    if (this.FIRST_SELECTED === card) return; // avoid self paired

    if (!this.FIRST_SELECTED) {
      this.FIRST_SELECTED = card;
      card.element.classList.remove('hide');
      return;
    }

    if (!this.SECOND_SELECTED) {
      this.SECOND_SELECTED = card;
      card.element.classList.remove('hide');

      this.checkPair();
    }
  }

  checkPair() {
    if (this.checkSameType()) {
      sounds.play('correct');
      this.removeSelectedPair();
      this.checkFinish();
    } else {
      sounds.play('wrong');
      setTimeout(() => {
        this.FIRST_SELECTED.element.classList.add('hide');
        this.SECOND_SELECTED.element.classList.add('hide');
        this.clearSelect();
      }, 500);
    }
  }

  removeSelectedPair() {
    let firstPaired = this.FIRST_SELECTED;
    let secondPaired = this.SECOND_SELECTED;
    this.clearSelect();

    firstPaired.removed = true;
    secondPaired.removed = true;
    firstPaired.element.classList.add('fade');
    secondPaired.element.classList.add('fade');

    setTimeout(() => {
      firstPaired.element.classList = '';
      secondPaired.element.classList = '';
    }, 1000);
  }

  checkFinish() {
    let finish = true;
    this.deck.cardStack.forEach(card => {
      if (!card.removed) {
        finish = false;
      }
    });

    if (finish) {
      gameController.endGame(true);
    }
  }

}

const sounds = new class {
  constructor() {
    this.correctSound = new Audio('./sound/correct.mp3');
    this.wrongSound = new Audio('./sound/wrong.mp3');

    this.wrongSound.volume = 0.2;
  }

  play(type) {
    if (type === 'correct') this.correctSound.play();
    if (type === 'wrong') this.wrongSound.play();
  }
}

document.querySelector('.startButton').addEventListener('click', () => {
  gameController.startGame();
});