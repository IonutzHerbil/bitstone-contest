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
} from '@chakra-ui/react';
import { DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import config from '../config';

const ImageUploader = ({ onUpload, onPhotoAnalyzed, isLoading: externalLoading, processingProgress }) => {
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

  // Helper function to reduce image size if needed
  const processImage = (file) => {
    return new Promise((resolve) => {
      // For now just resolve with the file
      // In a real app, we might resize large images before upload
      resolve(file);
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
      // Process image if needed (resize, compress, etc.)
      const processedImage = await processImage(selectedImage);
      
      // Use the server-side ChatGPT-powered endpoint
      if (onUpload) {
        // Create a FormData object to send the image
        const formData = new FormData();
        formData.append('image', processedImage);
        
        // For better debugging
        console.log(`Sending to ${config.apiBaseUrl}/api/detect-location`);
        console.log('Image size:', processedImage.size, 'bytes');
        
        // Send the image to the API endpoint with full server URL
        const response = await fetch(`${config.apiBaseUrl}/api/detect-location`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Server error: ${response.status} - ${errorData.error || response.statusText}`);
        }
        
        // Get the location data
        const locationData = await response.json();
        
        // Enhanced error handling for missing data
        if (!locationData.name || !locationData.description) {
          throw new Error('Incomplete location data received from server');
        }
        
        // Pass the location data to parent component
        onUpload(locationData);
        
        // Set loading to false now that we're done
        setIsLoading(false);
        
        // Clear image after successful upload
        handleDeleteImage();
      } 
      // For Photo Challenge, use the analyze-image endpoint instead
      else if (onPhotoAnalyzed) {
        // Create a FormData object to send the image
        const formData = new FormData();
        formData.append('image', processedImage);
        
        // Send the image to the analyze-image endpoint with full server URL
        const response = await fetch(`${config.apiBaseUrl}/api/analyze-image`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Server error: ${response.status} - ${errorData.error || response.statusText}`);
        }
        
        // Get the analysis from ChatGPT
        const data = await response.json();
        
        if (!data.analysis) {
          throw new Error('No analysis received from server');
        }
        
        // Return the landmark description from ChatGPT
        onPhotoAnalyzed(data.analysis);
        
        // Clean up after successful analysis
        handleDeleteImage();
        setIsLoading(false);
        
        // Return early as we've handled everything
        return;
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: 'Error processing image',
        description: error.message || 'Something went wrong while processing your image',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      if (isLoading) setIsLoading(false);
    }
  };

  const isProcessing = isLoading || externalLoading;

  return (
    <VStack spacing={6} width="100%">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <Button
        colorScheme="cyan"
        size="lg"
        onClick={() => fileInputRef.current.click()}
        _hover={{ transform: 'scale(1.05)' }}
        transition="all 0.2s"
        isDisabled={isProcessing}
      >
        Take Photo
      </Button>
      
      {previewUrl && (
        <Box 
          position="relative"
          maxW="400px" 
          w="100%" 
          borderRadius="xl" 
          overflow="hidden"
          boxShadow="0 0 20px rgba(0, 255, 255, 0.2)"
        >
          <Image 
            src={previewUrl} 
            alt="Preview" 
            borderRadius="xl" 
            objectFit="cover"
          />
          {!isProcessing && (
            <IconButton
              icon={<DeleteIcon />}
              colorScheme="red"
              size="sm"
              position="absolute"
              top={2}
              right={2}
              onClick={handleDeleteImage}
              aria-label="Delete photo"
              _hover={{ transform: 'scale(1.1)' }}
              transition="all 0.2s"
            />
          )}
        </Box>
      )}

      {selectedImage && !isProcessing && (
        <Button
          colorScheme="purple"
          size="lg"
          onClick={uploadImage}
          leftIcon={<CheckIcon />}
          _hover={{ transform: 'scale(1.05)' }}
          transition="all 0.2s"
        >
          {onUpload ? 'Detect Location' : 'Verify Photo'}
        </Button>
      )}

      {isProcessing && typeof processingProgress === 'number' && (
        <Box width="100%" maxW="400px">
          <Progress 
            value={processingProgress} 
            size="sm" 
            colorScheme="purple"
            borderRadius="full"
            hasStripe
            isAnimated
            mb={2}
          />
        </Box>
      )}
      
      {isProcessing && typeof processingProgress !== 'number' && (
        <Progress 
          size="xs" 
          isIndeterminate 
          width="100%" 
          colorScheme="purple"
        />
      )}
    </VStack>
  );
};

export default ImageUploader; 