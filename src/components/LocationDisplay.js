import React, { useState, useEffect } from 'react';
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
  Alert,
  AlertIcon,
  Flex,
  Icon,
  Grid,
  GridItem,
  Divider,
} from '@chakra-ui/react';
import { StarIcon, CheckIcon, InfoIcon, LockIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { FaMapMarkerAlt, FaBookmark, FaInfoCircle, FaImage } from 'react-icons/fa';
import config from '../config';

const LocationDisplay = ({ location, showSaveButton = false }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const isLoggedIn = !!localStorage.getItem('token');

  // Check if the location is already saved when the component mounts
  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Check server if logged in
          const response = await fetch(`${config.apiBaseUrl}/api/auth/locations`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            const locationExists = data.locations.some(loc => loc.id === location.id);
            setIsSaved(locationExists);
          }
        } else {
          // Check localStorage if not logged in
          const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
          const locationExists = savedLocations.some(loc => loc.id === location.id);
          setIsSaved(locationExists);
        }
      } catch (err) {
        console.error('Error checking if location is saved:', err);
      }
    };

    if (showSaveButton && location) {
      checkIfSaved();
    }
  }, [location, showSaveButton]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Save to server if logged in
        const response = await fetch(`${config.apiBaseUrl}/api/auth/locations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ location }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save location to your collection');
        }
        
        await response.json();
      } else {
        // Fall back to localStorage if not logged in
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
      }
      
      setIsSaved(true);
      
      toast({
        title: 'Location saved!',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      console.error('Error saving location:', err);
      setError(err.message || 'Failed to save location');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save location',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      w="100%"
      bg="gray.800"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
      borderWidth="1px"
      borderColor="gray.700"
      position="relative"
    >
      {/* Location Header with Image */}
      <Box position="relative">
        <Image
          src={location.imageUrl}
          alt={location.name}
          objectFit="cover"
          w="100%"
          h="400px"
          style={{ filter: 'brightness(0.85)' }}
        />
        
        {/* Badge overlay */}
        <HStack
          position="absolute"
          top={4}
          right={4}
          spacing={2}
        >
          <Badge 
            colorScheme={location.difficulty === 'easy' ? 'green' : location.difficulty === 'medium' ? 'yellow' : 'red'}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            bgGradient={
              location.difficulty === 'easy' 
                ? "linear(to-r, green.500, teal.500)" 
                : location.difficulty === 'medium' 
                  ? "linear(to-r, yellow.500, orange.500)" 
                  : "linear(to-r, red.500, pink.500)"
            }
            boxShadow="0 4px 8px rgba(0, 0, 0, 0.3)"
            textTransform="capitalize"
          >
            {location.difficulty} Difficulty
          </Badge>
        </HStack>
        
        {/* Title overlay with gradient */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.3), transparent)"
          p={6}
          pt={20}
        >
          <VStack align="flex-start" spacing={2}>
            <Heading 
              size="lg" 
              color="white"
              textShadow="0 2px 4px rgba(0,0,0,0.5)"
            >
              {location.name}
            </Heading>
            <HStack spacing={3}>
              <Icon as={FaMapMarkerAlt} color="cyan.300" />
              <Text 
                color="cyan.300" 
                fontWeight="medium"
                fontSize="md"
              >
                {location.location}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </Box>
      
      <VStack spacing={6} p={6} align="stretch">
        {/* Description section */}
        <Box 
          bg="gray.700" 
          p={5} 
          borderRadius="lg"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
          borderWidth="1px"
          borderColor="gray.600"
        >
          <HStack spacing={3} mb={3} align="center">
            <Icon as={FaInfoCircle} color="cyan.400" boxSize={5} />
            <Heading size="sm" color="white">About this Location</Heading>
          </HStack>
          <Text color="gray.300" fontSize="md" lineHeight="tall">
            {location.description}
          </Text>
        </Box>

        {/* Map section */}
        {location.coordinates && (
          <Box
            borderRadius="lg"
            overflow="hidden"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
            borderWidth="1px"
            borderColor="gray.600"
            position="relative"
          >
            <Box
              as="iframe"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.coordinates.lon-0.01},${location.coordinates.lat-0.01},${location.coordinates.lon+0.01},${location.coordinates.lat+0.01}&layer=mapnik&marker=${location.coordinates.lat},${location.coordinates.lon}`}
              width="100%"
              height="300px"
              borderRadius="lg"
              border="none"
            />
            <Box
              position="absolute"
              top={3}
              left={3}
              bg="gray.800"
              borderRadius="md"
              px={3}
              py={1}
              fontSize="sm"
              fontWeight="medium"
              color="cyan.300"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
              display="flex"
              alignItems="center"
            >
              <Icon as={FaMapMarkerAlt} mr={2} />
              <Text>Interactive Map</Text>
            </Box>
          </Box>
        )}

        {/* Error alert */}
        {error && (
          <Alert status="error" borderRadius="lg" variant="left-accent">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Save button section */}
        <Grid templateColumns="1fr" gap={4}>
          {showSaveButton && !isSaved && !isLoggedIn && (
            <VStack spacing={3}>
              <Button
                leftIcon={<FaBookmark />}
                colorScheme="cyan"
                size="lg"
                onClick={handleSave}
                isLoading={isLoading}
                loadingText="Saving..."
                w="100%"
                bgGradient="linear(to-r, cyan.500, blue.500)"
                _hover={{
                  bgGradient: "linear(to-r, cyan.400, blue.400)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 20px rgba(0, 255, 255, 0.15)"
                }}
                py={6}
              >
                Save to Local Collection
              </Button>
              <Alert status="warning" borderRadius="lg" size="sm" variant="left-accent">
                <AlertIcon />
                <HStack fontSize="sm">
                  <LockIcon />
                  <Text>Log in to save permanently to your account</Text>
                </HStack>
              </Alert>
            </VStack>
          )}

          {showSaveButton && !isSaved && isLoggedIn && (
            <Button
              leftIcon={<FaBookmark />}
              colorScheme="cyan"
              size="lg"
              onClick={handleSave}
              isLoading={isLoading}
              loadingText="Saving..."
              w="100%"
              bgGradient="linear(to-r, cyan.500, blue.500)"
              _hover={{
                bgGradient: "linear(to-r, cyan.400, blue.400)",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0, 255, 255, 0.15)"
              }}
              py={6}
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
              bgGradient="linear(to-r, green.500, teal.500)"
              py={6}
            >
              Saved to Collection
            </Button>
          )}
          
          {location.coordinates && (
            <Button
              leftIcon={<ExternalLinkIcon />}
              colorScheme="purple"
              variant="outline"
              size="md"
              as="a"
              href={`https://www.openstreetmap.org/?mlat=${location.coordinates.lat}&mlon=${location.coordinates.lon}&zoom=16`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on OpenStreetMap
            </Button>
          )}
        </Grid>
      </VStack>
    </Box>
  );
};

export default LocationDisplay; 