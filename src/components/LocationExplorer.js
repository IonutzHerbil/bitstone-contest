import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
  Grid,
  useColorModeValue,
} from '@chakra-ui/react';
import ImageUploader from './ImageUploader';
import LocationDisplay from './LocationDisplay';
import LocationCollection from './LocationCollection';
import config from '../config';

// Mock landmark data for client-side detection
const MOCK_LANDMARKS = [
  {
    name: "Saint Michael's Church",
    description: "Gothic-style Roman Catholic church in the heart of Cluj-Napoca. Built primarily in the 14th-15th centuries, it's the second largest church in Transylvania. The church features a 76-meter-tall tower, intricate stone carvings, and houses numerous valuable artifacts including Gothic altars and Renaissance furnishings.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7694,
      lon: 23.5894
    }
  },
  {
    name: "Matthias Corvinus Statue",
    description: "Equestrian statue of King Matthias Corvinus, who was born in Cluj in 1443. The bronze monument depicts the king on horseback surrounded by military commanders. Designed by János Fadrusz, it was unveiled in 1902 in Union Square and remains one of the city's most iconic landmarks.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7695,
      lon: 23.5890
    }
  },
  {
    name: "Cluj-Napoca National Theatre",
    description: "Neo-baroque style theatre building completed in 1906, designed by famous Viennese architects Fellner and Helmer. The ornate facade features decorative elements and statues, while the interior boasts lavish decorations, including a ceiling painted by Károly Lotz and a large chandelier with 100 lights.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7699,
      lon: 23.5914
    }
  },
  {
    name: "Banffy Palace",
    description: "Baroque palace built between 1774-1785, designed by German architect Johann Eberhard Blaumann. It served as the residence of the Bánffy family and now houses the Art Museum. The facade features statues representing Mars, Minerva, Apollo, Diana, and other mythological figures, symbolizing virtues of the aristocracy.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7692,
      lon: 23.5901
    }
  }
];

const LocationExplorer = () => {
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleImageUpload = async (file) => {
    setIsLoading(true);
    try {
      // Client-side mock detection without a server
      // In a real app, this would send the image to a server for AI analysis
      
      // Convert the file to base64 for preview
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // Get a random landmark from our mock data
        const randomIndex = Math.floor(Math.random() * MOCK_LANDMARKS.length);
        const landmark = MOCK_LANDMARKS[randomIndex];
        
        // Generate a unique ID
        const locationId = Math.random().toString(36).substring(2, 11);
        
        // Create location data that matches the API response format
        const locationData = {
          id: locationId,
          name: landmark.name,
          description: landmark.description,
          location: landmark.location,
          coordinates: landmark.coordinates,
          imageUrl: reader.result,
          difficulty: 'medium',
        };

        // Set the detected location with a small delay to simulate network request
        setTimeout(() => {
          setDetectedLocation(locationData);
          setIsLoading(false);
          
          toast({
            title: 'Location detected!',
            description: `Found: ${landmark.name}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }, 1500);
      };
      
      // Read the image file as data URL
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to detect location. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" mb={6}>
          <Heading 
            size="xl"
            mb={4}
            bgGradient="linear(to-r, accent.primary, accent.secondary)"
            bgClip="text"
            fontWeight="bold"
            letterSpacing="tight"
          >
            Location Explorer
          </Heading>
          <Text fontSize="lg" color="whiteAlpha.800">
            Upload a photo of any landmark to discover its location and learn more about it
          </Text>
        </Box>

        <Box
          bg="background.secondary"
          borderRadius="xl"
          p={6}
          boxShadow="0 0 20px rgba(0, 178, 255, 0.1)"
          borderWidth="1px"
          borderColor="rgba(0, 178, 255, 0.1)"
          _hover={{
            boxShadow: "0 0 30px rgba(0, 178, 255, 0.2)",
          }}
          transition="all 0.3s"
        >
          <Tabs 
            isFitted 
            variant="enclosed" 
            colorScheme="cyan"
            borderRadius="xl"
            overflow="hidden"
          >
            <TabList mb={4}>
              <Tab 
                _selected={{ 
                  color: 'white',
                  bg: 'accent.primary',
                  borderColor: 'accent.primary',
                }}
                borderRadius="lg"
                mx={1}
              >
                Explore
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'white',
                  bg: 'accent.secondary',
                  borderColor: 'accent.secondary',
                }}
                borderRadius="lg"
                mx={1}
              >
                My Collection
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={8}>
                  <ImageUploader 
                    onUpload={handleImageUpload} 
                    isLoading={isLoading}
                  />
                  {detectedLocation && (
                    <LocationDisplay 
                      location={detectedLocation}
                      showSaveButton={true}
                    />
                  )}
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <LocationCollection />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Container>
  );
};

export default LocationExplorer; 