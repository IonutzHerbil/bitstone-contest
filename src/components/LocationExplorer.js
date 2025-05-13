import React, { useState, useEffect, useRef } from 'react';
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
  Flex,
  Icon,
  Badge,
  useColorModeValue,
  HStack,
  Grid,
  GridItem,
  Image,
  Divider,
} from '@chakra-ui/react';
import { RepeatIcon, SearchIcon } from '@chakra-ui/icons';
import { FaMapMarked, FaCompass, FaImage, FaPhotoVideo, FaBookmark } from 'react-icons/fa';
import ImageUploader from './ImageUploader';
import LocationDisplay from './LocationDisplay';
import LocationCollection from './LocationCollection';
import config from '../config';

const LocationExplorer = () => {
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const initialRender = useRef(true);
  const toast = useToast();

  // Effect to handle tab change
  useEffect(() => {
    // Skip the initial render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    // If switching to My Collection tab (index 1)
    if (selectedTab === 1) {
      // Update the refresh key to force a re-render of the collection component
      setRefreshKey(prevKey => prevKey + 1);
      
      toast({
        title: 'Collection refreshed',
        status: 'info',
        duration: 1500,
        isClosable: true,
      });
    }
  }, [selectedTab, toast]);

  const handleImageUpload = async (file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // First test if the vision API is working correctly
      const testResponse = await fetch(`${config.apiBaseUrl}/api/test-vision`, {
        method: 'POST',
        body: formData,
      });
      
      if (!testResponse.ok) {
        const testErrorData = await testResponse.json();
        console.error('Vision API test failed:', testErrorData);
      } else {
        const testData = await testResponse.json();
        console.log('Vision API test result:', testData);
        
        if (testData.status !== 'success') {
          toast({
            title: 'Vision API Warning',
            description: 'There might be issues with image recognition. We\'ll still try to process your image.',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
        }
      }

      // Proceed with the actual location detection
      const response = await fetch(`${config.apiBaseUrl}/api/detect-location`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to detect location');
      }

      const data = await response.json();
      
      // Validate the response
      if (!data.name || !data.location || !data.description) {
        console.warn('Incomplete location data received:', data);
        // Add missing fields if needed
        if (!data.name) data.name = "Unidentified Location";
        if (!data.description) data.description = "No description available for this location.";
        if (!data.location) data.location = "Unknown";
      }
      
      setDetectedLocation(data);
      
      toast({
        title: 'Location detected!',
        description: `Found: ${data.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to detect location. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bgGradient="linear(to-r, gray.900, purple.900, cyan.900, gray.900)"
        backgroundSize="200% 200%"
        animation="gradient 15s ease infinite"
        py={12}
        px={8}
        borderRadius="xl"
        mb={8}
        boxShadow="0 10px 30px rgba(0, 0, 0, 0.5)"
        overflow="hidden"
        position="relative"
      >
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8} position="relative" zIndex={2}>
          <GridItem>
            <VStack align="flex-start" spacing={6}>
              <HStack>
                <Icon as={FaCompass} w={8} h={8} color="cyan.400" />
                <Heading 
                  size="xl"
                  bgGradient="linear(to-r, cyan.400, purple.500)"
                  bgClip="text"
                  fontWeight="extrabold"
                >
                  Location Explorer
                </Heading>
              </HStack>
              <Text fontSize="lg" color="gray.300" lineHeight="tall">
                Discover the world around you through your camera. Upload a photo of any landmark or interesting place to instantly identify it and learn more about its history and significance.
              </Text>
              <HStack spacing={4}>
                <Badge 
                  px={3} 
                  py={1} 
                  colorScheme="purple" 
                  borderRadius="full" 
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FaMapMarked} mr={1} />
                  Landmarks
                </Badge>
                <Badge 
                  px={3} 
                  py={1} 
                  colorScheme="cyan" 
                  borderRadius="full" 
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FaPhotoVideo} mr={1} />
                  Photo Recognition
                </Badge>
                <Badge 
                  px={3} 
                  py={1} 
                  colorScheme="green" 
                  borderRadius="full" 
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FaBookmark} mr={1} />
                  Save & Share
                </Badge>
              </HStack>
            </VStack>
          </GridItem>
          <GridItem display={{ base: "none", md: "flex" }} justifyContent="center" alignItems="center">
            <Box 
              bg="rgba(0, 0, 0, 0.3)" 
              p={4} 
              borderRadius="xl" 
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.2)"
              position="relative"
              _after={{
                content: '""',
                position: 'absolute',
                top: '15px',
                left: '15px',
                right: '15px',
                bottom: '15px',
                border: '2px dashed rgba(0, 255, 255, 0.2)',
                borderRadius: 'lg',
                zIndex: 0
              }}
            >
              <Image 
                src="https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80"
                alt="Exploring landmarks" 
                borderRadius="lg"
                maxH="280px"
                w="100%"
                objectFit="cover"
                boxShadow="0 8px 16px rgba(0, 0, 0, 0.3)"
                fallbackSrc="https://via.placeholder.com/400x250?text=Exploring+Cluj+Landmarks"
              />
            </Box>
          </GridItem>
        </Grid>
        
        {/* Abstract elements */}
        <Box 
          position="absolute" 
          w="300px" 
          h="300px" 
          bg="rgba(0, 255, 255, 0.03)" 
          filter="blur(40px)" 
          borderRadius="full" 
          top="-50px" 
          right="-50px" 
          zIndex={1}
        />
        <Box 
          position="absolute" 
          w="200px" 
          h="200px" 
          bg="rgba(159, 122, 234, 0.07)" 
          filter="blur(40px)" 
          borderRadius="full" 
          bottom="-30px" 
          left="20%" 
          zIndex={1}
        />
      </Box>

      {/* Tabs Section */}
      <Box
        bg="gray.800"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <Tabs 
          isFitted 
          variant="soft-rounded" 
          colorScheme="cyan"
          size="lg"
          onChange={(index) => setSelectedTab(index)}
        >
          <TabList 
            p={4} 
            bg="gray.900" 
            borderBottomWidth="1px" 
            borderBottomColor="gray.700"
            mx={4}
            mt={4}
            borderRadius="xl"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
          >
            <Tab 
              _selected={{ 
                color: 'white',
                bgGradient: 'linear(to-r, green.400, teal.500)',
                boxShadow: '0 8px 20px rgba(49, 151, 149, 0.25)',
                transform: 'translateY(-2px)'
              }}
              _hover={{
                bgGradient: 'linear(to-r, green.400, teal.500, teal.400)',
                opacity: 0.85
              }}
              transition="all 0.3s"
              borderRadius="lg"
              fontWeight="bold"
              py={4}
              mx={1}
              _active={{
                transform: 'translateY(0)',
                boxShadow: '0 4px 10px rgba(49, 151, 149, 0.2)',
              }}
            >
              <HStack spacing={2}>
                <SearchIcon />
                <Text>Explore</Text>
              </HStack>
            </Tab>
            <Tab 
              _selected={{ 
                color: 'white',
                bgGradient: 'linear(to-r, purple.500, pink.500)',
                boxShadow: '0 8px 20px rgba(159, 122, 234, 0.25)',
                transform: 'translateY(-2px)'
              }}
              _hover={{
                bgGradient: 'linear(to-r, purple.500, pink.500, purple.400)',
                opacity: 0.85
              }}
              transition="all 0.3s"
              borderRadius="lg"
              fontWeight="bold"
              py={4}
              mx={1}
              _active={{
                transform: 'translateY(0)',
                boxShadow: '0 4px 10px rgba(159, 122, 234, 0.2)',
              }}
            >
              <HStack spacing={2}>
                <Icon as={FaBookmark} />
                <Text>My Collection</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels p={6}>
            <TabPanel>
              <VStack spacing={8}>
                <Box 
                  w="100%" 
                  bg="gray.900" 
                  p={6} 
                  borderRadius="xl"
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
                  borderWidth="1px"
                  borderColor="gray.700"
                >
                  <Text 
                    fontSize="lg" 
                    fontWeight="medium" 
                    mb={4}
                    bgGradient="linear(to-r, cyan.400, blue.500)"
                    bgClip="text"
                  >
                    Upload a photo to identify a location
                  </Text>
                  <ImageUploader 
                    onUpload={handleImageUpload} 
                    isLoading={isLoading}
                  />
                </Box>
                
                {detectedLocation && (
                  <LocationDisplay 
                    location={detectedLocation}
                    showSaveButton={true}
                  />
                )}
              </VStack>
            </TabPanel>
            
            <TabPanel>
              <LocationCollection key={refreshKey} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default LocationExplorer; 