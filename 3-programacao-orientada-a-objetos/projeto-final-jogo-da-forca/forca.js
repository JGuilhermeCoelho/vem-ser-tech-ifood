const readline = require('readline')

class Match {
  constructor(word, hint) {
    this.word = word.toLowerCase()
    this.hint = hint
    this.guessedLetters = new Set()
    this.maxAttempts = 6
    this.attemptsLeft = this.maxAttempts
  }

  displayProgress() {
    let displayWord = ''
    for (const char of this.word) {
      if (this.guessedLetters.has(char)) {
        displayWord += char + ' '
      } else {
        displayWord += '_ '
      }
    }
    return displayWord.trim()
  }

  guess(letter) {
    letter = letter.toLowerCase()
    if (!this.isGameOver()) {
      if (!this.guessedLetters.has(letter)) {
        this.guessedLetters.add(letter)
        if (!this.word.includes(letter)) {
          this.attemptsLeft--
        }
      }
    }
  }

  isGameOver() {
    return this.isWordGuessed() || this.attemptsLeft === 0
  }

  isWordGuessed() {
    for (const char of this.word) {
      if (!this.guessedLetters.has(char)) {
        return false
      }
    }
    return true
  }

  getAttemptsLeft() {
    return this.attemptsLeft
  }

  getWord() {
    return this.word
  }

  isWordGuessed() {
    return [...this.word].every((char) => this.guessedLetters.has(char))
  }

  guessWord(word) {
    word = word.toLowerCase()
    if (this.word === word) {
      for (const char of word) {
        this.guessedLetters.add(char)
      }
    }
  }

  setWordAndHint(word, hint) {
    this.word = word.toLowerCase()
    this.hint = hint
    this.guessedLetters = new Set()
    this.maxAttempts = 6
    this.attemptsLeft = this.maxAttempts
  }
}

class Player {
  constructor(name) {
    this.name = name
    this.score = 0
  }

  updateScore(points) {
    this.score += points
  }

  resetScore() {
    this.score = 0
  }

  getScore() {
    return this.score
  }
}

class GameController {
  constructor() {
    this.player = null
    this.match = null
  }

  startNewGame(word, hint, playerName) {
    this.player = new Player(playerName)
    this.match = new Match(word, hint)
  }

  askForWordAndHint() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.question('Digite a palavra para o jogo: ', (word) => {
      rl.question('Digite a dica para a palavra: ', (hint) => {
        this.startNewGame(word, hint, 'Jogador1')
        rl.close()
        this.displayGameStatus()
        this.askForAction()
      })
    })
  }

  nextStep() {
    if (!this.match.isGameOver()) {
      this.askForAction()
    } else {
      const message = this.match.isWordGuessed()
        ? 'Você ganhou!'
        : 'Você perdeu!'
      console.log(`${message} Fim do jogo!`)
    }
  }

  displayGameStatus() {
    console.log(`Palavra: ${this.match.displayProgress()}`)
    console.log(`Dica: ${this.match.hint}`)
    console.log(`Tentativas restantes: ${this.match.getAttemptsLeft()}`)
    console.log(`Pontuação atual: ${this.player.getScore()}`)
  }

  guessLetter(letter) {
    this.match.guess(letter)
    this.updateGame()
  }

  updateGame() {
    if (this.match.isWordGuessed()) {
      this.player.updateScore(10)
      console.log('Parabéns, você acertou a palavra!')
      this.displayGameStatus()
      if (!this.match.isGameOver()) {
        this.askForAction()
      } else {
        const message = this.match.isWordGuessed()
          ? 'Você ganhou!'
          : 'Você perdeu!'
        console.log(`${message} Fim do jogo!`)
      }
    } else if (this.match.getAttemptsLeft() === 0) {
      console.log(`Você perdeu! A palavra era: ${this.match.getWord()}`)
      this.displayGameStatus()
      if (!this.match.isGameOver()) {
        this.askForAction()
      } else {
        const message = this.match.isWordGuessed()
          ? 'Você ganhou!'
          : 'Você perdeu!'
        console.log(`${message} Fim do jogo!`)
      }
    } else {
      this.displayGameStatus()
    }
  }

  guessWord(word) {
    this.match.guessWord(word)
    this.updateGame()
  }

  askForAction() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.question(
      'Você quer chutar uma letra ou a palavra inteira? (l/p): ',
      (choice) => {
        if (choice.toLowerCase() === 'l') {
          rl.question('Digite uma letra: ', (letter) => {
            this.guessLetter(letter)
            rl.close()
            this.nextStep()
          })
        } else if (choice.toLowerCase() === 'p') {
          rl.question('Digite a palavra: ', (word) => {
            this.guessWord(word)
            rl.close()
            this.nextStep()
          })
        } else {
          console.log(
            'Escolha inválida. Por favor, escolha "l" para chutar uma letra ou "p" para chutar a palavra inteira.'
          )
          rl.close()
          this.nextStep()
        }
      }
    )
  }
}

function playGame() {
  const gameController = new GameController()
  gameController.askForWordAndHint()
}

// Iniciar o jogo
playGame()
