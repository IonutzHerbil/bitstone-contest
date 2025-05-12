import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, Badge } from '@chakra-ui/react';

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
    <Box p={4} borderRadius="md" bg="gray.50" width="100%">
      <VStack align="start" spacing={2}>
        <Text fontWeight="bold">Your Current Location:</Text>
        {location ? (
          <>
            <Badge colorScheme="green">Location Access Granted</Badge>
            <Text>Latitude: {location.latitude.toFixed(6)}</Text>
            <Text>Longitude: {location.longitude.toFixed(6)}</Text>
          </>
        ) : error ? (
          <Badge colorScheme="red">{error}</Badge>
        ) : (
          <Text>Loading location...</Text>
        )}
      </VStack>
    </Box>
  );
};

export default LocationDisplay; 