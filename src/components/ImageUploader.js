import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  Image,
  Text,
  useToast,
  Progress,
} from '@chakra-ui/react';
import axios from 'axios';

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis('');
    }
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
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('latitude', position.coords.latitude);
      formData.append('longitude', position.coords.longitude);

      const response = await axios.post('http://localhost:5000/api/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysis(response.data.analysis);
      
      toast({
        title: 'Image analyzed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error analyzing image',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
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
      <Button
        colorScheme="cyan"
        size="lg"
        onClick={() => fileInputRef.current.click()}
        _hover={{ transform: 'scale(1.05)' }}
        transition="all 0.2s"
      >
        Select Image
      </Button>
      
      {previewUrl && (
        <Box 
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
        </Box>
      )}

      {selectedImage && (
        <Button
          colorScheme="purple"
          size="lg"
          onClick={uploadImage}
          isLoading={isLoading}
          loadingText="Analyzing..."
          _hover={{ transform: 'scale(1.05)' }}
          transition="all 0.2s"
        >
          Analyze Image
        </Button>
      )}

      {isLoading && (
        <Progress 
          size="xs" 
          isIndeterminate 
          width="100%" 
          colorScheme="purple"
        />
      )}

      {analysis && (
        <Box 
          p={6} 
          borderRadius="xl" 
          bg="gray.800" 
          width="100%"
          boxShadow="0 0 20px rgba(128, 90, 213, 0.2)"
        >
          <Text fontSize="lg" lineHeight="tall">{analysis}</Text>
        </Box>
      )}
    </VStack>
  );
};

export default ImageUploader; 