// Progress utility functions
const API_BASE_URL = 'http://localhost:5000/api/auth';

// Save game progress to both server and local storage
export const saveGameProgress = async (gameId, completedLocations, isCompleted = false) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // First, get the current user data
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

    // Save to server
    const response = await fetch('http://localhost:5000/api/auth/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(progressData),
    });

    if (!response.ok) {
      throw new Error('Failed to save progress to server');
    }

    // Update local storage
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
      ...progressData,
      completed: isCompleted,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('gameProgress', JSON.stringify(localProgress));

    // Dispatch update event
    window.dispatchEvent(new Event('userDataUpdate'));

    return userData.gameProgress;
  } catch (error) {
    console.error('Error saving progress:', error);
    // Still update localStorage even if server save fails
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) return;

      // Update user data in localStorage
      const gameProgressIndex = userData.gameProgress?.findIndex(g => g.gameId === gameId) ?? -1;
      const updatedProgress = {
        gameId,
        completed: isCompleted,
        completedLocations: completedLocations.map(locId => ({
          locationId: locId,
          timestamp: new Date()
        }))
      };

      if (gameProgressIndex >= 0) {
        userData.gameProgress[gameProgressIndex] = {
          ...userData.gameProgress[gameProgressIndex],
          ...updatedProgress
        };
      } else {
        if (!userData.gameProgress) {
          userData.gameProgress = [];
        }
        userData.gameProgress.push(updatedProgress);
      }

      localStorage.setItem('user', JSON.stringify(userData));

      // Update separate localStorage item
      const localProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}');
      localProgress[gameId] = {
        ...updatedProgress,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('gameProgress', JSON.stringify(localProgress));

      // Dispatch update event
      window.dispatchEvent(new Event('userDataUpdate'));

      return userData.gameProgress;
    } catch (localError) {
      console.error('Error updating local storage:', localError);
    }
  }
};

// Load game progress from both server and local storage
export const loadGameProgress = async (gameId) => {
  try {
    // First try to get from localStorage
    const localProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}')[gameId];
    const userData = JSON.parse(localStorage.getItem('user'));
    const userProgress = userData?.gameProgress?.find(g => g.gameId === gameId);

    // If we have local progress, use it
    if (localProgress || userProgress) {
      return localProgress || userProgress;
    }

    // If no local progress, try server
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        gameId,
        completed: false,
        completedLocations: []
      };
    }

    const response = await fetch(`${API_BASE_URL}/progress/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load progress from server');
    }

    const progress = await response.json();
    
    // Save the server progress locally
    const allLocalProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}');
    allLocalProgress[gameId] = {
      ...progress,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('gameProgress', JSON.stringify(allLocalProgress));

    return progress;
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