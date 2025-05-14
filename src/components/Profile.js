import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Avatar,
  Divider,
  FormControl,
  FormLabel,
  Input,
  useColorModeValue,
  Flex,
  Badge,
  Icon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  SimpleGrid,
  useToast,
  IconButton
} from '@chakra-ui/react';
import { FaCamera, FaMapMarkerAlt, FaTrophy, FaMedal, FaEdit, FaSave, FaLock } from 'react-icons/fa';

const Profile = ({ isOpen, onClose, user, completedGames = [], totalGames = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || 'Photography enthusiast exploring Cluj-Napoca one photo at a time.'
  });
  const toast = useToast();
  const overlayBg = useColorModeValue('blackAlpha.700', 'blackAlpha.800');
  const modalBg = useColorModeValue('gray.900', 'gray.900');
  const cardBg = "rgba(26, 32, 44, 0.6)";
  const borderColor = useColorModeValue("whiteAlpha.300", "whiteAlpha.200");
  
  const achievements = [
    { id: 1, title: "First Game Completed", icon: FaMedal, color: "cyan.400", achieved: completedGames.length > 0 },
    { id: 2, title: "5 Games Completed", icon: FaTrophy, color: "yellow.400", achieved: completedGames.length >= 5 },
    { id: 3, title: "All Games Completed", icon: FaTrophy, color: "purple.400", achieved: completedGames.length === totalGames && totalGames > 0 },
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  
  const handleSave = () => {
    // In a real app, you would save the updated profile to backend
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
    setIsEditing(false);
  };
  
  const completionPercentage = totalGames > 0 ? Math.round((completedGames.length / totalGames) * 100) : 0;
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="2xl" 
      motionPreset="slideInBottom"
      scrollBehavior="inside"
    >
      <ModalOverlay backdropFilter="blur(10px)" bg={overlayBg} />
      <ModalContent 
        bg={modalBg}
        borderRadius="xl"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.6)"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="120px"
          bgGradient="linear(to-r, cyan.800, purple.800)"
          opacity="0.8"
        />
        
        <ModalHeader 
          color="white" 
          pt={24} 
          pb={2}
          position="relative"
          textAlign="center"
        >
          <Avatar 
            size="xl" 
            name={user?.username || "User"} 
            position="absolute"
            top="40px"
            left="50%"
            transform="translateX(-50%)"
            borderWidth="4px"
            borderColor="gray.900"
            bg="cyan.500"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.4)"
          />
          <Heading 
            size="lg" 
            mt={10}
            bgGradient="linear(to-r, cyan.400, purple.400)"
            bgClip="text"
          >
            {user?.username || "User Profile"}
          </Heading>
          {!isEditing && (
            <Text color="gray.400" fontSize="sm" mt={1}>
              Member since {new Date().toLocaleDateString()}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton color="white" />
        
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {isEditing ? (
              <VStack spacing={4} align="stretch" p={4}>
                <FormControl>
                  <FormLabel color="gray.300">Username</FormLabel>
                  <Input 
                    name="username"
                    value={userData.username}
                    onChange={handleChange}
                    bg="gray.800"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "cyan.400" }}
                    _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #4FD1C5" }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="gray.300">Email</FormLabel>
                  <Input 
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    bg="gray.800"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "cyan.400" }}
                    _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #4FD1C5" }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="gray.300">Bio</FormLabel>
                  <Input
                    name="bio"
                    value={userData.bio}
                    onChange={handleChange}
                    bg="gray.800"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "cyan.400" }}
                    _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #4FD1C5" }}
                  />
                </FormControl>
              </VStack>
            ) : (
              <>
                <Box 
                  p={5} 
                  bg={cardBg} 
                  borderRadius="lg" 
                  borderWidth="1px" 
                  borderColor={borderColor}
                  backdropFilter="blur(8px)"
                >
                  <HStack justify="space-between" mb={3}>
                    <Heading size="md" color="white">Bio</Heading>
                    <IconButton
                      icon={<FaEdit />}
                      size="sm"
                      variant="ghost"
                      colorScheme="cyan"
                      onClick={() => setIsEditing(true)}
                      aria-label="Edit profile"
                    />
                  </HStack>
                  <Text color="gray.300">{userData.bio}</Text>
                  
                  <Box mt={4}>
                    <HStack color="gray.400" fontSize="sm" mb={1}>
                      <Icon as={FaMapMarkerAlt} color="purple.400" />
                      <Text>Cluj-Napoca, Romania</Text>
                    </HStack>
                    <HStack color="gray.400" fontSize="sm">
                      <Icon as={FaCamera} color="cyan.400" />
                      <Text>Adventurer</Text>
                    </HStack>
                  </Box>
                </Box>
                
                <Box 
                  p={5} 
                  bg={cardBg} 
                  borderRadius="lg" 
                  borderWidth="1px" 
                  borderColor={borderColor}
                  backdropFilter="blur(8px)"
                >
                  <Heading size="md" color="white" mb={4}>Game Progress</Heading>
                  <StatGroup mb={4}>
                    <Stat>
                      <StatLabel color="gray.400">Completed</StatLabel>
                      <StatNumber color="white">{completedGames.length}</StatNumber>
                      <StatHelpText color="cyan.400">
                        out of {totalGames} games
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.400">Completion</StatLabel>
                      <StatNumber color="white">{completionPercentage}%</StatNumber>
                      <StatHelpText color={completionPercentage === 100 ? "purple.400" : "cyan.400"}>
                        {completionPercentage === 100 ? "All complete!" : "In progress"}
                      </StatHelpText>
                    </Stat>
                  </StatGroup>
                  <Progress 
                    value={completionPercentage} 
                    colorScheme="cyan" 
                    borderRadius="md"
                    size="sm"
                    bg="gray.700"
                    hasStripe={completionPercentage < 100}
                    isAnimated={completionPercentage < 100}
                  />
                </Box>
                
                <Box 
                  p={5} 
                  bg={cardBg} 
                  borderRadius="lg" 
                  borderWidth="1px" 
                  borderColor={borderColor}
                  backdropFilter="blur(8px)"
                >
                  <Heading size="md" color="white" mb={4}>Achievements</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {achievements.map(achievement => (
                      <HStack 
                        key={achievement.id} 
                        p={3} 
                        borderRadius="md" 
                        borderWidth="1px"
                        borderColor={achievement.achieved ? achievement.color : "gray.700"}
                        bg={achievement.achieved ? `${achievement.color}20` : "gray.800"}
                        opacity={achievement.achieved ? 1 : 0.7}
                        transition="all 0.2s"
                      >
                        <Flex
                          w="36px"
                          h="36px"
                          borderRadius="full"
                          bg={achievement.achieved ? achievement.color : "gray.700"}
                          color="white"
                          align="center"
                          justify="center"
                          mr={2}
                          boxShadow={achievement.achieved ? `0 0 10px ${achievement.color}` : "none"}
                        >
                          <Icon 
                            as={achievement.achieved ? achievement.icon : FaLock}
                            boxSize="18px"
                          />
                        </Flex>
                        <Text
                          color={achievement.achieved ? "white" : "gray.400"}
                          fontSize="sm"
                          fontWeight={achievement.achieved ? "medium" : "normal"}
                        >
                          {achievement.title}
                        </Text>
                      </HStack>
                    ))}
                  </SimpleGrid>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.800" borderTop="1px" borderColor="gray.700">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                colorScheme="gray"
                mr={3}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                leftIcon={<FaSave />}
                colorScheme="cyan"
                onClick={handleSave}
                bgGradient="linear(to-r, cyan.500, purple.500)"
                _hover={{
                  bgGradient: "linear(to-r, cyan.400, purple.400)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)"
                }}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              colorScheme="gray"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Profile;