import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  Icon,
  Card,
  CardBody,
  Button,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { FaMapMarkedAlt } from 'react-icons/fa';
import LocationDisplay from './LocationDisplay';

const LocationCollection = () => {
  const [savedLocations, setSavedLocations] = useState([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  const handleDeleteLocation = (locationId) => {
    const updatedLocations = savedLocations.filter(loc => loc.id !== locationId);
    setSavedLocations(updatedLocations);
    localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
  };

  if (savedLocations.length === 0) {
    return (
      <Card bg="gray.800" variant="filled" p={6} borderRadius="xl">
        <CardBody>
          <VStack spacing={6} align="center" py={8}>
            <Icon as={FaMapMarkedAlt} w={12} h={12} color="cyan.400" />
            <Heading size="md" textAlign="center">Your Collection is Empty</Heading>
            <Text textAlign="center" color="gray.400">
              Upload images in the Explore tab to detect and save locations to your collection
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Box w="100%">
      <VStack spacing={6} align="stretch">
        <Heading 
          size="md" 
          color="cyan.400"
          mb={4}
        >
          My Locations
        </Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {savedLocations.map(location => (
            <LocationDisplay 
              key={location.id}
              location={location}
              onDelete={() => handleDeleteLocation(location.id)}
              showDeleteButton={true}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default LocationCollection; 