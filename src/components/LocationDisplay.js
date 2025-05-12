import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  useToast,
  Badge,
  Image,
  Heading,
  HStack,
} from '@chakra-ui/react';
import { StarIcon, CheckIcon, InfoIcon } from '@chakra-ui/icons';

const LocationDisplay = ({ location, showSaveButton = false }) => {
  const [isSaved, setIsSaved] = useState(false);
  const toast = useToast();

  const handleSave = () => {
    try {
      const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
      if (savedLocations.some(loc => loc.id === location.id)) {
        toast({
          title: 'Already saved',
          status: 'info',
          duration: 2000,
        });
        return;
      }
      
      savedLocations.push(location);
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
      setIsSaved(true);
      
      toast({
        title: 'Location saved!',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error saving location',
        status: 'error',
        duration: 2000,
      });
    }
  };

  return (
    <Box
      w="100%"
      bg="gray.800"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="0 0 20px rgba(0, 255, 255, 0.1)"
      borderWidth="1px"
      borderColor="transparent"
      _hover={{
        boxShadow: "0 0 30px rgba(0, 255, 255, 0.2)",
      }}
      transition="all 0.3s"
    >
      <Box position="relative">
        <Image
          src={location.imageUrl}
          alt={location.name}
          objectFit="cover"
          w="100%"
          h="400px"
        />
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="rgba(0, 0, 0, 0.7)"
          p={4}
          backdropFilter="blur(10px)"
        >
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="white">
              {location.name}
            </Heading>
            <Badge 
              colorScheme={location.difficulty === 'easy' ? 'green' : location.difficulty === 'medium' ? 'yellow' : 'red'}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {location.difficulty}
            </Badge>
          </HStack>
        </Box>
      </Box>
      
      <VStack spacing={6} p={6} align="stretch">
        <Text color="cyan.400" fontSize="lg" fontWeight="medium">
          {location.location}
        </Text>
        
        <Box bg="gray.700" p={4} borderRadius="lg">
          <HStack spacing={3} mb={2}>
            <InfoIcon color="cyan.400" />
            <Text fontWeight="semibold">Description</Text>
          </HStack>
          <Text color="gray.300">
            {location.description}
          </Text>
        </Box>

        {location.coordinates && (
          <Box
            as="iframe"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.coordinates.lon-0.01},${location.coordinates.lat-0.01},${location.coordinates.lon+0.01},${location.coordinates.lat+0.01}&layer=mapnik&marker=${location.coordinates.lat},${location.coordinates.lon}`}
            width="100%"
            height="300px"
            borderRadius="lg"
            border="none"
            boxShadow="0 0 20px rgba(0, 0, 0, 0.2)"
          />
        )}

        {showSaveButton && !isSaved && (
          <Button
            leftIcon={<StarIcon />}
            colorScheme="cyan"
            size="lg"
            onClick={handleSave}
            isDisabled={isSaved}
            w="100%"
          >
            Save to Collection
          </Button>
        )}
        
        {isSaved && (
          <Button
            leftIcon={<CheckIcon />}
            colorScheme="green"
            size="lg"
            isDisabled
            w="100%"
          >
            Saved to Collection
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default LocationDisplay; 