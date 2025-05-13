import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Text,
  Image,
  Button,
  HStack,
  VStack,
  Badge,
  useClipboard,
  Textarea,
  useToast,
  IconButton,
  Tooltip,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { ExternalLinkIcon, DeleteIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';

const LocationDisplay = ({ 
  location, 
  onSave,
  onDelete,
  showSaveButton = false,
  showDeleteButton = false 
}) => {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem(`notes_${location.id}`);
    return savedNotes || '';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempNotes, setTempNotes] = useState(notes);
  const toast = useToast();
  const { hasCopied, onCopy } = useClipboard(`${location.name}, ${location.location}`);

  // Save notes when they change
  React.useEffect(() => {
    if (notes) {
      localStorage.setItem(`notes_${location.id}`, notes);
    }
  }, [notes, location.id]);

  const handleSaveNotes = () => {
    setNotes(tempNotes);
    setIsEditing(false);
    toast({
      title: 'Notes saved',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleCancelEdit = () => {
    setTempNotes(notes);
    setIsEditing(false);
  };

  const openInMaps = () => {
    if (location.coordinates) {
      window.open(`https://www.openstreetmap.org/#map=16/${location.coordinates.lat}/${location.coordinates.lng}`, '_blank');
    } else {
      window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(location.name + ' ' + location.location)}`, '_blank');
    }
  };

  return (
    <Card
      overflow="hidden"
      variant="filled"
      bg="gray.800"
      borderRadius="xl"
      boxShadow="lg"
      _hover={{ transform: 'translateY(-4px)', transition: 'all 0.3s ease' }}
    >
      {location.imageUrl && (
        <Box position="relative" height="200px" overflow="hidden">
          <Image
            src={location.imageUrl}
            alt={location.name}
            objectFit="cover"
            w="100%"
            h="100%"
          />
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme={
              location.difficulty === 'easy' ? 'green' : 
              location.difficulty === 'medium' ? 'yellow' : 
              'red'
            }
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
          >
            {location.difficulty}
          </Badge>
        </Box>
      )}

      <CardBody pt={4}>
        <VStack align="start" spacing={3}>
          <Heading 
            size="md" 
            color="cyan.300"
          >
            {location.name}
          </Heading>
          
          <Text color="gray.400" fontSize="sm">
            {location.location}
          </Text>
          
          <Text mt={2}>
            {location.description}
          </Text>
          
          <Box w="100%" mt={4}>
            <Text fontWeight="medium" mb={2} color="gray.300">
              Personal Notes:
            </Text>
            
            {isEditing ? (
              <VStack align="stretch" spacing={2}>
                <Textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="Add your personal notes about this location..."
                  size="sm"
                  h="100px"
                />
                <HStack justifyContent="flex-end">
                  <Button
                    size="sm"
                    leftIcon={<CloseIcon />}
                    onClick={handleCancelEdit}
                    colorScheme="gray"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<CheckIcon />}
                    onClick={handleSaveNotes}
                    colorScheme="green"
                  >
                    Save
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack align="stretch">
                <Box
                  p={3}
                  bg="gray.700"
                  borderRadius="md"
                  minH="80px"
                  fontSize="sm"
                >
                  {notes ? notes : (
                    <Text color="gray.500" fontStyle="italic">
                      No notes added yet. Click edit to add your notes.
                    </Text>
                  )}
                </Box>
                <HStack justifyContent="flex-end">
                  <IconButton
                    size="sm"
                    icon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    colorScheme="blue"
                    variant="ghost"
                    aria-label="Edit notes"
                  />
                </HStack>
              </VStack>
            )}
          </Box>
        </VStack>
      </CardBody>

      <CardFooter
        pt={0}
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Flex width="100%" gap={2} flexWrap="wrap">
          <Button
            leftIcon={<ExternalLinkIcon />}
            colorScheme="blue"
            variant="ghost"
            size="sm"
            onClick={openInMaps}
          >
            View on Map
          </Button>
          
          <Button
            colorScheme="purple"
            variant="ghost"
            size="sm"
            onClick={onCopy}
          >
            {hasCopied ? 'Copied!' : 'Copy Location'}
          </Button>
          
          <Spacer />
          
          {showSaveButton && onSave && (
            <Button
              colorScheme="cyan"
              size="sm"
              onClick={onSave}
            >
              Save to Collection
            </Button>
          )}
          
          {showDeleteButton && onDelete && (
            <Tooltip label="Remove from collection">
              <IconButton
                colorScheme="red"
                variant="ghost"
                size="sm"
                icon={<DeleteIcon />}
                onClick={onDelete}
                aria-label="Delete location"
              />
            </Tooltip>
          )}
        </Flex>
      </CardFooter>
    </Card>
  );
};

export default LocationDisplay; 