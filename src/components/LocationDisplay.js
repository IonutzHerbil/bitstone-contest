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
} from '@chakra-ui/react';
import { StarIcon, CheckIcon } from '@chakra-ui/icons';

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
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="gray.800"
    >
      <Image
        src={location.imageUrl}
        alt={location.name}
        objectFit="cover"
        w="100%"
        h="300px"
      />
      
      <VStack spacing={4} p={6} align="stretch">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Heading size="md">{location.name}</Heading>
          <Badge colorScheme={location.difficulty === 'easy' ? 'green' : location.difficulty === 'medium' ? 'yellow' : 'red'}>
            {location.difficulty}
          </Badge>
        </Box>
        
        <Text color="gray.400">{location.location}</Text>
        <Text>{location.description}</Text>

        {location.coordinates && (
          <Box
            as="iframe"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.coordinates.lon-0.01},${location.coordinates.lat-0.01},${location.coordinates.lon+0.01},${location.coordinates.lat+0.01}&layer=mapnik&marker=${location.coordinates.lat},${location.coordinates.lon}`}
            width="100%"
            height="300px"
            borderRadius="md"
            border="none"
          />
        )}

        {showSaveButton && !isSaved && (
          <Button
            leftIcon={<StarIcon />}
            colorScheme="purple"
            onClick={handleSave}
            isDisabled={isSaved}
          >
            Save to Collection
          </Button>
        )}
        
        {isSaved && (
          <Button
            leftIcon={<CheckIcon />}
            colorScheme="green"
            isDisabled
          >
            Saved to Collection
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default LocationDisplay; 