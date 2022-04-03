const cardsArea = document.querySelector('.cardsArea');
const timer = document.querySelector('.timer');
const message = document.querySelector('.message');

const cardTypes = ['heart', 'blur', 'bar', 'pet', 'pokemon', 'chair', 'star', 'puzzle'];

const levelData = [
  { row: 2, column: 2, cardHeight: 200, cardWidth: 180, },
  { row: 4, column: 4, cardHeight: 200, cardWidth: 180, }
];

const cardController = {
  cardStack: [],

  createCards: function (row, column) {

    for (let i = 0; i < row * column; i++) {
      let newCard = new Card(cardTypes[parseInt(i / 2)]);

      this.cardStack.push(newCard);
    }

    this.shuffleCards();
    this.printCards();
  },

  shuffleCards: function () {
    let stack = this.cardStack;

    for (let i = stack.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [stack[i], stack[j]] = [stack[j], stack[i]];
    }
  },

  printCards: function () {
    this.cardStack.forEach((card) => {
      cardsArea.appendChild(card.element);
    });
  },

  showAllCards: function () {
    this.cardStack.forEach(card => {
      card.flip('show');
    });
  },

  hideAllCards: function () {
    this.cardStack.forEach(card => {
      card.flip('hide');
    });
  }
}

class Card {
  constructor(type) {
    this.type = type;
    this.show = false;
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
    gameController.select(this);
  }


}

const gameStatus = {
  PLAYER_ACTIVE: false,
  MEMORY_TIME: 5,
  PAIRING_TIME: 10,
  CURRENT_LEVEL: 0,
  FIRST_SELECTED: null,
  SECOND_SELECTED: null,

  checkSameType: function () {
    return this.FIRST_SELECTED.type === this.SECOND_SELECTED.type;
  },

  clearSelect: function () {
    this.FIRST_SELECTED = null;
    this.SECOND_SELECTED = null;
  },

}

const gameController = {
  startGame: function () {
    let { row, column, cardHeight, cardWidth, } = levelData[gameStatus.CURRENT_LEVEL]

    setMessage('LEVEL ' + gameStatus.CURRENT_LEVEL);
    this.setCardArea(row, column, cardHeight, cardWidth);

    cardController.createCards(row, column);
    cardController.showAllCards();

    this.startMemory();
    this.setTiming(gameStatus.MEMORY_TIME, this.startPairing);
  },

  setCardArea: function (row, column, height, width) {
    let style = document.documentElement.style;

    style.setProperty("--row", row);
    style.setProperty("--column", column);
    style.setProperty("--cardWidth", `${width}px`);
    style.setProperty("--cardHeight", `${height}px`);
  },

  setTiming: function (second, callback) {
    let count = second;
    timer.innerText = second;

    let counter = setInterval(() => {
      timer.innerText = --count;
    }, 1000);

    setTimeout(() => {
      callback.call(this);
      clearInterval(counter);
    }, second * 1000);
  },

  startMemory: function () {
    console.log('start Memory!');
  },

  startPairing: function () {
    gameStatus.PLAYER_ACTIVE = true;
    cardController.hideAllCards();

    this.setTiming(gameStatus.PAIRING_TIME, this.timeUP);

    console.log('start Pairing!');
  },

  timeUP: function () {
    gameStatus.PLAYER_ACTIVE = false;
    timer.style.color = 'red';

    setTimeout(() => {
      cardController.showAllCards();
    }, 500);

    console.log('time up!');
  },

  select: function (card) {
    if (!gameStatus.PLAYER_ACTIVE) return;
    if (!card.element.classList.value) return;// card been paired
    if (gameStatus.FIRST_SELECTED === card) return; // avoid self paired

    if (!gameStatus.FIRST_SELECTED) {
      gameStatus.FIRST_SELECTED = card;
      card.element.classList.remove('hide');
      return;
    }

    if (!gameStatus.SECOND_SELECTED) {
      gameStatus.SECOND_SELECTED = card;
      card.element.classList.remove('hide');

      this.checkPair();
    }
  },

  checkPair: function () {
    if (gameStatus.checkSameType()) {
      sounds.play('correct');
      setTimeout(() => {
        gameStatus.FIRST_SELECTED.element.classList = '';
        gameStatus.SECOND_SELECTED.element.classList = '';
        gameStatus.clearSelect();
      }, 500);
    } else {
      sounds.play('wrong');
      setTimeout(() => {
        gameStatus.FIRST_SELECTED.element.classList.add('hide');
        gameStatus.SECOND_SELECTED.element.classList.add('hide');
        gameStatus.clearSelect();
      }, 500);

    }
  },

}

const sounds = {
  correctSound: new Audio('./sound/correct.mp3'),
  wrongSound: new Audio('./sound/wrong.mp3'),
  play: function (type) {
    if (type === 'correct') this.correctSound.play();
    if (type === 'wrong') this.wrongSound.play();
  }
}

const setMessage = function (msg) {
  message.innerText = msg;
}


window.onload = function () {
  //cardController.createCards();
  gameController.startGame();
};
