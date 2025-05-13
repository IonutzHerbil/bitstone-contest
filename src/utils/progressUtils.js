// Progress utility functions

// Save game progress to local storage without server calls
export const saveGameProgress = async (gameId, completedLocations, isCompleted = false) => {
  try {
    // Get the current user data
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      throw new Error('No user data found');
    }

    // Prepare the progress data
    const progressData = {
      gameId,
      completed: isCompleted,
      completedLocations: completedLocations.map(locId => ({
        locationId: locId,
        timestamp: new Date()
      }))
    };

    // Update user data in localStorage
    const gameProgressIndex = userData.gameProgress?.findIndex(g => g.gameId === gameId) ?? -1;
    
    if (gameProgressIndex >= 0) {
      userData.gameProgress[gameProgressIndex] = {
        ...userData.gameProgress[gameProgressIndex],
        ...progressData,
        completed: isCompleted
      };
    } else {
      if (!userData.gameProgress) {
        userData.gameProgress = [];
      }
      userData.gameProgress.push({
        ...progressData,
        completed: isCompleted
      });
    }

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData));

    // Also save to a separate localStorage item for redundancy
    const localProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}');
    localProgress[gameId] = {
      completed: isCompleted,
      completedLocations,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('gameProgress', JSON.stringify(localProgress));
    
    // Dispatch a custom event to notify components of the update
    window.dispatchEvent(new Event('userDataUpdate'));

    return true;
  } catch (error) {
    console.error('Error saving game progress:', error);
    return false;
  }
};

// Get game progress from local storage
export const getGameProgress = (gameId) => {
  try {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData.gameProgress) return null;
    
    return userData.gameProgress.find(g => g.gameId === gameId);
  } catch (error) {
    console.error('Error getting game progress:', error);
    return null;
  }
};

// Load game progress from local storage only
export const loadGameProgress = async (gameId) => {
  try {
    // Get from localStorage
    const localProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}')[gameId];
    const userData = JSON.parse(localStorage.getItem('user'));
    const userProgress = userData?.gameProgress?.find(g => g.gameId === gameId);

    // If we have local progress, use it
    if (localProgress || userProgress) {
      return localProgress || userProgress;
    }

    // If no progress found, return default empty progress
    return {
      gameId,
      completed: false,
      completedLocations: []
    };
  } catch (error) {
    console.error('Error loading progress:', error);
    // Return default progress if everything fails
    return {
      gameId,
      completed: false,
      completedLocations: []
    };
  }
};

// Calculate completion percentage
export const calculateGameCompletion = (completedLocations, totalLocations) => {
  if (!completedLocations || !totalLocations) return 0;
  return (completedLocations.length / totalLocations) * 100;
};

// Calculate total score
export const calculateTotalScore = (locations, completedLocations) => {
  if (!locations || !completedLocations) return 0;
  return locations
    .filter(loc => completedLocations.some(completed => completed.locationId === loc.id))
    .reduce((sum, loc) => sum + loc.points, 0);
};

// Get game status
export const getGameStatus = (progress) => {
  if (!progress || !progress.completedLocations) {
    return 'NEW';
  }
  if (progress.completed) {
    return 'COMPLETED';
  }
  if (progress.completedLocations.length > 0) {
    return 'IN_PROGRESS';
  }
  return 'NEW';
};

// Format completion date
export const formatCompletionDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 