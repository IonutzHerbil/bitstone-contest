import React, { useState, useEffect } from 'react';
import { 
  ChakraProvider, 
  Box, 
  Container, 
  VStack, 
  Text,
  Heading,
  Button,
  Flex,
  Image,
  SimpleGrid,
  Card,
  CardBody,
  useToast,
  Divider
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { extendTheme } from '@chakra-ui/react';
import PhotoGame from './components/PhotoGame';
import GameSelector from './components/GameSelector';
import Navbar from './components/Navbar';
import LocationExplorer from './components/LocationExplorer';
import { gameTypes } from './data/gameTypes';

// Extended theme with more modern styling
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
        fontWeight: 'medium',
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s',
          },
        },
        outline: {
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        bg: 'gray.800',
        borderRadius: 'xl',
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
  const [currentView, setCurrentView] = useState('home');
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem('completedGames', JSON.stringify(completedGames));
  }, [completedGames]);

  const handleGameComplete = (gameId) => {
    if (!completedGames.includes(gameId)) {
      setCompletedGames([...completedGames, gameId]);
      toast({
        title: 'Challenge completed!',
        description: 'Great job identifying this location!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBackToSelection = () => {
    setSelectedGame(null);
  };

  const handleNavigation = (route) => {
    setCurrentView(route);
    setSelectedGame(null);
  };

  // Render the appropriate content based on current view
  const renderContent = () => {
    switch(currentView) {
      case 'home':
        return (
          <Box>
            <Box 
              position="relative" 
              height={["300px", "400px", "500px"]} 
              overflow="hidden" 
              borderRadius="xl"
              mb={8}
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bgGradient="linear(to-b, transparent, rgba(0,0,0,0.8))"
                zIndex="1"
              />
              <Image
                src="https://images.unsplash.com/photo-1580408485011-9aafe9b18bdb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                alt="Cluj-Napoca Cityscape"
                objectFit="cover"
                width="100%"
                height="100%"
              />
              <Box
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                p={8}
                zIndex="2"
              >
                <Heading 
                  size="2xl" 
                  mb={4}
                  bgGradient="linear(to-r, cyan.400, purple.500)" 
                  bgClip="text"
                  fontWeight="extrabold"
                >
                  Discover Cluj-Napoca
                </Heading>
                <Text fontSize="xl" mb={6} maxWidth="700px">
                  Explore the hidden gems and iconic landmarks of Cluj-Napoca through interactive photo challenges and location discoveries.
                </Text>
                <Flex gap={4} flexWrap="wrap">
                  <Button 
                    colorScheme="purple" 
                    size="lg"
                    onClick={() => handleNavigation('challenge')}
                  >
                    Start Photo Challenge
                  </Button>
                  <Button 
                    colorScheme="cyan" 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleNavigation('explorer')}
                  >
                    Explore Locations
                  </Button>
                </Flex>
              </Box>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Card 
                variant="filled" 
                _hover={{ transform: 'translateY(-8px)', transition: 'all 0.3s' }}
              >
                <CardBody>
                  <Heading size="md" mb={4} color="purple.400">Photo Challenge</Heading>
                  <Text mb={4}>
                    Test your knowledge of Cluj-Napoca by identifying famous landmarks and locations from photographs. Complete challenges to unlock achievements.
                  </Text>
                  <Button 
                    variant="ghost" 
                    colorScheme="purple"
                    onClick={() => handleNavigation('challenge')}
                  >
                    Play Now
                  </Button>
                </CardBody>
              </Card>
              
              <Card 
                variant="filled" 
                _hover={{ transform: 'translateY(-8px)', transition: 'all 0.3s' }}
              >
                <CardBody>
                  <Heading size="md" mb={4} color="cyan.400">Location Explorer</Heading>
                  <Text mb={4}>
                    Upload your photos to discover information about locations in Cluj-Napoca. Save your favorite places and create your personal collection.
                  </Text>
                  <Button 
                    variant="ghost" 
                    colorScheme="cyan"
                    onClick={() => handleNavigation('explorer')}
                  >
                    Start Exploring
                  </Button>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Box>
        );
      
      case 'challenge':
        return (
          <VStack spacing={6} align="stretch">
            {selectedGame ? (
              <>
                <Button
                  leftIcon={<ArrowBackIcon />}
                  onClick={handleBackToSelection}
                  colorScheme="gray"
                  size="sm"
                  width="fit-content"
                >
                  Back to Games
                </Button>
                <PhotoGame 
                  gameData={selectedGame}
                  onGameComplete={() => handleGameComplete(selectedGame.id)}
                />
              </>
            ) : (
              <GameSelector 
                games={gameTypes}
                onSelectGame={setSelectedGame}
                completedGames={completedGames}
              />
            )}
          </VStack>
        );
      
      case 'explorer':
        return <LocationExplorer />;
      
      case 'about':
        return (
          <VStack spacing={6} align="stretch">
            <Heading
              size="xl"
              mb={4}
              bgGradient="linear(to-r, cyan.400, purple.500)" 
              bgClip="text"
            >
              About Cluj-Napoca
            </Heading>
            <Text fontSize="lg">
              Cluj-Napoca, often called simply Cluj, is the unofficial capital of Transylvania and one of Romania's most vibrant and dynamic cities. With a rich history dating back to Roman times, the city combines historical architecture with modern amenities and a thriving cultural scene.
            </Text>
            <Text fontSize="lg">
              Home to Romania's largest student population, Cluj-Napoca offers a unique blend of tradition and innovation, with numerous festivals, museums, parks, and cafes to explore.
            </Text>
            <Image 
              src="https://images.unsplash.com/photo-1516214104703-d870798883c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
              alt="Cluj-Napoca Central Square"
              borderRadius="xl"
              my={4}
            />
            <Heading size="md" mb={2}>Key Landmarks</Heading>
            <Text>
              St. Michael's Church, Unirii Square, Botanical Garden, Cluj-Napoca National Theatre, Banffy Palace, and The Museum of Art are just some of the stunning attractions you can discover in this beautiful city.
            </Text>
          </VStack>
        );
      
      case 'favorites':
        return (
          <VStack spacing={6} align="stretch">
            <Heading
              size="xl"
              mb={4}
              bgGradient="linear(to-r, cyan.400, purple.500)" 
              bgClip="text"
            >
              My Favorites
            </Heading>
            <Text fontSize="lg" mb={8}>
              Your favorite locations will appear here. Use the Location Explorer to discover and save places you love!
            </Text>
            
            <VStack spacing={4} align="center">
              <Text color="gray.400" fontStyle="italic">No favorites saved yet</Text>
              <Button 
                colorScheme="cyan"
                onClick={() => handleNavigation('explorer')}
              >
                Explore Locations
              </Button>
            </VStack>
          </VStack>
        );
      
      case 'settings':
        return (
          <VStack spacing={6} align="stretch">
            <Heading
              size="xl"
              mb={4}
              bgGradient="linear(to-r, cyan.400, purple.500)" 
              bgClip="text"
            >
              Settings
            </Heading>
            <Text fontSize="lg" mb={4}>
              Customize your Cluj Explorer experience.
            </Text>
            
            <Card variant="filled" mb={4}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">App Data</Heading>
                  <Divider />
                  <Button 
                    colorScheme="red" 
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem('completedGames');
                      setCompletedGames([]);
                      toast({
                        title: 'Progress reset',
                        description: 'Your game progress has been reset.',
                        status: 'info',
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                  >
                    Reset Progress
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        );
      
      default:
        return <Box>Page not found</Box>;
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.900" color="white">
        <Navbar onNavigate={handleNavigation} />
        <Container maxW="container.xl" py={8}>
          {renderContent()}
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 