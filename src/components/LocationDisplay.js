import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, Badge, Flex, Icon } from '@chakra-ui/react';
import { MdLocationOn } from 'react-icons/md';

const LocationDisplay = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError("Error getting location: " + error.message);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  return (
    <Box 
      p={6} 
      borderRadius="xl" 
      bg="gray.800" 
      width="100%"
      boxShadow="0 0 20px rgba(0, 255, 255, 0.2)"
    >
      <VStack align="start" spacing={3}>
        <Flex align="center" gap={2}>
          <Icon as={MdLocationOn} w={6} h={6} color="cyan.400" />
          <Text fontWeight="bold" fontSize="lg">Your Current Location</Text>
        </Flex>
        {location ? (
          <>
            <Badge colorScheme="cyan" px={3} py={1} borderRadius="full">
              Location Access Granted
            </Badge>
            <Box>
              <Text color="gray.300">Latitude: <Text as="span" color="white" fontWeight="semibold">{location.latitude.toFixed(6)}</Text></Text>
              <Text color="gray.300">Longitude: <Text as="span" color="white" fontWeight="semibold">{location.longitude.toFixed(6)}</Text></Text>
            </Box>
          </>
        ) : error ? (
          <Badge colorScheme="red" px={3} py={1} borderRadius="full">
            {error}
          </Badge>
        ) : (
          <Text color="gray.400">Loading location...</Text>
        )}
      </VStack>
    </Box>
  );
};

export default LocationDisplay; 