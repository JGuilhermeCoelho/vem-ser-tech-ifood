const readline = require('readline')

const MAX_ATTEMPTS = 6

class Match {
  constructor(word, hint) {
    this._word = word.toLowerCase()
    this._hint = hint
    this._guessedLetters = new Set()
    this._maxAttempts = MAX_ATTEMPTS
    this._attemptsLeft = this._maxAttempts
  }

  displayProgress() {
    let displayWord = ''
    for (const char of this._word) {
      if (this._guessedLetters.has(char)) {
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
      if (!this._guessedLetters.has(letter)) {
        this._guessedLetters.add(letter)
        if (!this._word.includes(letter)) {
          this._attemptsLeft--
        }
      }
    }
  }

  isGameOver() {
    return this.isWordGuessed() || this._attemptsLeft === 0
  }

  isWordGuessed() {
    return [...this._word].every((char) => this._guessedLetters.has(char))
  }

  getAttemptsLeft() {
    return this._attemptsLeft
  }

  getWord() {
    return this._word
  }

  guessWord(word) {
    word = word.toLowerCase()
    if (this._word === word) {
      for (const char of word) {
        this._guessedLetters.add(char)
      }
    }
  }

  getGuessedLetters() {
    return Array.from(this._guessedLetters).join(', ')
  }

  set word(word) {
    this._word = word.toLowerCase()
  }

  set hint(hint) {
    this._hint = hint
  }
}

class Player {
  constructor(name) {
    this._name = name
    this._score = 0
  }

  updateScore(points) {
    this._score += points
  }

  resetScore() {
    this._score = 0
  }

  get score() {
    return this._score
  }
}

class UserInterface {
  static askQuestion(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer)
        rl.close()
      })
    })
  }

  static printGameStatus(match, player) {
    console.log(`Palavra: ${match.displayProgress()}`)
    console.log(`Dica: ${match._hint}`)
    console.log(`Tentativas restantes: ${match.getAttemptsLeft()}`)
    console.log(`Letras já digitadas: ${match.getGuessedLetters()}`) // Adicione esta linha
    console.log(`Pontuação atual: ${player.score}`)
  }
}

class GameController {
  constructor() {
    this._player = new Player('Jogador1')
    this._match = null
  }

  startNewGame(word, hint) {
    this._match = new Match(word, hint)
  }

  async askForWordAndHint() {
    const word = await UserInterface.askQuestion(
      'Digite a palavra para o jogo: '
    )
    const hint = await UserInterface.askQuestion(
      'Digite a dica para a palavra: '
    )
    console.clear() // Limpa o terminal
    this.startNewGame(word, hint)
    this.displayGameStatus()
    this.askForAction()
  }

  async restartGame() {
    const playAgain = await UserInterface.askQuestion(
      'Você quer jogar novamente? (s/n): '
    )
    if (playAgain.toLowerCase() === 's') {
      await this.askForWordAndHint()
    } else {
      console.log('Obrigado por jogar! Até a próxima.')
    }
  }

  nextStep() {
    if (!this._match.isGameOver()) {
      this.askForAction()
    } else {
      const message = this._match.isWordGuessed()
        ? 'Você ganhou!'
        : 'Você perdeu!'
      console.log(`${message} Fim do jogo!`)
      this.restartGame() // Adicione esta linha
    }
  }

  displayGameStatus() {
    console.clear() // Limpa o terminal
    UserInterface.printGameStatus(this._match, this._player)
  }

  guessLetter(letter) {
    this._match.guess(letter)
    this.updateGame()
  }

  updateGame() {
    if (this._match.isWordGuessed()) {
      this._player.updateScore(10)
      console.log('Parabéns, você acertou a palavra!')
      this.displayGameStatus()
      this.nextStep()
    } else if (this._match.getAttemptsLeft() === 0) {
      console.log(`Você perdeu! A palavra era: ${this._match.getWord()}`)
      this.displayGameStatus()
      this.nextStep()
    } else {
      this.displayGameStatus()
      this.askForAction()
    }
  }

  guessWord(word) {
    this._match.guessWord(word)
    this.updateGame()
  }

  async askForAction() {
    const choice = await UserInterface.askQuestion(
      'Você quer chutar uma letra ou a palavra inteira? (l/p): '
    )
    if (choice.toLowerCase() === 'l') {
      const letter = await UserInterface.askQuestion('Digite uma letra: ')
      this.guessLetter(letter)
    } else if (choice.toLowerCase() === 'p') {
      const word = await UserInterface.askQuestion('Digite a palavra: ')
      this.guessWord(word)
    } else {
      console.log(
        'Escolha inválida. Por favor, escolha "l" para chutar uma letra ou "p" para chutar a palavra inteira.'
      )
      this.nextStep()
    }
  }
}

async function playGame() {
  const gameController = new GameController()
  await gameController.askForWordAndHint()
}

// Iniciar o jogo
playGame()
