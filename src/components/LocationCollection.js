import React, { useState, useEffect } from 'react';
import {
  VStack,
  SimpleGrid,
  Box,
  Image,
  Text,
  IconButton,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';

const LocationCollection = () => {
  const [savedLocations, setSavedLocations] = useState(() => {
    const saved = localStorage.getItem('savedLocations');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [notes, setNotes] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  const handleDelete = (locationId) => {
    setSavedLocations(savedLocations.filter(loc => loc.id !== locationId));
    toast({
      title: 'Location removed',
      status: 'info',
      duration: 2000,
    });
  };

  const handleEditNotes = (location) => {
    setSelectedLocation(location);
    setNotes(location.notes || '');
    onOpen();
  };

  const saveNotes = () => {
    setSavedLocations(savedLocations.map(loc => 
      loc.id === selectedLocation.id 
        ? { ...loc, notes } 
        : loc
    ));
    onClose();
    toast({
      title: 'Notes saved',
      status: 'success',
      duration: 2000,
    });
  };

  const handleShare = async (location) => {
    try {
      const shareData = {
        title: 'Check out this location!',
        text: `I discovered ${location.name} using Location Explorer!`,
        url: `${window.location.origin}/share/${location.id}`,
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Link copied to clipboard!',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to share',
        status: 'error',
        duration: 2000,
      });
    }
  };

  if (savedLocations.length === 0) {
    return (
      <VStack spacing={4} p={4}>
        <Text color="gray.500">No saved locations yet. Start exploring to add some!</Text>
      </VStack>
    );
  }

  return (
    <>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {savedLocations.map((location) => (
          <Box
            key={location.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg="gray.800"
          >
            <Image
              src={location.imageUrl}
              alt={location.name}
              objectFit="cover"
              h="200px"
              w="100%"
            />
            <Box p={4}>
              <Text fontWeight="bold" mb={2}>{location.name}</Text>
              {location.notes && (
                <Text fontSize="sm" color="gray.400" mb={2} noOfLines={2}>
                  {location.notes}
                </Text>
              )}
              <Box display="flex" justifyContent="space-between" mt={2}>
                <IconButton
                  icon={<EditIcon />}
                  onClick={() => handleEditNotes(location)}
                  size="sm"
                  variant="ghost"
                />
                <IconButton
                  icon={<ExternalLinkIcon />}
                  onClick={() => handleShare(location)}
                  size="sm"
                  variant="ghost"
                />
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => handleDelete(location.id)}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                />
              </Box>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>Edit Notes</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this location..."
              size="sm"
              resize="vertical"
            />
            <Button colorScheme="purple" mt={4} onClick={saveNotes}>
              Save Notes
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LocationCollection; 