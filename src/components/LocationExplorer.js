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
  Card,
  CardBody,
  SimpleGrid,
  Button,
  Flex,
  Icon
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import ImageUploader from './ImageUploader';
import LocationDisplay from './LocationDisplay';
import { FaMapMarkedAlt } from 'react-icons/fa';

const LocationExplorer = () => {
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedLocations, setSavedLocations] = useState(() => {
    const saved = localStorage.getItem('savedLocations');
    return saved ? JSON.parse(saved) : [];
  });
  const toast = useToast();

  // Save locations to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  const handleImageUpload = async (locationData) => {
    setIsLoading(true);
    try {
      setDetectedLocation(locationData);
      
      toast({
        title: 'Location detected!',
        description: `Found: ${locationData.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing location data:', error);
      toast({
        title: 'Error',
        description: 'Failed to process location data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const handleSaveLocation = (location) => {
    if (!savedLocations.some(loc => loc.id === location.id)) {
      setSavedLocations([...savedLocations, location]);
      toast({
        title: 'Location saved!',
        description: `Added ${location.name} to your collection`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Already saved',
        description: 'This location is already in your collection',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteLocation = (locationId) => {
    setSavedLocations(savedLocations.filter(loc => loc.id !== locationId));
    toast({
      title: 'Location removed',
      description: 'The location has been removed from your collection',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box w="100%">
      <VStack spacing={8} align="stretch">
        <Heading 
          size="xl" 
          textAlign="center"
          bgGradient="linear(to-r, cyan.400, purple.500)"
          bgClip="text"
          fontWeight="extrabold"
          mb={2}
        >
          Location Explorer
        </Heading>
        
        <Text textAlign="center" color="gray.400" fontSize="lg" mb={4}>
          Upload a photo of any landmark to discover its location and learn more about it
        </Text>

        <Tabs isFitted variant="enclosed" colorScheme="cyan" borderRadius="xl" overflow="hidden">
          <TabList>
            <Tab fontWeight="medium" _selected={{ color: "white", bg: "cyan.700" }}>Explore</Tab>
            <Tab fontWeight="medium" _selected={{ color: "white", bg: "cyan.700" }}>My Collection ({savedLocations.length})</Tab>
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
                    onSave={() => handleSaveLocation(detectedLocation)}
                    showSaveButton={true}
                  />
                )}
              </VStack>
            </TabPanel>
            
            <TabPanel>
              {savedLocations.length > 0 ? (
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
              ) : (
                <Card bg="gray.800" variant="filled" p={6} borderRadius="xl">
                  <CardBody>
                    <VStack spacing={6} align="center" py={8}>
                      <Icon as={FaMapMarkedAlt} w={12} h={12} color="cyan.400" />
                      <Heading size="md" textAlign="center">Your Collection is Empty</Heading>
                      <Text textAlign="center" color="gray.400">
                        Upload images in the Explore tab to detect and save locations to your collection
                      </Text>
                      <Flex mt={4}>
                        <Button
                          leftIcon={<InfoIcon />}
                          colorScheme="cyan"
                          onClick={() => document.querySelector('[role="tablist"] button:first-child').click()}
                        >
                          Go to Explore
                        </Button>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default LocationExplorer; 