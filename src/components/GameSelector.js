import React from 'react';
import {
  SimpleGrid,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';

const GameSelector = ({ games, onSelectGame, completedGames }) => {
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

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} width="100%">
      {games.map((game) => {
        const isCompleted = completedGames.includes(game.id);
        const totalPoints = game.locations.reduce((sum, loc) => sum + loc.points, 0);

        return (
          <Box
            key={game.id}
            bg="gray.800"
            p={6}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={isCompleted ? "purple.500" : "transparent"}
            boxShadow={isCompleted ? "0 0 20px rgba(128, 90, 213, 0.3)" : "0 0 20px rgba(0, 255, 255, 0.2)"}
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
                <Text color="gray.300" fontSize="sm">
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
              </Box>

              <Box>
                <Text color="gray.400" fontSize="sm">
                  Locations: {game.locations.length}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Total Points: {totalPoints}
                </Text>
              </Box>

              <Button
                colorScheme={isCompleted ? "purple" : "cyan"}
                onClick={() => onSelectGame(game)}
                rightIcon={isCompleted ? <StarIcon /> : null}
              >
                {isCompleted ? "Play Again" : "Start Game"}
              </Button>
            </VStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};

export default GameSelector; 