import React, { useState, useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ChakraProvider, Container, Box, VStack, Heading, Button, HStack, Text } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

import { extendTheme } from '@chakra-ui/react';
import Login from './components/Login';
import Register from './components/Register';
import PhotoGame from './components/PhotoGame';
import GameSelector from './components/GameSelector';
import LocationExplorer from './components/LocationExplorer';
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
      '@keyframes pulse': {
        '0%': {
          transform: 'scale(1)',
          opacity: 0.8,
        },
        '70%': {
          transform: 'scale(2)',
          opacity: 0,
        },
        '100%': {
          transform: 'scale(2.5)',
          opacity: 0,
        },
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
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 255, 255, 0.3)',
        },
        transition: 'all 0.2s',
      },
      variants: {
        solid: {
          bg: 'cyan.400',
          color: 'white',
          _hover: {
            bg: 'cyan.500',
          },
        },
        outline: {
          borderColor: 'cyan.400',
          color: 'cyan.400',
          _hover: {
            bg: 'rgba(0, 255, 255, 0.1)',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        bgGradient: 'linear(to-r, cyan.400, purple.500)',
        bgClip: 'text',
        letterSpacing: 'tight',
      },
    },
    Box: {
      baseStyle: {
        borderRadius: 'xl',
        transition: 'all 0.2s',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'gray.800',
          borderRadius: 'xl',
          borderWidth: '1px',
          borderColor: 'transparent',
          overflow: 'hidden',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translateY(-5px)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
          },
        },
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
  const [selectedGame, setSelectedGame] = useState(null);
  const [completedGames, setCompletedGames] = useState(() => {
    const saved = localStorage.getItem('completedGames');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentView, setCurrentView] = useState('home'); // 'home', 'game', or 'explorer'

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

  const handleBackToHome = () => {
    setSelectedGame(null);
    setCurrentView('home');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'game':
        return selectedGame ? (
          <VStack spacing={6} align="stretch">
            <Button
              leftIcon={<ArrowBackIcon />}
              onClick={handleBackToHome}
              colorScheme="gray"
              size="sm"
              width="fit-content"
            >
              Back to Home
            </Button>
            <PhotoGame 
              gameData={selectedGame}
              onGameComplete={() => handleGameCompletion(selectedGame.id)}
            />
          </VStack>
        ) : (
          <GameSelector 
            games={gameTypes}
            onSelectGame={(game) => {
              setSelectedGame(game);
              setCurrentView('game');
            }}
            completedGames={completedGames}
          />
        );
      case 'explorer':
        return (
          <VStack spacing={6} align="stretch">
            <Button
              leftIcon={<ArrowBackIcon />}
              onClick={handleBackToHome}
              colorScheme="gray"
              size="sm"
              width="fit-content"
            >
              Back to Home
            </Button>
            <LocationExplorer />
          </VStack>
        );
      default:
        return (
          <VStack spacing={8}>
            <HStack spacing={4}>
              <Button
                colorScheme="purple"
                size="lg"
                onClick={() => setCurrentView('game')}
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgGradient: 'linear(to-r, purple.600, pink.500)',
                  borderRadius: 'lg',
                  transition: 'all 0.3s',
                }}
                _hover={{
                  transform: 'translateY(-5px)',
                  _before: {
                    filter: 'brightness(1.2)',
                  },
                }}
                _active={{
                  transform: 'scale(0.95)',
                }}
                px={8}
                py={6}
              >
                <Box
                  position="relative"
                  zIndex={1}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Text fontSize="xl" fontWeight="bold">
                    Photo Challenge
                  </Text>
                  <Box
                    as="span"
                    className="pulse"
                    position="absolute"
                    top="-10px"
                    right="-20px"
                    width="12px"
                    height="12px"
                    borderRadius="full"
                    bg="pink.400"
                    _after={{
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: 'full',
                      animation: 'pulse 2s infinite',
                      bg: 'pink.400',
                    }}
                  />
                </Box>
              </Button>
              <Button
                colorScheme="cyan"
                size="lg"
                onClick={() => setCurrentView('explorer')}
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgGradient: 'linear(to-r, cyan.400, blue.500)',
                  borderRadius: 'lg',
                  transition: 'all 0.3s',
                }}
                _hover={{
                  transform: 'translateY(-5px)',
                  _before: {
                    filter: 'brightness(1.2)',
                  },
                }}
                _active={{
                  transform: 'scale(0.95)',
                }}
                px={8}
                py={6}
              >
                <Box
                  position="relative"
                  zIndex={1}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Text fontSize="xl" fontWeight="bold">
                    Location Explorer
                  </Text>
                  <Box
                    as="span"
                    position="absolute"
                    top="-10px"
                    right="-20px"
                    width="12px"
                    height="12px"
                    borderRadius="full"
                    bg="blue.400"
                    _after={{
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: 'full',
                      animation: 'pulse 2s infinite',
                      bg: 'blue.400',
                    }}
                  />
                </Box>
              </Button>
            </HStack>
            {currentView === 'game' && (
              <GameSelector 
                games={gameTypes}
                onSelectGame={(game) => {
                  setSelectedGame(game);
                  setCurrentView('game');
                }}
                completedGames={completedGames}
              />
            )}
          </VStack>
        );
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
                    <VStack spacing={8}>
                      <HStack spacing={4}>
                        <Button
                          colorScheme="purple"
                          size="lg"
                          onClick={() => setCurrentView('game')}
                          position="relative"
                          overflow="hidden"
                          _before={{
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            bgGradient: 'linear(to-r, purple.600, pink.500)',
                            borderRadius: 'lg',
                            transition: 'all 0.3s',
                          }}
                          _hover={{
                            transform: 'translateY(-5px)',
                            _before: {
                              filter: 'brightness(1.2)',
                            },
                          }}
                          _active={{
                            transform: 'scale(0.95)',
                          }}
                          px={8}
                          py={6}
                        >
                          <Box
                            position="relative"
                            zIndex={1}
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <Text fontSize="xl" fontWeight="bold">
                              Photo Challenge
                            </Text>
                            <Box
                              as="span"
                              className="pulse"
                              position="absolute"
                              top="-10px"
                              right="-20px"
                              width="12px"
                              height="12px"
                              borderRadius="full"
                              bg="pink.400"
                              _after={{
                                content: '""',
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: 'full',
                                animation: 'pulse 2s infinite',
                                bg: 'pink.400',
                              }}
                            />
                          </Box>
                        </Button>
                        <Button
                          colorScheme="cyan"
                          size="lg"
                          onClick={() => setCurrentView('explorer')}
                          position="relative"
                          overflow="hidden"
                          _before={{
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            bgGradient: 'linear(to-r, cyan.400, blue.500)',
                            borderRadius: 'lg',
                            transition: 'all 0.3s',
                          }}
                          _hover={{
                            transform: 'translateY(-5px)',
                            _before: {
                              filter: 'brightness(1.2)',
                            },
                          }}
                          _active={{
                            transform: 'scale(0.95)',
                          }}
                          px={8}
                          py={6}
                        >
                          <Box
                            position="relative"
                            zIndex={1}
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <Text fontSize="xl" fontWeight="bold">
                              Location Explorer
                            </Text>
                            <Box
                              as="span"
                              position="absolute"
                              top="-10px"
                              right="-20px"
                              width="12px"
                              height="12px"
                              borderRadius="full"
                              bg="blue.400"
                              _after={{
                                content: '""',
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: 'full',
                                animation: 'pulse 2s infinite',
                                bg: 'blue.400',
                              }}
                            />
                          </Box>
                        </Button>
                      </HStack>
                      {currentView === 'game' ? (
                        <GameSelector
                          games={gameTypes}
                          completedGames={completedGames}
                          onLogout={handleLogout}
                        />
                      ) : currentView === 'explorer' ? (
                        <LocationExplorer />
                      ) : null}
                    </VStack>
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