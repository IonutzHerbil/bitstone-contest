import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Progress,
  Badge,
  Grid,
  GridItem,
  useToast,
  Button,
  Container,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import ImageUploader from './ImageUploader';
import { saveGameProgress } from '../utils/progressUtils';

const PhotoGame = ({ gameData, onGameComplete, onLogout }) => {
  const [score, setScore] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [completedLocations, setCompletedLocations] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const totalPoints = gameData.locations.reduce((sum, loc) => sum + loc.points, 0);

  // Load saved progress when component mounts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const gameProgress = userData.gameProgress?.find(g => g.gameId === gameData.id);
    if (gameProgress && gameProgress.completedLocations) {
      const savedLocations = gameProgress.completedLocations.map(loc => loc.locationId);
      setCompletedLocations(savedLocations);
      const savedScore = gameData.locations
        .filter(loc => savedLocations.includes(loc.id))
        .reduce((sum, loc) => sum + loc.points, 0);
      setScore(savedScore);
    }
  }, [gameData]);

  useEffect(() => {
    if (gameStarted && !currentLocation) {
      selectNewLocation();
    }
  }, [gameStarted, currentLocation]);

  const handleLogout = async () => {
    try {
      if (completedLocations.length > 0) {
        await saveGameProgress(
          gameData.id,
          completedLocations,
          completedLocations.length === gameData.locations.length
        );
      }
      await onLogout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Still logout even if saving fails
      await onLogout();
    }
  };

  const handleBackToGames = async () => {
    try {
      if (completedLocations.length > 0) {
        await saveGameProgress(
          gameData.id,
          completedLocations,
          completedLocations.length === gameData.locations.length
        );
        // Dispatch custom event to update GameSelector
        window.dispatchEvent(new Event('userDataUpdate'));
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving progress:', error);
      navigate('/');
    }
  };

  const selectNewLocation = () => {
    const remainingLocations = gameData.locations.filter(
      loc => !completedLocations.includes(loc.id)
    );
    
    if (remainingLocations.length === 0) {
      toast({
        title: "Congratulations!",
        description: `You've completed ${gameData.name} with ${score} points!`,
        status: "success",
        duration: null,
        isClosable: true,
      });
      setGameStarted(false);
      onGameComplete(gameData.id);
      return;
    }

    const randomLocation = remainingLocations[
      Math.floor(Math.random() * remainingLocations.length)
    ];
    setCurrentLocation(randomLocation);
  };

  const handlePhotoSubmission = async (imageAnalysis) => {
    if (!currentLocation) return;

    // Check if imageAnalysis is a string or an object
    let analysisText = '';
    
    if (typeof imageAnalysis === 'string') {
      analysisText = imageAnalysis;
    } else if (imageAnalysis && typeof imageAnalysis === 'object') {
      // Extract text from the object fields
      const analysisFields = [
        imageAnalysis.name || '',
        imageAnalysis.description || '',
        imageAnalysis.historicalContext || '',
        // Add any other fields that might contain relevant information
        imageAnalysis.location || ''
      ];
      analysisText = analysisFields.join(' ');
    } else {
      // If we can't extract useful text, show an error
      toast({
        title: "Analysis Error",
        description: "We couldn't analyze the photo properly. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const locationMatches = currentLocation.keywords.some(keyword =>
      analysisText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (locationMatches) {
      const newScore = score + currentLocation.points;
      const newCompletedLocations = [...completedLocations, currentLocation.id];
      setScore(newScore);
      setCompletedLocations(newCompletedLocations);
      
      try {
        // Save progress after each successful submission
        await saveGameProgress(
          gameData.id,
          newCompletedLocations,
          newCompletedLocations.length === gameData.locations.length // Mark as completed if all locations are done
        );

        // Update user data in localStorage to reflect new progress
        const userData = JSON.parse(localStorage.getItem('user'));
        const gameProgressIndex = userData.gameProgress.findIndex(g => g.gameId === gameData.id);
        const updatedProgress = {
          gameId: gameData.id,
          completed: newCompletedLocations.length === gameData.locations.length,
          completedLocations: newCompletedLocations.map(locId => ({
            locationId: locId,
            timestamp: new Date()
          }))
        };

        if (gameProgressIndex >= 0) {
          userData.gameProgress[gameProgressIndex] = updatedProgress;
        } else {
          userData.gameProgress.push(updatedProgress);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Trigger update event
        window.dispatchEvent(new Event('userDataUpdate'));
        
        toast({
          title: "Photo Verified!",
          description: `+${currentLocation.points} points! Great photo of ${currentLocation.name}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        if (newCompletedLocations.length === gameData.locations.length) {
          toast({
            title: "Congratulations!",
            description: `You've completed ${gameData.name} with ${newScore} points!`,
            status: "success",
            duration: null,
            isClosable: true,
          });
          setGameStarted(false);
          onGameComplete(gameData.id);
        } else {
          selectNewLocation();
        }
      } catch (error) {
        console.error('Error saving progress:', error);
        toast({
          title: "Error Saving Progress",
          description: "Your progress couldn't be saved, but you can continue playing.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        selectNewLocation();
      }
    } else {
      toast({
        title: "Not Quite Right",
        description: "The photo doesn't match the location. Try taking another photo!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const startGame = () => {
    if (completedLocations.length > 0) {
      // If there's existing progress, ask if they want to continue
      toast({
        title: "Existing Progress Found",
        description: `You have completed ${completedLocations.length} locations. Continue from where you left off?`,
        status: "info",
        duration: null,
        isClosable: true,
        position: "top",
        render: ({ onClose }) => (
          <Box
            color="white"
            p={3}
            bg="blue.500"
            borderRadius="md"
          >
            <VStack spacing={3}>
              <Text fontWeight="bold">Existing Progress Found</Text>
              <Text>
                You have completed {completedLocations.length} locations. 
                Continue from where you left off?
              </Text>
              <Box>
                <Button
                  colorScheme="white"
                  variant="outline"
                  size="sm"
                  mr={3}
                  onClick={() => {
                    setGameStarted(true);
                    onClose();
                  }}
                >
                  Continue
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={() => {
                    setScore(0);
                    setCompletedLocations([]);
                    setGameStarted(true);
                    onClose();
                  }}
                >
                  Start Fresh
                </Button>
              </Box>
            </VStack>
          </Box>
        ),
      });
    } else {
      setGameStarted(true);
    }
  };

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box 
            bg="gray.800" 
            p={6} 
            borderRadius="xl"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
          >
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              <GridItem>
                <VStack align="start">
                  <Text color="gray.400">Score</Text>
                  <Heading size="lg" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">
                    {score}
                  </Heading>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack align="center">
                  <Text color="gray.400">Progress</Text>
                  <Progress
                    value={((completedLocations?.length || 0) / gameData.locations.length) * 100}
                    width="100%"
                    colorScheme="cyan"
                    borderRadius="full"
                  />
                  <Text color="gray.400" fontSize="sm">
                    {completedLocations.length} / {gameData.locations.length} Locations
                  </Text>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack align="end">
                  <Text color="gray.400">Total Available</Text>
                  <Text color="purple.400" fontWeight="bold">{totalPoints} pts</Text>
                </VStack>
              </GridItem>
            </Grid>
          </Box>

          {!gameStarted ? (
            <VStack spacing={6} bg="gray.800" p={8} borderRadius="xl" boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)">
              <Heading size="lg" textAlign="center" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">
                {gameData.name}
              </Heading>
              <Text 
                textAlign="center" 
                color="gray.300" 
                fontSize="lg"
                maxW="100%"
                noOfLines={1}
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                overflow="hidden"
                px={4}
              >
                {gameData.description}
              </Text>
              <Badge colorScheme={
                gameData.difficulty.toLowerCase() === 'easy' ? 'green' :
                gameData.difficulty.toLowerCase() === 'medium' ? 'yellow' : 'red'
              } fontSize="md" px={3} py={1}>
                {gameData.difficulty} Difficulty
              </Badge>
              <Text color="gray.400" textAlign="center">
                Find and photograph {gameData.locations.length} locations around Cluj-Napoca
              </Text>
              <Button
                colorScheme="cyan"
                size="lg"
                onClick={startGame}
                _hover={{ 
                  transform: 'scale(1.05)',
                  bgGradient: "linear(to-r, cyan.400, purple.400)"
                }}
                transition="all 0.2s"
                px={8}
                py={6}
                bgGradient={completedLocations.length > 0 
                  ? "linear(to-r, cyan.500, teal.500)" 
                  : "linear(to-r, cyan.500, blue.500)"
                }
              >
                {completedLocations.length > 0 ? 'Continue Game' : 'Start Challenge'}
              </Button>
            </VStack>
          ) : currentLocation ? (
            <VStack spacing={6} align="stretch">
              <Box 
                bg="gray.800" 
                p={6} 
                borderRadius="xl" 
                width="100%"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
              >
                <VStack align="start" spacing={4}>
                  <Badge 
                    colorScheme="purple" 
                    fontSize="md" 
                    p={2}
                    borderRadius="md"
                  >
                    Current Challenge
                  </Badge>
                  <Heading 
                    size="lg"
                    bgGradient="linear(to-r, cyan.400, purple.500)" 
                    bgClip="text"
                  >
                    {currentLocation.name}
                  </Heading>
                  <Text color="gray.300" fontSize="lg">
                    {currentLocation.description}
                  </Text>
                  <Badge 
                    colorScheme="green" 
                    p={2} 
                    borderRadius="md"
                    fontSize="md"
                  >
                    {currentLocation.points} points available
                  </Badge>
                </VStack>
              </Box>
              <Box 
                bg="gray.800" 
                p={6} 
                borderRadius="xl"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
              >
                <VStack align="center" spacing={4}>
                  <Text fontSize="lg" color="gray.300">
                    Take a photo of this location to earn points!
                  </Text>
                  <ImageUploader onPhotoAnalyzed={handlePhotoSubmission} />
                </VStack>
              </Box>
            </VStack>
          ) : (
            <Box 
              bg="gray.800" 
              p={6} 
              borderRadius="xl"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
              textAlign="center"
            >
              <Text fontSize="lg">Loading next location...</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default PhotoGame; 