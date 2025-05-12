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
  Heading,
  HStack,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, ExternalLinkIcon, InfoIcon } from '@chakra-ui/icons';

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
      <VStack 
        spacing={4} 
        p={8}
        bg="gray.800"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <InfoIcon boxSize={8} color="gray.500" />
        <Text color="gray.400" fontSize="lg" textAlign="center">
          No saved locations yet. Start exploring to add some!
        </Text>
      </VStack>
    );
  }

  return (
    <>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {savedLocations.map((location) => (
          <Box
            key={location.id}
            bg="gray.800"
            borderRadius="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="transparent"
            boxShadow="0 0 20px rgba(0, 255, 255, 0.1)"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
            }}
            transition="all 0.3s"
          >
            <Image
              src={location.imageUrl}
              alt={location.name}
              objectFit="cover"
              h="200px"
              w="100%"
            />
            <VStack spacing={4} p={4} align="stretch">
              <Heading size="md" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">
                {location.name}
              </Heading>
              {location.notes && (
                <Box bg="gray.700" p={3} borderRadius="lg">
                  <Text fontSize="sm" color="gray.300">
                    {location.notes}
                  </Text>
                </Box>
              )}
              <HStack spacing={2} justify="space-between">
                <IconButton
                  icon={<EditIcon />}
                  onClick={() => handleEditNotes(location)}
                  size="sm"
                  variant="ghost"
                  colorScheme="cyan"
                  _hover={{
                    bg: 'rgba(0, 255, 255, 0.1)',
                  }}
                />
                <IconButton
                  icon={<ExternalLinkIcon />}
                  onClick={() => handleShare(location)}
                  size="sm"
                  variant="ghost"
                  colorScheme="purple"
                  _hover={{
                    bg: 'rgba(128, 90, 213, 0.1)',
                  }}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => handleDelete(location.id)}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  _hover={{
                    bg: 'rgba(255, 0, 0, 0.1)',
                  }}
                />
              </HStack>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.800" borderRadius="xl">
          <ModalHeader 
            bgGradient="linear(to-r, cyan.400, purple.500)"
            bgClip="text"
          >
            Edit Notes
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this location..."
              size="md"
              resize="vertical"
              bg="gray.700"
              border="none"
              _focus={{
                boxShadow: '0 0 0 2px rgba(0, 255, 255, 0.2)',
              }}
              mb={4}
            />
            <Button 
              colorScheme="cyan"
              onClick={saveNotes}
              w="100%"
            >
              Save Notes
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LocationCollection; 