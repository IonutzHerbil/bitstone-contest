import React, { useState, useEffect } from 'react';
import { ChakraProvider, Container, Box, VStack, Heading, Button, HStack } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { extendTheme } from '@chakra-ui/react';
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
    },
  },
  components: {
    Container: {
      baseStyle: {
        maxW: 'container.md',
        px: [4, 6],
        py: [6, 8],
      },
    },
  },
});

function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [completedGames, setCompletedGames] = useState(() => {
    const saved = localStorage.getItem('completedGames');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentView, setCurrentView] = useState('home'); // 'home', 'game', or 'explorer'

  useEffect(() => {
    localStorage.setItem('completedGames', JSON.stringify(completedGames));
  }, [completedGames]);

  const handleGameComplete = (gameId) => {
    if (!completedGames.includes(gameId)) {
      setCompletedGames([...completedGames, gameId]);
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
              onGameComplete={() => handleGameComplete(selectedGame.id)}
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
              >
                Photo Challenge
              </Button>
              <Button
                colorScheme="cyan"
                size="lg"
                onClick={() => setCurrentView('explorer')}
              >
                Location Explorer
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
      <Box minH="100vh" bg="black" color="white">
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Heading 
              textAlign="center"
              bgGradient="linear(to-r, cyan.400, purple.500)" 
              bgClip="text" 
              fontSize={["2xl", "3xl"]}
              fontWeight="extrabold"
            >
              Photo Challenge & Explorer
            </Heading>
            {renderContent()}
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 