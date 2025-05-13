import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SimpleGrid,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Badge,
  useColorModeValue,
  Flex,
  Spacer,
  Progress,
  Grid,
  GridItem,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { StarIcon, TimeIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { saveGameProgress } from '../utils/progressUtils';

const GameSelector = ({ games, completedGames, onLogout, onSelectGame, isCompact = false }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
  const refreshUserData = () => {
    const data = JSON.parse(localStorage.getItem('user'));
    if (data) {
      setUserData({...data}); // Force a re-render by creating a new object
    }
  };

  useEffect(() => {
    refreshUserData(); // Initial load

    // Update userData when localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        refreshUserData();
      }
    };

    // Handle custom update event
    const handleCustomUpdate = () => {
      refreshUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataUpdate', handleCustomUpdate);

    // Refresh data when component mounts or games prop changes
    const interval = setInterval(refreshUserData, 1000); // Polling fallback

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdate', handleCustomUpdate);
      clearInterval(interval);
    };
  }, [games]); // Add games as dependency to refresh when it changes

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'hard':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getGameProgress = (gameId) => {
    if (!userData?.gameProgress) return { completedLocations: [], completed: false };
    const progress = userData.gameProgress.find(g => g.gameId === gameId);
    if (!progress) return { completedLocations: [], completed: false };
    return {
      ...progress,
      completedLocations: progress.completedLocations || []
    };
  };

  const calculateScore = (game, progress) => {
    if (!progress?.completedLocations) return 0;
    return game.locations
      .filter(loc => progress.completedLocations.some(pl => pl.locationId === loc.id))
      .reduce((sum, loc) => sum + loc.points, 0);
  };

  const handleGameSelect = (game) => {
    if (onSelectGame) {
      onSelectGame(game);
    } else {
      navigate(`/game/${game.id}`);
    }
  };

  const handleLogout = async () => {
    try {
      if (!onLogout) return;
      
      // Save progress for all in-progress games before logging out
      const savePromises = games.map(game => {
        const progress = getGameProgress(game.id);
        if (progress?.completedLocations?.length > 0) {
          return saveGameProgress(
            game.id,
            progress.completedLocations.map(loc => loc.locationId),
            progress.completed || progress.completedLocations.length === game.locations.length
          );
        }
        return Promise.resolve();
      });

      await Promise.all(savePromises);
      await onLogout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Still logout even if saving fails
      if (onLogout) await onLogout();
    }
  };

  if (!userData) {
    return null; // or some loading state
  }

  return (
    <Box p={isCompact ? 0 : 6}>
      {!isCompact && (
        <Flex mb={8} align="center">
          <VStack align="start" spacing={1}>
            <Heading 
              bgGradient="linear(to-r, cyan.400, purple.500)"
              bgClip="text"
              fontSize={["xl", "2xl"]}
            >
              Welcome, {userData.username}!
            </Heading>
            <Text color="gray.500">
              Completed Games: {completedGames.length} / {games.length}
            </Text>
          </VStack>
          <Spacer />
          {onLogout && (
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </Flex>
      )}

      <SimpleGrid 
        columns={isCompact ? { base: 1, md: 2, lg: 4 } : { base: 1, md: 2, lg: 3 }} 
        spacing={isCompact ? 4 : 6} 
        width="100%"
      >
        {games.map((game) => {
          const progress = getGameProgress(game.id);
          const isCompleted = Boolean(progress?.completed);
          const totalPoints = game.locations.reduce((sum, loc) => sum + loc.points, 0);
          const currentScore = calculateScore(game, progress);
          const completedLocationsCount = progress?.completedLocations?.length || 0;
          
          return isCompact ? (
            // Compact card for homepage
            <Box
              key={game.id}
              bg="gray.800"
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={isCompleted ? "purple.500" : completedLocationsCount > 0 ? "cyan.500" : "transparent"}
              boxShadow={
                isCompleted 
                  ? "0 0 15px rgba(128, 90, 213, 0.2)" 
                  : completedLocationsCount > 0 
                    ? "0 0 15px rgba(0, 255, 255, 0.2)"
                    : "0 0 10px rgba(0, 0, 0, 0.2)"
              }
              transition="all 0.2s"
              _hover={{
                transform: 'translateY(-3px)',
                boxShadow: isCompleted 
                  ? "0 0 20px rgba(159, 122, 234, 0.3)"
                  : "0 0 20px rgba(0, 255, 255, 0.25)",
                cursor: 'pointer'
              }}
              onClick={() => handleGameSelect(game)}
              position="relative"
              overflow="hidden"
            >
              <Flex direction="column" h="100%">
                <HStack justify="space-between" mb={2}>
                  <Badge 
                    colorScheme={getDifficultyColor(game.difficulty)}
                    px={2}
                    py={0.5}
                    fontSize="xs"
                  >
                    {game.difficulty}
                  </Badge>
                  {isCompleted && (
                    <Badge colorScheme="purple" fontSize="xs" px={2} py={0.5}>
                      COMPLETED
                    </Badge>
                  )}
                </HStack>
                
                <Heading 
                  size="sm" 
                  color={isCompleted ? "purple.400" : "cyan.400"}
                  mb={1}
                  noOfLines={1}
                >
                  {game.name}
                </Heading>
                
                <Text 
                  color="gray.300" 
                  fontSize="xs" 
                  noOfLines={1}
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  mb={2}
                  flex="1"
                >
                  {game.description}
                </Text>
                
                <Progress
                  value={(completedLocationsCount / game.locations.length) * 100}
                  size="xs"
                  colorScheme={isCompleted ? "purple" : "cyan"}
                  borderRadius="full"
                  mb={2}
                />
                
                <HStack justify="space-between" fontSize="xs" color="gray.400">
                  <Text>{completedLocationsCount}/{game.locations.length}</Text>
                  <Text>{currentScore}/{totalPoints} pts</Text>
                </HStack>
                
                <Icon 
                  as={ChevronRightIcon} 
                  position="absolute"
                  right={2}
                  bottom={2}
                  color={isCompleted ? "purple.400" : "cyan.400"}
                />
                
                {isCompleted && (
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    bg="linear-gradient(to right, rgba(159, 122, 234, 0.7), rgba(236, 72, 153, 0.7))"
                    color="white"
                    fontSize="xs"
                    py={1}
                    px={2}
                    borderTopRightRadius="md"
                    fontWeight="medium"
                  >
                    Play Again
                  </Box>
                )}
              </Flex>
            </Box>
          ) : (
            // Full-sized card for game selection page
            <Box
              key={game.id}
              bg="gray.800"
              p={6}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={isCompleted ? "purple.500" : completedLocationsCount > 0 ? "cyan.500" : "transparent"}
              boxShadow={
                isCompleted 
                  ? "0 0 20px rgba(128, 90, 213, 0.3)" 
                  : completedLocationsCount > 0 
                    ? "0 0 20px rgba(0, 255, 255, 0.3)"
                    : "0 0 20px rgba(0, 255, 255, 0.2)"
              }
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-5px)',
                boxShadow: isCompleted 
                  ? "0 0 30px rgba(128, 90, 213, 0.4)"
                  : "0 0 30px rgba(0, 255, 255, 0.3)",
              }}
            >
              <VStack spacing={4} align="stretch">
                <VStack align="stretch" spacing={2}>
                  <Heading size="md" color={isCompleted ? "purple.400" : "cyan.400"}>
                    {game.name}
                  </Heading>
                  <Text 
                    color="gray.300" 
                    fontSize="sm"
                    noOfLines={1}
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    overflow="hidden"
                  >
                    {game.description}
                  </Text>
                </VStack>

                <Box>
                  <Badge 
                    colorScheme={getDifficultyColor(game.difficulty)}
                    px={2}
                    py={1}
                  >
                    {game.difficulty}
                  </Badge>
                  {isCompleted && (
                    <Badge 
                      colorScheme="purple" 
                      ml={2}
                      px={2}
                      py={1}
                    >
                      Completed
                    </Badge>
                  )}
                  {completedLocationsCount > 0 && !isCompleted && (
                    <Badge 
                      colorScheme="cyan" 
                      ml={2}
                      px={2}
                      py={1}
                      fontSize="sm"
                      display="inline-flex"
                      alignItems="center"
                    >
                      <TimeIcon mr={1} /> IN PROGRESS
                    </Badge>
                  )}
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm">
                    Progress: {completedLocationsCount} / {game.locations.length} Locations
                  </Text>
                  <Progress
                    value={(completedLocationsCount / game.locations.length) * 100}
                    size="sm"
                    colorScheme={isCompleted ? "purple" : "cyan"}
                    borderRadius="full"
                    mt={2}
                  />
                  <Text color="gray.400" fontSize="sm" mt={2}>
                    Score: {currentScore} / {totalPoints} pts
                  </Text>
                </Box>

                <Button
                  colorScheme={isCompleted ? "purple" : "cyan"}
                  onClick={() => handleGameSelect(game)}
                  rightIcon={isCompleted ? <StarIcon /> : completedLocationsCount > 0 ? <TimeIcon /> : null}
                  bgGradient={isCompleted ? "linear(to-r, purple.500, pink.500)" : completedLocationsCount > 0 ? "linear(to-r, cyan.500, teal.500)" : "linear(to-r, cyan.500, blue.500)"}
                  _hover={{
                    bgGradient: isCompleted ? "linear(to-r, purple.400, pink.400)" : completedLocationsCount > 0 ? "linear(to-r, cyan.400, teal.400)" : "linear(to-r, cyan.400, blue.400)",
                    transform: 'translateY(-2px)',
                    boxShadow: isCompleted ? '0 4px 12px rgba(159, 122, 234, 0.3)' : '0 4px 12px rgba(0, 255, 255, 0.3)'
                  }}
                >
                  {isCompleted 
                    ? "Play Again" 
                    : completedLocationsCount > 0 
                      ? "Continue Game" 
                      : "Start Game"
                  }
                </Button>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
      {isCompact && games.length > 4 && (
        <Button
          variant="ghost"
          colorScheme="cyan"
          size="sm"
          rightIcon={<ChevronRightIcon />}
          mt={4}
          onClick={() => navigate('/game')}
          alignSelf="flex-end"
        >
          View All Games
        </Button>
      )}
    </Box>
  );
};

export default GameSelector; 