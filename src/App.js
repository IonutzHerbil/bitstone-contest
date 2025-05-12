import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Container } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { extendTheme } from '@chakra-ui/react';
import Login from './components/Login';
import Register from './components/Register';
import PhotoGame from './components/PhotoGame';
import GameSelector from './components/GameSelector';
import { gameTypes } from './data/gameTypes';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'black',
        color: 'white',
      },
    },
  },
  components: {
    Container: {
      baseStyle: {
        maxW: 'container.xl',
        px: [4, 6],
        py: [6, 8],
      },
    },
  },
});

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
  const [completedGames, setCompletedGames] = useState([]);

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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId,
          completed: true,
        }),
      });

      if (response.ok) {
        setCompletedGames(prev => [...prev, gameId]);
        // Update local storage
        const userData = JSON.parse(localStorage.getItem('user'));
        const updatedProgress = userData.gameProgress || [];
        const existingProgress = updatedProgress.find(p => p.gameId === gameId);
        
        if (existingProgress) {
          existingProgress.completed = true;
        } else {
          updatedProgress.push({ gameId, completed: true, completedLocations: [] });
        }
        
        userData.gameProgress = updatedProgress;
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error updating game progress:', error);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" bg="black">
          <Routes>
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <Register onRegister={handleLogin} />
                )
              }
            />
            <Route
              path="/"
              element={
                user ? (
                  <Container maxW="container.xl" py={8}>
                    <GameSelector
                      games={gameTypes}
                      completedGames={completedGames}
                      onLogout={handleLogout}
                    />
                  </Container>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/game/:gameId"
              element={
                user ? (
                  <GameRoute
                    onGameComplete={handleGameCompletion}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 