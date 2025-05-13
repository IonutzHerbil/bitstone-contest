import React, { useState, useEffect } from 'react';
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
  Spinner,
  useColorModeValue,
  HStack,
  IconButton,
  Button,
} from '@chakra-ui/react';
import { CloseIcon, RepeatIcon } from '@chakra-ui/icons';
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
    },
    keywords: ["church", "gothic", "saint", "michael", "tower", "catholic", "cathedral"]
  },
  {
    name: "Matthias Corvinus Statue",
    description: "Equestrian statue of King Matthias Corvinus, who was born in Cluj in 1443. The bronze monument depicts the king on horseback surrounded by military commanders. Designed by János Fadrusz, it was unveiled in 1902 in Union Square and remains one of the city's most iconic landmarks.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7695,
      lon: 23.5890
    },
    keywords: ["statue", "monument", "horse", "king", "matthias", "corvinus", "bronze", "square"]
  },
  {
    name: "Cluj-Napoca National Theatre",
    description: "Neo-baroque style theatre building completed in 1906, designed by famous Viennese architects Fellner and Helmer. The ornate facade features decorative elements and statues, while the interior boasts lavish decorations, including a ceiling painted by Károly Lotz and a large chandelier with 100 lights.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7699,
      lon: 23.5914
    },
    keywords: ["theatre", "theater", "national", "opera", "performance", "building", "baroque"]
  },
  {
    name: "Banffy Palace",
    description: "Baroque palace built between 1774-1785, designed by German architect Johann Eberhard Blaumann. It served as the residence of the Bánffy family and now houses the Art Museum. The facade features statues representing Mars, Minerva, Apollo, Diana, and other mythological figures, symbolizing virtues of the aristocracy.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7692,
      lon: 23.5901
    },
    keywords: ["palace", "museum", "art", "banffy", "baroque", "building", "historic"]
  }
];

// Helper function to analyze image metadata and make a better match
const analyzeImage = (file) => {
  return new Promise((resolve) => {
    // Extract file information for identification
    const fileName = file.name?.toLowerCase() || '';
    const fileSize = file.size || 0;
    
    // More varied detection algorithm
    // This uses multiple factors including timestamp to ensure different results
    
    // Get the current time components for more variety
    const now = new Date();
    const timeComponent = now.getSeconds() + now.getMilliseconds();
    
    // Calculate a hash-like value from the file details
    let hashValue = 0;
    for (let i = 0; i < Math.min(fileName.length, 5); i++) {
      hashValue += fileName.charCodeAt(i);
    }
    
    // Add file size and time component to make detection more varied
    hashValue += (fileSize % 1000) + timeComponent;
    
    // Determine landmark index with better variation
    const landmarkIndex = hashValue % MOCK_LANDMARKS.length;
    
    // For files with keywords in name, prioritize those matches
    for (let i = 0; i < MOCK_LANDMARKS.length; i++) {
      const landmark = MOCK_LANDMARKS[i];
      for (const keyword of landmark.keywords) {
        if (fileName.includes(keyword.toLowerCase())) {
          // Return this landmark
          return resolve(landmark);
        }
      }
    }
    
    // If no keyword match, use the varied index
    resolve(MOCK_LANDMARKS[landmarkIndex]);
  });
};

const LocationExplorer = () => {
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [cancelFn, setCancelFn] = useState(null);
  const [analysisError, setAnalysisError] = useState(false);
  const toast = useToast();
  
  // Reset all states if they get stuck
  useEffect(() => {
    // If we're in a loading state for more than 10 seconds, something is wrong
    let timeoutId;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        // Force reset
        setIsLoading(false);
        setProcessingProgress(0);
        setCancelFn(null);
        setAnalysisError(true);
        
        toast({
          title: 'Analysis timeout',
          description: 'The image processing took too long. Please try again.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }, 10000); // 10 second timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, toast]);
  
  // Handle cancellation of image processing
  const handleCancel = () => {
    if (cancelFn && typeof cancelFn === 'function') {
      cancelFn();
      setCancelFn(null);
    }
    
    // Force reset all loading states
    setIsLoading(false);
    setProcessingProgress(0);
    setAnalysisError(false);
    
    toast({
      title: 'Analysis cancelled',
      description: 'You can try uploading another image.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Force reset function for error cases
  const handleReset = () => {
    setIsLoading(false);
    setProcessingProgress(0);
    setCancelFn(null);
    setAnalysisError(false);
  };

  const handleImageUpload = async (locationData) => {
    // Reset all states
    setIsLoading(false);
    setProcessingProgress(0);
    setDetectedLocation(null); 
    setAnalysisError(false);
    
    // Enhance the location data with additional fields if needed
    const enhancedLocationData = {
      ...locationData,
      enhancedDescription: locationData.description,
      discoveredAt: new Date().toISOString(),
      difficulty: locationData.difficulty || 'medium',
    };
    
    // We received the complete location data from API
    // Just need to display it with the enhanced data
    setDetectedLocation(enhancedLocationData);
    
    toast({
      title: 'Location detected!',
      description: `Found: ${locationData.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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
                  {!isLoading && !analysisError && (
                    <ImageUploader 
                      onUpload={handleImageUpload} 
                      isLoading={isLoading}
                      processingProgress={processingProgress}
                    />
                  )}
                  
                  {isLoading && processingProgress > 0 && (
                    <Box 
                      textAlign="center" 
                      py={4} 
                      px={6} 
                      borderRadius="md" 
                      bg="rgba(0, 178, 255, 0.05)"
                      borderWidth="1px"
                      borderColor="rgba(0, 178, 255, 0.1)"
                    >
                      <VStack spacing={3}>
                        <HStack spacing={3} width="100%" justifyContent="center">
                          <Spinner 
                            size="md" 
                            color="accent.primary" 
                            thickness="3px"
                            speed="0.8s"
                          />
                          <Text color="whiteAlpha.800">
                            {processingProgress < 30 ? 'Analyzing image...' : 
                             processingProgress < 60 ? 'Identifying landmarks...' : 
                             processingProgress < 90 ? 'Retrieving information...' : 
                             'Finalizing results...'}
                          </Text>
                          <IconButton
                            icon={<CloseIcon />}
                            size="sm"
                            aria-label="Cancel analysis"
                            colorScheme="red"
                            variant="ghost"
                            onClick={handleCancel}
                          />
                        </HStack>
                      </VStack>
                    </Box>
                  )}
                  
                  {analysisError && (
                    <Box 
                      textAlign="center" 
                      py={4} 
                      px={6} 
                      borderRadius="md" 
                      bg="rgba(255, 50, 50, 0.05)"
                      borderWidth="1px"
                      borderColor="rgba(255, 50, 50, 0.2)"
                    >
                      <VStack spacing={4}>
                        <Text color="red.300">
                          There was a problem processing your image. Please try again.
                        </Text>
                        <Button
                          leftIcon={<RepeatIcon />}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          onClick={handleReset}
                        >
                          Try Again
                        </Button>
                      </VStack>
                    </Box>
                  )}
                  
                  {detectedLocation && !isLoading && (
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