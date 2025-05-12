import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  Image,
  useToast,
  Progress,
  IconButton,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
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

      handleDeleteImage();
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
        colorScheme="cyan"
        size="lg"
        onClick={() => fileInputRef.current.click()}
        _hover={{ transform: 'scale(1.05)' }}
        transition="all 0.2s"
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
        </Box>
      )}

      {selectedImage && (
        <Button
          colorScheme="purple"
          size="lg"
          onClick={uploadImage}
          isLoading={isLoading || externalLoading}
          loadingText="Processing..."
          _hover={{ transform: 'scale(1.05)' }}
          transition="all 0.2s"
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
        />
      )}
    </VStack>
  );
};

export default ImageUploader; 