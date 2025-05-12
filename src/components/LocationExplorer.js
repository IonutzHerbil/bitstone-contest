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
    <Container maxW="container.xl">
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading 
            size="xl"
            mb={4}
          >
            Location Explorer
          </Heading>
          <Text fontSize="lg" color="gray.400">
            Upload a photo of any landmark to discover its location and learn more about it
          </Text>
        </Box>

        <Box
          bg="gray.800"
          borderRadius="xl"
          p={6}
          boxShadow="0 0 20px rgba(0, 255, 255, 0.1)"
          borderWidth="1px"
          borderColor="transparent"
          _hover={{
            boxShadow: "0 0 30px rgba(0, 255, 255, 0.2)",
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
                  bg: 'cyan.500',
                  borderColor: 'cyan.500',
                }}
                borderRadius="lg"
                mx={1}
              >
                Explore
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'white',
                  bg: 'purple.500',
                  borderColor: 'purple.500',
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