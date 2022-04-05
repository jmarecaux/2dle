
// console.log(socket);
document.addEventListener('DOMContentLoaded', () => {
  
  createTiles();
  getNewWord();
  
  let gameComplete = false;
  let guessedWords = [[]];
  let availableSpace = 1;
  
  let word;
  let guessedWordCount = 0;
  
  var gameState;
  
  // const socket = io('http://localhost:3000');
  // socket.on('init', handleInit);
  
  // listen to keyboard events
  document.addEventListener('keydown', (event) => {
    
    const currentWordArr = getCurrentWordArray();

    const regex = /[a-zA-Z]/;
    const letter = event.key;
    if(!gameComplete) {
      switch(letter) {
        case 'Enter':
          handleSubmitWord();
          break;
        case 'Backspace':
          handleDeleteLetter();
          break;
        default:
          if(letter.match(regex) && letter.length===1)
            updateGuessedWords(letter);
          break;
      }
    }
  });


  const keys = document.querySelectorAll(".keyboard-row button");
  
  function getNewWord() {
    fetch('https://wordsapiv1.p.rapidapi.com/words/?random=true&letters=5&frequencymax=1.74',
    {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
        'X-RapidAPI-Key': '4bb16ec93cmshf40018745a554ccp1b6ad0jsnadbb28e6417e'
      }
    })
    .then(response => {
      return response.json();
    })
    .then(response => word = response.word)
    .catch(err => console.error(err));
  }

  function getCurrentWordArray() {
    const numberOfGuessWords = guessedWords.length;
    return guessedWords[numberOfGuessWords-1];
  }
  
  function updateGuessedWords(letter) {

    const currentWordArray = getCurrentWordArray();
    
    if(currentWordArray && currentWordArray.length<5) {
      currentWordArray.push(letter);
      
      const availableSpaceElement = document.getElementById(String(availableSpace));
      
      availableSpace++;
      availableSpaceElement.textContent = letter;
    }
    
  }
  
  function createTiles() {
    const gameBoard = document.getElementById("board");
    
    for(let i=0; i<30; i++) {
      let tile = document.createElement("div");
      tile.classList.add("tile");
      tile.setAttribute("id", i+1);
      gameBoard.appendChild(tile);
    }
    
  }

  function getTileColor(letter, index) {

    const isCorrectLetter = word.includes(letter);

    if(!isCorrectLetter) return "rgb(58,58,60)";

    const letterAtPosition = word.charAt(index);
    const isCorrectPosition = letter === letterAtPosition;

    if(isCorrectPosition) return "rgb(83,141,78)";
    
    return "rgb(181,159,59)"
  }

  function handleSubmitWord() {

    // check input length
    const currentWordArr = getCurrentWordArray();
    if(currentWordArr.length !== 5) {
      window.alert("Word must be 5 letters!");
      return;
    }

    // convert word array to string
    const currentWord = currentWordArr.join('');

    // search words API to check if the word is valid
    fetch(`https://wordsapiv1.p.rapidapi.com/words/${currentWord}`, 
    {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
        'X-RapidAPI-Key': '4bb16ec93cmshf40018745a554ccp1b6ad0jsnadbb28e6417e'
      }
    })
    .then((res) => {
      if(!res.ok) {
        throw Error();
      }

      // update ID variable
      const firstLetterId = guessedWordCount * 5 + 1;
      
      // update colors of tiles for this guess
      currentWordArr.forEach((letter, index) => {
        const tileColor = getTileColor(letter, index);
        const letterId = firstLetterId + index;
        const letterElement = document.getElementById(letterId);
        const keyboardElement = document.getElementById(String(letter));
        keyboardElement.style = `background-color:${tileColor};`
        letterElement.style = `background-color:${tileColor};border-color:${tileColor}`;
      
        //gamestate
        if(index===4) {
          preserveGameState();
        }
      });

      // update number of guesses
      guessedWordCount++;

      // check success
      if(currentWord === word) {
        keyboardElement = document.getElementsByClassName("keyboard-button");
        for(element of keyboardElement) {
          element.disabled = true;
        }

        // mark game as finished
        gameComplete = true;

        return;
      }

      // check failure after 6 guesses
      if(guessedWords.length === 6) {
        window.alert(`You lose. The word was ${word}`);
      }

      // add guessed word to list of guessed words
      guessedWords.push([]);
      
      // invalid word handling
    }).catch(() => {
      window.alert(`Sorry, ${currentWord} is not a valid word.`);
    });

  }
  
  function handleDeleteLetter() {
    
    const currentWordArr = getCurrentWordArray();

    if(currentWordArr.length===0) return;

    const removedLetter = currentWordArr.pop();

    guessedWords[guessedWords.length-1] = currentWordArr;

    const lastLetterElement = document.getElementById(String(availableSpace-1));

    lastLetterElement.textContent = '';

    availableSpace--;

  }

  function updateGameState() {
    const boardContainer = document.getElementById('board-container');
    gameState = boardContainer.innerHTML();
  }

  function handleInit(msg) {
    console.log(msg);
  }

  // keyboard onclick function
  for(let i = 0; i < keys.length; i++) {

    keys[i].onclick = ({ target }) => {

      const letter = target.getAttribute("data-key");
      
      switch(letter) {
        case 'return':
          handleSubmitWord();
          break;
        case 'delete':
          handleDeleteLetter();
          break;
        default: 
          updateGuessedWords(letter);
          break;
      }

    }
  }

});