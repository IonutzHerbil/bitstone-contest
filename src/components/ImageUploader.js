import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  Image,
  useToast,
  Progress,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { FaCamera, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import config from '../config';

const ImageUploader = ({ onUpload, onPhotoAnalyzed, isLoading: externalLoading }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    
    // Clear previous image first
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Reset state before setting the new image
    setSelectedImage(null);
    setPreviewUrl(null);
    
    // Set the new image if one was selected
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
        await onUpload(selectedImage);
      } 
      // Otherwise use analyze-image endpoint for Photo Challenge
      else if (onPhotoAnalyzed) {
        const response = await axios.post(`${config.apiBaseUrl}/api/analyze-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        onPhotoAnalyzed(response.data.analysis);
      }

      // Clear the image after successful processing
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error processing image',
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
        leftIcon={<Icon as={FaCamera} boxSize={5} />}
        size="lg"
        onClick={() => fileInputRef.current.click()}
        transition="all 0.2s"
        px={8}
        py={6}
        fontSize="md"
        fontWeight="bold"
        bgGradient="linear(to-r, green.400, teal.500)"
        _hover={{ 
          bgGradient: "linear(to-r, green.500, teal.600)",
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 20px rgba(49, 151, 149, 0.3)'
        }}
        _active={{
          bgGradient: "linear(to-r, green.600, teal.700)",
          transform: 'translateY(0)',
        }}
        borderRadius="lg"
        color="white"
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
          boxShadow="0 10px 25px rgba(0, 0, 0, 0.2)"
          border="3px solid"
          borderColor="gray.700"
        >
          <Image 
            src={previewUrl} 
            alt="Preview" 
            borderRadius="xl" 
            objectFit="cover"
          />
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
            boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)"
          />
        </Box>
      )}

      {selectedImage && (
        <Button
          leftIcon={<Icon as={FaMapMarkerAlt} boxSize={5} />}
          size="lg"
          onClick={uploadImage}
          isLoading={isLoading || externalLoading}
          loadingText="Processing..."
          transition="all 0.2s"
          px={8}
          py={6}
          fontSize="md"
          fontWeight="bold"
          bgGradient="linear(to-r, purple.500, pink.500)"
          _hover={{ 
            bgGradient: "linear(to-r, purple.600, pink.600)",
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px rgba(159, 122, 234, 0.3)'
          }}
          _active={{
            bgGradient: "linear(to-r, purple.700, pink.700)",
            transform: 'translateY(0)',
          }}
          borderRadius="lg"
          color="white"
        >
          {onUpload ? 'Detect Location' : 'Verify Photo'}
        </Button>
      )}

      {(isLoading || externalLoading) && (
        <Progress 
          size="xs" 
          isIndeterminate 
          width="100%" 
          colorScheme="purple"
          borderRadius="full"
        />
      )}
    </VStack>
  );
};

export default ImageUploader; 