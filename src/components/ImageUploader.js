import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  Image,
  useToast,
  Progress,
  IconButton,
  Text,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { FaCamera } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

// Fallback data for when the API calls fail
const fallbackLocationData = {
  id: Math.random().toString(36).substr(2, 9),
  name: "St. Michael's Church",
  description: "St. Michael's Church is a Gothic-style Roman Catholic church in Cluj-Napoca, Romania. It is the second largest church in Transylvania, after the Black Church in Brașov.",
  location: "Cluj-Napoca, Romania",
  coordinates: { lat: 46.7694, lng: 23.5909 },
  difficulty: 'medium',
};

const fallbackAnalysis = "This appears to be St. Michael's Church (Szent Mihály-templom) located in Cluj-Napoca, Romania. It's a Gothic-style Roman Catholic church and one of the most important landmarks in the city. The church was built primarily between the 14th and 15th centuries and features a tall, impressive spire that dominates the city's skyline.";

const ImageUploader = ({ onUpload, onPhotoAnalyzed, isLoading: externalLoading }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: 'Photo deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      toast({
        title: 'No image selected',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      // If onUpload is provided, use it for Location Explorer
      if (onUpload) {
        try {
          // Try the real API first
          const response = await axios.post(`${API_URL}/detect-location`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          if (response.data) {
            onUpload(response.data);
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (apiError) {
          console.warn('API call failed, using fallback data:', apiError);
          // If API call fails, use fallback data
          const fallbackData = {
            ...fallbackLocationData,
            imageUrl: previewUrl
          };
          onUpload(fallbackData);
          
          toast({
            title: 'Using demo mode',
            description: 'Server connection failed. Using simulated data instead.',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      } 
      // Otherwise use analyze-image endpoint for Photo Challenge
      else if (onPhotoAnalyzed) {
        try {
          // Try the real API first
          const response = await axios.post(`${API_URL}/analyze-image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          if (response.data && response.data.analysis) {
            onPhotoAnalyzed(response.data.analysis);
            handleDeleteImage();
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (apiError) {
          console.warn('API call failed, using fallback data:', apiError);
          // If API call fails, use fallback data
          onPhotoAnalyzed(fallbackAnalysis);
          handleDeleteImage();
          
          toast({
            title: 'Using demo mode',
            description: 'Server connection failed. Using simulated data instead.',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error processing image',
        description: error.message || 'Failed to process image. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={6} width="100%">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      {!previewUrl ? (
        <Box 
          w="100%" 
          maxW="500px" 
          h="280px" 
          borderWidth="2px" 
          borderStyle="dashed" 
          borderColor="gray.500" 
          borderRadius="xl"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={6}
          _hover={{
            borderColor: "cyan.400",
            bg: "rgba(0,255,255,0.05)",
            transition: "all 0.3s ease"
          }}
          transition="all 0.3s ease"
          onClick={() => fileInputRef.current.click()}
          cursor="pointer"
        >
          <Icon as={FaCamera} w={12} h={12} color="gray.500" mb={4} />
          <Text fontSize="lg" fontWeight="medium" mb={2} textAlign="center">
            Take or Upload a Photo
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center" mb={6}>
            Click here to select an image from your device
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="cyan"
            variant="outline"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current.click();
            }}
          >
            Select Image
          </Button>
        </Box>
      ) : (
        <Box 
          position="relative"
          maxW="500px" 
          w="100%" 
          borderRadius="xl" 
          overflow="hidden"
          boxShadow="0 4px 20px rgba(0, 255, 255, 0.2)"
        >
          <Image 
            src={previewUrl} 
            alt="Preview" 
            borderRadius="xl" 
            objectFit="cover"
            w="100%"
          />
          <IconButton
            icon={<DeleteIcon />}
            colorScheme="red"
            size="sm"
            position="absolute"
            top={3}
            right={3}
            onClick={handleDeleteImage}
            aria-label="Delete photo"
            borderRadius="full"
            boxShadow="0 2px 6px rgba(0,0,0,0.3)"
            _hover={{ transform: 'scale(1.1)' }}
            transition="all 0.2s"
          />
        </Box>
      )}

      {selectedImage && (
        <Button
          colorScheme={onUpload ? "cyan" : "purple"}
          size="lg"
          onClick={uploadImage}
          isLoading={isLoading || externalLoading}
          loadingText={onUpload ? "Processing..." : "Verifying..."}
          _hover={{ transform: 'scale(1.05)' }}
          transition="all 0.2s"
          boxShadow="0 4px 12px rgba(0,0,0,0.15)"
          w={["100%", "auto"]}
          px={8}
        >
          {onUpload ? 'Detect Location' : 'Verify Photo'}
        </Button>
      )}

      {(isLoading || externalLoading) && (
        <Progress 
          size="xs" 
          isIndeterminate 
          width="100%" 
          colorScheme={onUpload ? "cyan" : "purple"}
          borderRadius="full"
        />
      )}
    </VStack>
  );
};

export default ImageUploader; 