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
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, InfoIcon } from '@chakra-ui/icons';
import { FaShare } from 'react-icons/fa';

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
    setNotes(location.userNotes || '');
    onOpen();
  };

  const saveNotes = () => {
    setSavedLocations(savedLocations.map(loc => 
      loc.id === selectedLocation.id 
        ? { ...loc, userNotes: notes } 
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
        title: 'Check out this landmark!',
        text: `I discovered ${location.name} in ${location.location} using Cluj Explorer!`,
        url: window.location.href,
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n\nRead more about it: ${shareData.url}`
        );
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
        bg="background.secondary"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="rgba(0, 178, 255, 0.1)"
        boxShadow="0 0 20px rgba(0, 178, 255, 0.05)"
      >
        <InfoIcon boxSize={8} color="accent.primary" opacity={0.6} />
        <Text color="whiteAlpha.800" fontSize="lg" textAlign="center">
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
            bg="background.secondary"
            borderRadius="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="rgba(0, 178, 255, 0.1)"
            boxShadow="0 0 20px rgba(0, 178, 255, 0.1)"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: '0 0 30px rgba(0, 178, 255, 0.2)',
            }}
            transition="all 0.3s"
          >
            <Box position="relative">
              <Image
                src={location.imageUrl}
                alt={location.name}
                objectFit="cover"
                h="200px"
                w="100%"
              />
              <Badge 
                position="absolute" 
                top={3} 
                right={3}
                colorScheme="purple"
                borderRadius="full"
                py={1}
                px={3}
                boxShadow="0 2px 8px rgba(0,0,0,0.4)"
              >
                {location.location}
              </Badge>
            </Box>
            
            <VStack spacing={4} p={4} align="stretch">
              <Heading 
                size="md" 
                bgGradient="linear(to-r, accent.primary, accent.secondary)" 
                bgClip="text"
                letterSpacing="tight"
              >
                {location.name}
              </Heading>
              
              {location.userNotes && (
                <Box bg="rgba(0, 178, 255, 0.05)" p={3} borderRadius="lg" borderLeft="3px solid" borderColor="accent.primary">
                  <Text fontSize="sm" color="whiteAlpha.800">
                    {location.userNotes}
                  </Text>
                </Box>
              )}
              
              <HStack spacing={2} justify="space-between">
                <Tooltip label="Edit notes">
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => handleEditNotes(location)}
                    size="sm"
                    variant="ghost"
                    colorScheme="cyan"
                    _hover={{
                      bg: 'rgba(0, 178, 255, 0.1)',
                    }}
                    aria-label="Edit notes"
                  />
                </Tooltip>
                
                <Tooltip label="Share location">
                  <IconButton
                    icon={<FaShare />}
                    onClick={() => handleShare(location)}
                    size="sm"
                    variant="ghost"
                    colorScheme="purple"
                    _hover={{
                      bg: 'rgba(121, 40, 202, 0.1)',
                    }}
                    aria-label="Share location"
                  />
                </Tooltip>
                
                <Tooltip label="Delete location">
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(location.id)}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    _hover={{
                      bg: 'rgba(255, 0, 0, 0.1)',
                    }}
                    aria-label="Delete location"
                  />
                </Tooltip>
              </HStack>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent 
          bg="background.secondary" 
          borderRadius="xl"
          borderWidth="1px"
          borderColor="rgba(0, 178, 255, 0.1)"
          boxShadow="0 0 30px rgba(0, 0, 0, 0.5)"
        >
          <ModalHeader 
            bgGradient="linear(to-r, accent.primary, accent.secondary)"
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
              bg="background.tertiary"
              borderColor="rgba(0, 178, 255, 0.2)"
              _focus={{
                borderColor: "accent.primary",
                boxShadow: '0 0 0 1px rgba(0, 178, 255, 0.5)',
              }}
              mb={4}
              minH="150px"
            />
            <Button 
              variant="primary"
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