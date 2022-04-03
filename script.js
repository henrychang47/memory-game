const cardsArea = document.querySelector('.cardsArea');
const timer = document.querySelector('.timer');

const cardTypes = ['heart', 'blur', 'bar', 'pet', 'pokemon', 'chair', 'star', 'puzzle'];

const cardController = {
  cardHeight: 200,
  cardWidth: 180,
  cardStack: [],

  createCards: function (row = 4, column = 4) {
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
    cardController.showAllCards();

    this.startMemory();
    this.setTiming(gameStatus.MEMORY_TIME, this.startPairing);
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
      setTimeout(() => {
        gameStatus.FIRST_SELECTED.element.classList = '';
        gameStatus.SECOND_SELECTED.element.classList = '';
        gameStatus.clearSelect();
      }, 500);
    } else {
      setTimeout(() => {
        gameStatus.FIRST_SELECTED.element.classList.add('hide');
        gameStatus.SECOND_SELECTED.element.classList.add('hide');
        gameStatus.clearSelect();
      }, 500);

    }
  },

}


window.onload = function () {
  //document.documentElement.style.setProperty("--cardWidth", "40px");
  cardController.createCards();
  gameController.startGame();
};
