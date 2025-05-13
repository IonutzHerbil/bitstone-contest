import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ChakraProvider, Container, Box, VStack, Text, Button } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

import theme from './theme';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import PhotoGame from './components/PhotoGame';
import GameSelector from './components/GameSelector';
import LocationExplorer from './components/LocationExplorer';
import About from './components/About';
import { gameTypes } from './data/gameTypes';

// Wrapper component to handle game route parameters
const GameRoute = ({ onGameComplete, onLogout }) => {
  const { gameId } = useParams();
  const gameData = gameTypes.find(game => game.id === gameId);
  
  if (!gameData) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <PhotoGame
        gameData={gameData}
        onGameComplete={onGameComplete}
        onLogout={onLogout}
      />
    </Container>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [completedGames, setCompletedGames] = useState(() => {
    const saved = localStorage.getItem('completedGames');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Check for existing user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      // Set completed games from user data
      const completed = userData.gameProgress
        ?.filter(progress => progress.completed)
        .map(progress => progress.gameId) || [];
      setCompletedGames(completed);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    const completed = userData.gameProgress
      ?.filter(progress => progress.completed)
      .map(progress => progress.gameId) || [];
    setCompletedGames(completed);
  };

  const handleLogout = async () => {
    try {
      // First, save any final progress
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData?.gameProgress) {
        const token = localStorage.getItem('token');
        // Save each game's progress one last time
        await Promise.all(userData.gameProgress.map(async (progress) => {
          if (progress.completedLocations.length > 0) {
            await fetch('http://localhost:5000/api/auth/progress', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                gameId: progress.gameId,
                completed: progress.completed,
                completedLocations: progress.completedLocations
              }),
            });
          }
        }));
      }
      
      // Then clear the local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setCompletedGames([]);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear the data even if saving fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setCompletedGames([]);
    }
  };

  const handleGameCompletion = async (gameId) => {
    if (completedGames.includes(gameId)) return;
    
    try {
      const token = localStorage.getItem('token');
      // Save progress to backend
      const response = await fetch('http://localhost:5000/api/auth/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId,
          completed: true
        }),
      });

      if (response.ok) {
        // Update local state
        const updatedGames = [...completedGames, gameId];
        setCompletedGames(updatedGames);
        localStorage.setItem('completedGames', JSON.stringify(updatedGames));
        
        // Update user data in local storage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          const gameProgress = userData.gameProgress || [];
          const existingProgressIndex = gameProgress.findIndex(p => p.gameId === gameId);
          
          if (existingProgressIndex >= 0) {
            gameProgress[existingProgressIndex].completed = true;
          } else {
            gameProgress.push({ gameId, completed: true, completedLocations: [] });
          }
          
          userData.gameProgress = gameProgress;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box 
          minH="100vh" 
          bg="background.primary"
        >
          <Navbar />
          
          <Routes>
            <Route 
              path="/" 
              element={
                <GameSelector 
                  games={gameTypes}
                  onGameSelect={setSelectedGame} 
                  completedGames={completedGames}
                  onLogout={handleLogout}
                />
              } 
            />
            <Route 
              path="/game/:gameId" 
              element={
                <GameRoute 
                  onGameComplete={handleGameCompletion} 
                  onLogout={handleLogout}
                />
              } 
            />
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? <Navigate to="/" replace /> : <Register onRegister={handleLogin} />
              } 
            />
            <Route 
              path="/explorer" 
              element={<LocationExplorer />} 
            />
            <Route 
              path="/about" 
              element={<About />} 
            />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 