// puzzle-manager.js

// Retrieve puzzles from localStorage
function getPuzzleLibrary() {
  const storedPuzzles = localStorage.getItem('puzzles');
  return storedPuzzles ? JSON.parse(storedPuzzles) : {};
}

// Get today's date in YYYY-MM-DD format
function getTodayFormatted() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Main puzzle loader function
function loadTodaysPuzzle() {
  const today = getTodayFormatted();
  const PUZZLE_LIBRARY = getPuzzleLibrary(); // Get puzzles from localStorage
  
  // Try to get today's puzzle, fallback to most recent
  let puzzleData = PUZZLE_LIBRARY[today];
  
  if (!puzzleData) {
    // Find the most recent puzzle if today's isn't available
    const availableDates = Object.keys(PUZZLE_LIBRARY).sort();
    const mostRecentDate = availableDates.filter(date => date <= today).pop();
    
    if (mostRecentDate) {
      puzzleData = PUZZLE_LIBRARY[mostRecentDate];
      console.log(`No puzzle for today. Loading puzzle from ${mostRecentDate}`);
    } else {
      console.error("No suitable puzzle found!");
      return;
    }
  }
  
  // Apply theme
  applyTheme(puzzleData.theme || "default");
  
  // Update game data
  updateGameData(puzzleData);
  
  // Initialize game
  initGame();
}

// Update the gameData object with new puzzle content
function updateGameData(puzzleData) {
  // Update all gameData properties
  gameData.missingLink = puzzleData.missingLink;
  gameData.sourceTypeEmoji = puzzleData.sourceTypeEmoji;
  gameData.phase3Solution = puzzleData.phase3Solution;
  gameData.phase3Clue = puzzleData.phase3Clue;
  
  // Update clues
  gameData.clues = puzzleData.clues.map(clue => ({
    id: clue.id,
    text: clue.text,
    solution: clue.solution,
    solved: false
  }));
  
  // Update phase 2 clues
  gameData.phase2Clues = puzzleData.phase2Clues.map(clue => ({
    id: clue.id,
    gridPos: clue.gridPos,
    text: clue.text,
    solution: clue.solution,
    solved: false
  }));
  
  // Update helper functions if they depend on clue data
  gameData.getClueById = function(id) { 
    return this.clues.find(clue => clue.id === id); 
  };
  
  gameData.getPhase2ClueById = function(id) { 
    return this.phase2Clues.find(clue => clue.id === id); 
  };
}

// Apply a theme from the theme library
function applyTheme(themeName) {
  // Reset any existing theme classes
  document.body.className = '';
  
  // If this is a class-based theme, add the class
  if (themeName.includes("-theme")) {
    document.body.classList.add(themeName);
    return;
  }
  
  // Otherwise apply CSS variables
  const theme = THEME_LIBRARY[themeName];
  if (!theme) {
    console.warn(`Theme ${themeName} not found, using default`);
    return;
  }
  
  // Apply CSS variables to root
  const root = document.documentElement;
  Object.keys(theme).forEach(property => {
    root.style.setProperty(property, theme[property]);
  });
  
  // Apply special animation if specified
  if (theme.finalAnimation) {
    customizeFinalAnimation(theme.finalAnimation);
  }
}

// Custom final animations
function customizeFinalAnimation(animationType) {
  // Remove existing keyframes
  const existingStyle = document.getElementById('custom-animations');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create new animation based on type
  let keyframes = '';
  
  switch(animationType) {
    case 'confetti':
      keyframes = `
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
        }
        .final-celebration { animation: confetti 2s ease-out infinite; }
      `;
      break;
    case 'bounce':
      keyframes = `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
        .final-celebration { animation: bounce 1s infinite; }
      `;
      break;
    // Add more animation types
    default:
      return; // Use default animation
  }
  
  // Add new style element with custom animation
  const style = document.createElement('style');
  style.id = 'custom-animations';
  style.textContent = keyframes;
  document.head.appendChild(style);
}

// Initialization at document load
document.addEventListener('DOMContentLoaded', () => {
  loadTodaysPuzzle();
  
  // Setup How to Play modal
  const howToPlayButton = document.getElementById('howToPlayButton');
  const howToPlayModal = document.getElementById('howToPlayModal');
  const closeModalButton = document.getElementById('closeModalButton');
  
  howToPlayButton.addEventListener('click', () => {
    howToPlayModal.classList.remove('hidden');
    howToPlayModal.classList.add('flex');
  });
  
  closeModalButton.addEventListener('click', () => {
    howToPlayModal.classList.add('hidden');
    howToPlayModal.classList.remove('flex');
  });
  
  howToPlayModal.addEventListener('click', (event) => {
    if (event.target === howToPlayModal) {
      howToPlayModal.classList.add('hidden');
      howToPlayModal.classList.remove('flex');
    }
  });
});
