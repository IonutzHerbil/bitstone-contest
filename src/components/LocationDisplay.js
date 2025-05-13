import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  useToast,
  Badge,
  Image,
  Heading,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  useClipboard,
  Tooltip,
} from '@chakra-ui/react';
import { StarIcon, CheckIcon, InfoIcon, EditIcon, CopyIcon, ShareIcon } from '@chakra-ui/icons';
import { FaShare } from 'react-icons/fa';
import config from '../config';

const LocationDisplay = ({ location, showSaveButton = false }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [userNotes, setUserNotes] = useState(location.userNotes || '');
  const [isNotesEdited, setIsNotesEdited] = useState(false);
  const toast = useToast();
  const { hasCopied, onCopy } = useClipboard(
    `Check out this amazing landmark I discovered: ${location.name} in ${location.location}`
  );

  const handleSave = () => {
    try {
      const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
      if (savedLocations.some(loc => loc.id === location.id)) {
        toast({
          title: 'Already saved',
          status: 'info',
          duration: 2000,
        });
        return;
      }
      
      // Add notes to the location before saving
      const locationWithNotes = {
        ...location,
        userNotes: userNotes
      };
      
      savedLocations.push(locationWithNotes);
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
      setIsSaved(true);
      
      toast({
        title: 'Location saved!',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error saving location',
        status: 'error',
        duration: 2000,
      });
    }
  };

  const handleNotesChange = (e) => {
    setUserNotes(e.target.value);
    setIsNotesEdited(true);
  };

  const saveNotes = async () => {
    try {
      // Update notes in local storage
      const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
      const index = savedLocations.findIndex(loc => loc.id === location.id);
      
      if (index !== -1) {
        savedLocations[index].userNotes = userNotes;
        localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
      }
      
      // Call the API to update notes (if needed)
      if (config.apiBaseUrl) {
        await fetch(`${config.apiBaseUrl}/api/location-notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationId: location.id,
            notes: userNotes
          }),
        });
      }
      
      setIsNotesEdited(false);
      toast({
        title: 'Notes saved successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error saving notes',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${location.name} in ${location.location}`,
          text: `Check out this amazing landmark I discovered: ${location.name} in ${location.location}`,
          url: window.location.href,
        });
        return;
      }
      
      // Fallback to copy to clipboard
      onCopy();
      toast({
        title: 'Link copied!',
        description: 'Share link copied to clipboard',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Box
      w="100%"
      bg="gray.800"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="0 0 20px rgba(0, 255, 255, 0.1)"
      borderWidth="1px"
      borderColor="transparent"
      _hover={{
        boxShadow: "0 0 30px rgba(0, 255, 255, 0.2)",
      }}
      transition="all 0.3s"
    >
      <Box position="relative">
        <Image
          src={location.imageUrl}
          alt={location.name}
          objectFit="cover"
          w="100%"
          h="400px"
        />
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="rgba(0, 0, 0, 0.7)"
          p={4}
          backdropFilter="blur(10px)"
        >
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="white">
              {location.name}
            </Heading>
            <Badge 
              colorScheme={location.difficulty === 'easy' ? 'green' : location.difficulty === 'medium' ? 'yellow' : 'red'}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {location.difficulty}
            </Badge>
          </HStack>
        </Box>
      </Box>
      
      <VStack spacing={6} p={6} align="stretch">
        <Text color="cyan.400" fontSize="lg" fontWeight="medium">
          {location.location}
        </Text>
        
        <Tabs isFitted colorScheme="cyan" variant="enclosed">
          <TabList mb={4}>
            <Tab>Details</Tab>
            <Tab>Full Description</Tab>
            <Tab>Map</Tab>
            <Tab>My Notes</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <Box bg="gray.700" p={4} borderRadius="lg">
                <HStack spacing={3} mb={2}>
                  <InfoIcon color="cyan.400" />
                  <Text fontWeight="semibold">Description</Text>
                </HStack>
                <Text color="gray.300">
                  {location.description}
                </Text>
              </Box>
            </TabPanel>
            
            <TabPanel>
              <Box bg="gray.700" p={4} borderRadius="lg">
                <HStack spacing={3} mb={3}>
                  <InfoIcon color="cyan.400" />
                  <Text fontWeight="semibold">Enhanced Description</Text>
                </HStack>
                <Text color="gray.300" whiteSpace="pre-wrap">
                  {location.enhancedDescription || "No enhanced description available."}
                </Text>
              </Box>
            </TabPanel>
            
            <TabPanel>
              {location.coordinates ? (
                <Box
                  as="iframe"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.coordinates.lon-0.01},${location.coordinates.lat-0.01},${location.coordinates.lon+0.01},${location.coordinates.lat+0.01}&layer=mapnik&marker=${location.coordinates.lat},${location.coordinates.lon}`}
                  width="100%"
                  height="300px"
                  borderRadius="lg"
                  border="none"
                  boxShadow="0 0 20px rgba(0, 0, 0, 0.2)"
                />
              ) : (
                <Box bg="gray.700" p={4} borderRadius="lg" textAlign="center">
                  <Text color="gray.300">No map data available for this location.</Text>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel>
              <Box bg="gray.700" p={4} borderRadius="lg">
                <HStack spacing={3} mb={3} justify="space-between">
                  <HStack>
                    <EditIcon color="cyan.400" />
                    <Text fontWeight="semibold">My Notes</Text>
                  </HStack>
                  {isNotesEdited && (
                    <Button size="sm" colorScheme="cyan" onClick={saveNotes}>
                      Save Notes
                    </Button>
                  )}
                </HStack>
                <Textarea
                  value={userNotes}
                  onChange={handleNotesChange}
                  placeholder="Add your personal notes about this location..."
                  minH="150px"
                  bg="gray.800"
                  border="1px solid"
                  borderColor="gray.600"
                  _hover={{ borderColor: "cyan.400" }}
                  _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px cyan.400" }}
                />
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <HStack spacing={4}>
          {showSaveButton && !isSaved && (
            <Button
              leftIcon={<StarIcon />}
              colorScheme="cyan"
              size="lg"
              onClick={handleSave}
              isDisabled={isSaved}
              flex="1"
            >
              Save to Collection
            </Button>
          )}
          
          {isSaved && (
            <Button
              leftIcon={<CheckIcon />}
              colorScheme="green"
              size="lg"
              isDisabled
              flex="1"
            >
              Saved to Collection
            </Button>
          )}
          
          <Tooltip label="Share this location">
            <IconButton
              icon={<FaShare />}
              colorScheme="purple"
              size="lg"
              onClick={handleShare}
              aria-label="Share location"
            />
          </Tooltip>
        </HStack>
      </VStack>
    </Box>
  );
};

export default LocationDisplay; 