import React, { useState, useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ChakraProvider, Container, Box, VStack, Heading, Button, HStack, Text, Flex, useToast, Grid, GridItem, Image } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

import { extendTheme } from '@chakra-ui/react';
import Login from './components/Login';
import Register from './components/Register';
import PhotoGame from './components/PhotoGame';
import GameSelector from './components/GameSelector';
import LocationExplorer from './components/LocationExplorer';
import Navbar from './components/Navbar';
import { gameTypes } from './data/gameTypes';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
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
      '@keyframes gradient': {
        '0%': {
          backgroundPosition: '0% 50%',
        },
        '50%': {
          backgroundPosition: '100% 50%',
        },
        '100%': {
          backgroundPosition: '0% 50%',
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
        ghost: {
          _hover: {
            bg: 'whiteAlpha.200',
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
const GameRoute = ({ onGameComplete, onLogout, currentView, onViewChange }) => {
  const { gameId } = useParams();
  const gameData = gameTypes.find(game => game.id === gameId);
  
  if (!gameData) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PhotoGame
        gameData={gameData}
        onGameComplete={onGameComplete}
        onLogout={onLogout}
      />
    </>
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
  const toast = useToast();

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
    
    toast({
      title: "Login Successful",
      description: `Welcome back, ${userData.username}!`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
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
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
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

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'home') {
      setSelectedGame(null);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'game':
        return selectedGame ? (
          <PhotoGame 
            gameData={selectedGame}
            onGameComplete={() => handleGameCompletion(selectedGame.id)}
            onLogout={handleLogout}
          />
        ) : (
          <GameSelector 
            games={gameTypes}
            onSelectGame={(game) => {
              setSelectedGame(game);
            }}
            completedGames={completedGames}
          />
        );
      case 'explorer':
        return <LocationExplorer />;
      default:
        return (
          <VStack spacing={8} align="stretch" w="100%">
            <Box 
              bgGradient="linear(to-r, gray.900, purple.900, cyan.900, gray.900)"
              backgroundSize="200% 200%"
              animation="gradient 15s ease infinite"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="0 4px 30px rgba(0, 0, 0, 0.4)"
              p={[4, 6, 8]}
              mb={8}
            >
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8} alignItems="center">
                <GridItem>
                  <VStack spacing={4} align="flex-start">
                    <Heading 
                      size="2xl" 
                      lineHeight="shorter"
                      bgGradient="linear(to-r, cyan.400, purple.500, pink.400)"
                      bgClip="text"
                      fontWeight="extrabold"
                    >
                      Explore Cluj-Napoca Through Photography
                    </Heading>
                    <Text fontSize="lg" color="gray.300" lineHeight="tall">
                      Discover landmarks, solve challenges, and capture beautiful moments in this 
                      immersive photo exploration game. Visit locations across the city and earn points!
                    </Text>
                    <HStack spacing={4} pt={4}>
                      <Button 
                        size="lg" 
                        onClick={() => setCurrentView('game')}
                        bgGradient="linear(to-r, purple.500, pink.500)"
                        _hover={{
                          bgGradient: "linear(to-r, purple.400, pink.400)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 10px 20px rgba(159, 122, 234, 0.3)"
                        }}
                        px={8}
                      >
                        Start Playing
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        borderWidth={2}
                        onClick={() => setCurrentView('explorer')}
                        _hover={{
                          bg: "rgba(0, 255, 255, 0.1)",
                          transform: "translateY(-2px)"
                        }}
                      >
                        Explore Map
                      </Button>
                    </HStack>
                  </VStack>
                </GridItem>
                <GridItem display={{ base: "none", md: "block" }}>
                  <Box 
                    borderRadius="xl" 
                    overflow="hidden" 
                    boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
                    transform="rotate(2deg)"
                    maxH="300px"
                  >
                    {/* Placeholder for a city image - replace with your image path */}
                    <Image
                      src="https://images.unsplash.com/photo-1585208798174-6cedd86e019a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80"
                      alt="Cluj-Napoca"
                      objectFit="cover"
                      w="100%"
                      h="100%"
                    />
                  </Box>
                </GridItem>
              </Grid>
            </Box>

            <Heading size="xl" mb={4}>Featured Games</Heading>
            <GameSelector 
              games={gameTypes.slice(0, 4)} // Show only the first 4 games on the homepage
              onSelectGame={(game) => {
                setSelectedGame(game);
                setCurrentView('game');
              }}
              completedGames={completedGames}
              isCompact={true} // Add a compact prop for the homepage view
            />
            
            <Heading size="lg" mt={8} mb={4}>Your Progress</Heading>
            <Box 
              bg="gray.800" 
              p={6} 
              borderRadius="xl"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
            >
              {completedGames.length > 0 ? (
                <>
                  <Text fontSize="lg" mb={2}>
                    You've completed {completedGames.length} out of {gameTypes.length} games!
                  </Text>
                  <Button
                    variant="outline"
                    colorScheme="purple"
                    mt={2}
                    onClick={() => setCurrentView('game')}
                  >
                    Continue Your Journey
                  </Button>
                </>
              ) : (
                <>
                  <Text fontSize="lg" mb={2}>
                    You haven't completed any games yet. Start playing to track your progress!
                  </Text>
                  <Button
                    variant="outline"
                    colorScheme="cyan"
                    mt={2}
                    onClick={() => setCurrentView('game')}
                  >
                    Start Your Journey
                  </Button>
                </>
              )}
            </Box>
          </VStack>
        );
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" bg="gray.900">
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
                  <>
                    <Navbar 
                      user={user} 
                      onLogout={handleLogout} 
                      onViewChange={handleViewChange}
                      currentView={currentView}
                    />
                    <Container maxW="container.xl" py={8}>
                      {renderContent()}
                    </Container>
                  </>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/game/:gameId"
              element={
                user ? (
                  <>
                    <Navbar 
                      user={user} 
                      onLogout={handleLogout}
                      onViewChange={handleViewChange}
                      currentView="game"
                    />
                    <Container maxW="container.xl" py={8}>
                      <GameRoute
                        onGameComplete={handleGameCompletion}
                        onLogout={handleLogout}
                        currentView={currentView}
                        onViewChange={handleViewChange}
                      />
                    </Container>
                  </>
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