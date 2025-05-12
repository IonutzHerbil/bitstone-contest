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
} from '@chakra-ui/react';
import ImageUploader from './ImageUploader';

const PhotoGame = ({ gameData, onGameComplete }) => {
  const [score, setScore] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [completedLocations, setCompletedLocations] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const toast = useToast();

  const totalPoints = gameData.locations.reduce((sum, loc) => sum + loc.points, 0);

  useEffect(() => {
    if (gameStarted && !currentLocation) {
      selectNewLocation();
    }
  }, [gameStarted, currentLocation]);

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
      onGameComplete();
      return;
    }

    const randomLocation = remainingLocations[
      Math.floor(Math.random() * remainingLocations.length)
    ];
    setCurrentLocation(randomLocation);
  };

  const handlePhotoSubmission = async (imageAnalysis) => {
    if (!currentLocation) return;

    // Check if the AI's analysis contains keywords related to the location
    const locationMatches = currentLocation.keywords.some(keyword =>
      imageAnalysis.toLowerCase().includes(keyword.toLowerCase())
    );

    if (locationMatches) {
      const newScore = score + currentLocation.points;
      setScore(newScore);
      setCompletedLocations([...completedLocations, currentLocation.id]);
      
      toast({
        title: "Photo Verified!",
        description: `+${currentLocation.points} points! Great photo of ${currentLocation.name}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      selectNewLocation();
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
    setScore(0);
    setCompletedLocations([]);
    setGameStarted(true);
  };

  return (
    <VStack spacing={6} width="100%" align="stretch">
      <Box bg="gray.800" p={6} borderRadius="xl" boxShadow="0 0 20px rgba(0, 255, 255, 0.2)">
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
                value={(completedLocations.length / gameData.locations.length) * 100}
                width="100%"
                colorScheme="cyan"
                borderRadius="full"
              />
            </VStack>
          </GridItem>
          <GridItem>
            <VStack align="end">
              <Text color="gray.400">Total Available</Text>
              <Text color="purple.400">{totalPoints} pts</Text>
            </VStack>
          </GridItem>
        </Grid>
      </Box>

      {!gameStarted ? (
        <VStack spacing={4}>
          <Heading size="md" textAlign="center">
            {gameData.name}
          </Heading>
          <Text textAlign="center" color="gray.300">
            {gameData.description}
          </Text>
          <Badge colorScheme={
            gameData.difficulty.toLowerCase() === 'easy' ? 'green' :
            gameData.difficulty.toLowerCase() === 'medium' ? 'yellow' : 'red'
          }>
            {gameData.difficulty} Difficulty
          </Badge>
          <Button
            colorScheme="cyan"
            size="lg"
            onClick={startGame}
            _hover={{ transform: 'scale(1.05)' }}
            transition="all 0.2s"
          >
            Start Challenge
          </Button>
        </VStack>
      ) : currentLocation ? (
        <VStack spacing={4}>
          <Box bg="gray.800" p={6} borderRadius="xl" width="100%">
            <VStack align="start" spacing={3}>
              <Badge colorScheme="purple" fontSize="md" p={2}>
                Current Challenge
              </Badge>
              <Heading size="md">{currentLocation.name}</Heading>
              <Text color="gray.300">{currentLocation.description}</Text>
              <Badge colorScheme="green">
                {currentLocation.points} points available
              </Badge>
            </VStack>
          </Box>
          <ImageUploader onPhotoAnalyzed={handlePhotoSubmission} />
        </VStack>
      ) : (
        <Text>Loading next location...</Text>
      )}
    </VStack>
  );
};

export default PhotoGame; 