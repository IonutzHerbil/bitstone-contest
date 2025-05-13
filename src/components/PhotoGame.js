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
  Spinner,
  HStack,
  Fade,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckCircleIcon, CloseIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import ImageUploader from './ImageUploader';
import { saveGameProgress } from '../utils/progressUtils';

const PhotoGame = ({ gameData, onGameComplete, onLogout }) => {
  const [score, setScore] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [completedLocations, setCompletedLocations] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [locationMatched, setLocationMatched] = useState(null);
  const [cancelAnalysis, setCancelAnalysis] = useState(null);
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

  const simulateProgress = () => {
    setProcessingProgress(0);
    setAnalysisStage('starting');
    
    // Create a progress simulation
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev < 30) {
          setAnalysisStage('analyzing');
          const increment = Math.random() * 5;
          return prev + increment;
        } else if (prev < 60) {
          setAnalysisStage('comparing');
          const increment = Math.random() * 5;
          return prev + increment;
        } else if (prev < 90) {
          setAnalysisStage('verifying');
          const increment = Math.random() * 3;
          return prev + increment;
        } else if (prev < 95) {
          setAnalysisStage('finalizing');
          const increment = Math.random() * 2;
          return prev + increment;
        }
        return 95;
      });
    }, 200);
    
    return progressInterval;
  };

  const handleCancelAnalysis = () => {
    if (cancelAnalysis && typeof cancelAnalysis === 'function') {
      cancelAnalysis();
      setCancelAnalysis(null);
      toast({
        title: "Analysis Cancelled",
        description: "You can take another photo now.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handlePhotoSubmissionWithCancel = async (imageAnalysis) => {
    // Clear any previous cancel function
    if (cancelAnalysis) {
      cancelAnalysis();
      setCancelAnalysis(null);
    }
    
    // Store the new cancel function
    const cancel = handlePhotoSubmission(imageAnalysis);
    setCancelAnalysis(() => cancel);
  };

  const handlePhotoSubmission = async (imageAnalysis) => {
    if (!currentLocation) return;
    
    // Clear any existing analysis state first
    setAnalyzingPhoto(false);
    setProcessingProgress(0);
    setAnalysisStage('');
    setLocationMatched(null);
    
    // Start fresh analysis
    setAnalyzingPhoto(true);
    const progressInterval = simulateProgress();
    
    // Keep track of whether this analysis was cancelled
    let isCancelled = false;

    // Deterministic location matching based on current location and analysis
    let locationMatches = false;
    
    try {
      // The imageAnalysis contains the detected landmark text
      const analysisText = imageAnalysis.toLowerCase();
      
      // Get keywords from the current location that must be matched
      const locationName = currentLocation.name.toLowerCase();
      
      // Check if the analysis text contains the location name
      locationMatches = analysisText.includes(locationName);
      
      // If the user is taking a photo of the right landmark,
      // their image analysis should contain the location name
      // This is a simple but effective check
      
    } catch (error) {
      console.error('Error in location matching:', error);
      // Default to not matched if there's an error
      locationMatches = false;
    }
    
    // Reduce the processing time to avoid stuck states (previously 3000ms)
    setTimeout(() => {
      // Check if this analysis was cancelled before proceeding
      if (isCancelled) return;
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setAnalysisStage('complete');
      
      setLocationMatched(locationMatches);
      
      // Reduce the final display time as well (previously 1000ms)
      setTimeout(() => {
        // Check again if cancelled
        if (isCancelled) return;
        
        if (locationMatches) {
          // Success! They found the location
          const newScore = score + currentLocation.points;
          const newCompletedLocations = [...completedLocations, currentLocation.id];
          setScore(newScore);
          setCompletedLocations(newCompletedLocations);
          
          // Save progress after each successful submission
          saveGameProgress(
            gameData.id,
            newCompletedLocations,
            newCompletedLocations.length === gameData.locations.length
          ).then(() => {
            // Dispatch update event
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
              // Reset for next location
              setAnalyzingPhoto(false);
              setProcessingProgress(0);
              setAnalysisStage('');
              setLocationMatched(null);
              selectNewLocation();
            }
          }).catch(error => {
            console.error('Error saving progress:', error);
            toast({
              title: "Error Saving Progress",
              description: "Your progress couldn't be saved, but you can continue playing.",
              status: "warning",
              duration: 5000,
              isClosable: true,
            });
            
            // Reset for next location
            setAnalyzingPhoto(false);
            setProcessingProgress(0);
            setAnalysisStage('');
            setLocationMatched(null);
            selectNewLocation();
          });
        } else {
          toast({
            title: "Not Quite Right",
            description: "The photo doesn't match the location. Try taking another photo!",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          
          // Reset state but keep the same location
          setAnalyzingPhoto(false);
          setProcessingProgress(0);
          setAnalysisStage('');
          setLocationMatched(null);
        }
      }, 500); // Faster feedback (reduced from 1000ms)
    }, 1500); // Faster processing (reduced from 3000ms)
    
    // Return a cancel function that components can use
    return () => {
      isCancelled = true;
      clearInterval(progressInterval);
      setAnalyzingPhoto(false);
      setProcessingProgress(0);
      setAnalysisStage('');
      setLocationMatched(null);
    };
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

  const renderAnalysisStage = () => {
    const stages = {
      'starting': 'Initializing analysis...',
      'analyzing': 'Analyzing image features...',
      'comparing': 'Comparing with landmark database...',
      'verifying': 'Verifying location match...',
      'finalizing': 'Finalizing results...',
      'complete': locationMatched ? 'Location verified!' : 'Verification failed'
    };
    
    return stages[analysisStage] || 'Processing...';
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8} display="flex" alignItems="center">
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          onClick={handleBackToGames}
          colorScheme="cyan"
        >
          Back to Games
        </Button>
      </Box>

      {!gameStarted ? (
        <VStack spacing={8} align="center" justify="center" py={16}>
          <VStack spacing={4} textAlign="center" maxW="700px">
            <Heading 
              bgGradient="linear(to-r, cyan.400, purple.500)"
              bgClip="text"
              size="xl"
            >
              {gameData.name}
            </Heading>
            <Text fontSize="lg" color="gray.300">
              {gameData.description}
            </Text>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
              {gameData.difficulty}
            </Badge>
          </VStack>

          <Button
            colorScheme="cyan"
            size="lg"
            onClick={startGame}
            width="200px"
          >
            Start Game
          </Button>

          {completedLocations.length > 0 && (
            <Box
              mt={8}
              p={6}
              bg="gray.800"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="cyan.800"
              width="100%"
              maxW="500px"
            >
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="cyan.300">Your Progress</Heading>
                <Text>
                  You've discovered {completedLocations.length} of {gameData.locations.length} locations
                </Text>
                <Progress
                  value={(completedLocations.length / gameData.locations.length) * 100}
                  size="sm"
                  colorScheme="cyan"
                  borderRadius="full"
                />
                <Text color="purple.300">
                  Current Score: {score} points
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      ) : (
        <VStack spacing={8} align="stretch">
          <Box>
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
                  <Text color="purple.400">{totalPoints} pts</Text>
                </VStack>
              </GridItem>
            </Grid>
          </Box>

          {currentLocation && (
            <Box
              bg="gray.800"
              p={6}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="cyan.900"
            >
              <VStack spacing={6} align="stretch">
                <Box>
                  <Text color="gray.400" fontSize="sm">FIND THIS LOCATION</Text>
                  <Heading size="lg" color="white" mb={2}>
                    {currentLocation.name}
                  </Heading>
                  <Text color="gray.300">
                    {currentLocation.description}
                  </Text>
                </Box>
                
                <Box
                  bg="rgba(0, 178, 255, 0.05)"
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="rgba(0, 178, 255, 0.2)"
                >
                  <Text color="cyan.300" fontWeight="bold" mb={1}>
                    Worth {currentLocation.points} points
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Take a photo of this location to earn points
                  </Text>
                </Box>

                {analyzingPhoto ? (
                  <Box>
                    <VStack spacing={4} align="center" py={6}>
                      <Progress
                        value={processingProgress}
                        width="100%"
                        size="sm"
                        colorScheme="purple"
                        hasStripe
                        isAnimated
                      />
                      
                      <HStack spacing={3}>
                        {analysisStage !== 'complete' ? (
                          <Spinner size="sm" color="cyan.400" />
                        ) : (
                          <CheckCircleIcon color="green.400" />
                        )}
                        <Text color="gray.300">{renderAnalysisStage()}</Text>
                        
                        <IconButton
                          icon={<CloseIcon />}
                          size="sm"
                          aria-label="Cancel analysis"
                          colorScheme="red"
                          variant="ghost"
                          onClick={handleCancelAnalysis}
                          ml={2}
                          isDisabled={analysisStage === 'complete'}
                        />
                      </HStack>
                    </VStack>
                  </Box>
                ) : (
                  <Box py={4}>
                    <ImageUploader
                      onPhotoAnalyzed={handlePhotoSubmissionWithCancel}
                    />
                  </Box>
                )}
              </VStack>
            </Box>
          )}
        </VStack>
      )}
    </Container>
  );
};

export default PhotoGame; 