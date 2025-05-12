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
} from '@chakra-ui/react';
import ImageUploader from './ImageUploader';
import LocationDisplay from './LocationDisplay';
import LocationCollection from './LocationCollection';
import config from '../config';

const LocationExplorer = () => {
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleImageUpload = async (file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${config.apiBaseUrl}/api/detect-location`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to detect location');
      }

      const data = await response.json();
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
    <Box w="100%">
      <VStack spacing={8} align="stretch">
        <Heading 
          size="lg" 
          textAlign="center"
          bgGradient="linear(to-r, cyan.400, purple.500)"
          bgClip="text"
        >
          Location Explorer
        </Heading>
        
        <Text textAlign="center" color="gray.400">
          Upload a photo of any landmark to discover its location and learn more about it
        </Text>

        <Tabs isFitted variant="enclosed" colorScheme="purple">
          <TabList>
            <Tab>Explore</Tab>
            <Tab>My Collection</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={6}>
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
      </VStack>
    </Box>
  );
};

export default LocationExplorer; 