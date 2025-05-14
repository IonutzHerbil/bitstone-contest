import React from 'react';
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
  Divider,
  useColorModeValue,
  Flex,
  Icon,
  Image,
  Link,
  Grid,
  GridItem,
  UnorderedList,
  ListItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  SimpleGrid
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCamera, FaGithub, FaHeart, FaBook, FaQuestionCircle, FaGamepad, FaLightbulb, FaInfoCircle } from 'react-icons/fa';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const About = ({ isOpen, onClose }) => {
  const overlayBg = useColorModeValue('blackAlpha.700', 'blackAlpha.800');
  const modalBg = useColorModeValue('gray.900', 'gray.900');
  const cardBg = "rgba(26, 32, 44, 0.6)";
  const borderColor = useColorModeValue("whiteAlpha.300", "whiteAlpha.200");
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="3xl" 
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
        {/* Header Banner */}
        <Box
          bgImage="url('https://images.unsplash.com/photo-1585208798174-6cedd86e019a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80')"
          bgSize="cover"
          bgPos="center"
          height="200px"
          position="relative"
          _after={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: "linear-gradient(to bottom, rgba(23, 25, 35, 0.5), rgba(23, 25, 35, 0.9))",
            zIndex: 1
          }}
        >
          <Flex
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            p={6}
            flexDir="column"
            zIndex={2}
          >
            <Heading 
              size="xl" 
              color="white" 
              bgGradient="linear(to-r, cyan.400, purple.400)"
              bgClip="text"
              textShadow="0 2px 10px rgba(0, 0, 0, 0.3)"
            >
              About PoliPhotoQuest
            </Heading>
            <Text color="gray.300" mt={2}>
              Explore Cluj-Napoca's hidden gems through photography
            </Text>
          </Flex>
        </Box>
        
        <ModalCloseButton color="white" zIndex={3} />
        
        <ModalBody p={6}>
          <VStack spacing={8} align="stretch">
            {/* App Description */}
            <Box 
              p={6} 
              bg={cardBg} 
              borderRadius="lg" 
              borderWidth="1px" 
              borderColor={borderColor}
              backdropFilter="blur(8px)"
            >
              <Heading 
                size="md" 
                mb={4} 
                display="flex" 
                alignItems="center"
                color="white"
              >
                <Icon as={FaInfoCircle} color="cyan.400" mr={2} />
                What is PoliPhotoQuest?
              </Heading>
              
              <Text color="gray.300" mb={4} lineHeight="taller">
                PoliPhotoQuest is an interactive photography game that encourages users to explore
                Cluj-Napoca through a series of photo challenges. Discover historical landmarks,
                hidden corners, and beautiful locations while improving your photography skills
                and learning about the city's rich history and culture.
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={6}>
                <Box 
                  p={4} 
                  borderRadius="md" 
                  bg="rgba(49, 151, 149, 0.2)"
                  borderWidth="1px"
                  borderColor="cyan.800"
                >
                  <Flex align="center" mb={2}>
                    <Icon as={FaCamera} color="cyan.400" boxSize={5} mr={2} />
                    <Text color="white" fontWeight="medium">Capture</Text>
                  </Flex>
                  <Text color="gray.300" fontSize="sm">
                    Take photos of specific locations and landmarks around the city
                  </Text>
                </Box>
                
                <Box 
                  p={4} 
                  borderRadius="md" 
                  bg="rgba(76, 81, 191, 0.2)"
                  borderWidth="1px"
                  borderColor="purple.800"
                >
                  <Flex align="center" mb={2}>
                    <Icon as={FaMapMarkerAlt} color="purple.400" boxSize={5} mr={2} />
                    <Text color="white" fontWeight="medium">Explore</Text>
                  </Flex>
                  <Text color="gray.300" fontSize="sm">
                    Discover new places and hidden gems throughout Cluj-Napoca
                  </Text>
                </Box>
                
                <Box 
                  p={4} 
                  borderRadius="md" 
                  bg="rgba(245, 101, 101, 0.2)"
                  borderWidth="1px"
                  borderColor="red.800"
                >
                  <Flex align="center" mb={2}>
                    <Icon as={FaGamepad} color="red.400" boxSize={5} mr={2} />
                    <Text color="white" fontWeight="medium">Compete</Text>
                  </Flex>
                  <Text color="gray.300" fontSize="sm">
                    Earn points, unlock achievements, and compete with friends
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
            
            {/* How to Play */}
            <Box 
              p={6} 
              bg={cardBg} 
              borderRadius="lg" 
              borderWidth="1px" 
              borderColor={borderColor}
              backdropFilter="blur(8px)"
            >
              <Heading 
                size="md" 
                mb={4} 
                display="flex" 
                alignItems="center"
                color="white"
              >
                <Icon as={FaBook} color="purple.400" mr={2} />
                How to Play
              </Heading>
              
              <Accordion allowToggle defaultIndex={[0]} borderColor="gray.700">
                <AccordionItem border="none" mb={3}>
                  <AccordionButton 
                    bg="gray.800" 
                    borderRadius="md" 
                    _hover={{ bg: "gray.700" }}
                    py={3}
                  >
                    <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                      1. Choose a Game
                    </Box>
                    <AccordionIcon color="cyan.400" />
                  </AccordionButton>
                  <AccordionPanel py={4} px={5} color="gray.300">
                    Start by selecting a photo game from the available options. Each game has a 
                    different theme and set of locations to explore around Cluj-Napoca. Games range 
                    from historical landmarks to modern architecture and natural landscapes.
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="none" mb={3}>
                  <AccordionButton 
                    bg="gray.800" 
                    borderRadius="md" 
                    _hover={{ bg: "gray.700" }}
                    py={3}
                  >
                    <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                      2. Visit Locations
                    </Box>
                    <AccordionIcon color="cyan.400" />
                  </AccordionButton>
                  <AccordionPanel py={4} px={5} color="gray.300">
                    Use the map to navigate to the indicated locations. Each location will have 
                    specific photo challenges for you to complete. The app will use your device's 
                    GPS to verify that you're at the correct location.
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="none" mb={3}>
                  <AccordionButton 
                    bg="gray.800" 
                    borderRadius="md" 
                    _hover={{ bg: "gray.700" }}
                    py={3}
                  >
                    <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                      3. Take Photos
                    </Box>
                    <AccordionIcon color="cyan.400" />
                  </AccordionButton>
                  <AccordionPanel py={4} px={5} color="gray.300">
                    Once at a location, take photos according to the challenge requirements. The app 
                    will guide you with tips and examples of what to capture. Be creative and try to 
                    find unique perspectives!
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="none">
                  <AccordionButton 
                    bg="gray.800" 
                    borderRadius="md" 
                    _hover={{ bg: "gray.700" }}
                    py={3}
                  >
                    <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                      4. Earn Points & Complete Games
                    </Box>
                    <AccordionIcon color="cyan.400" />
                  </AccordionButton>
                  <AccordionPanel py={4} px={5} color="gray.300">
                    Each completed photo challenge earns you points. Accumulate points to unlock 
                    achievements and complete games. Your progress is saved, so you can continue your 
                    exploration over multiple sessions. Complete all locations in a game to mark it as finished!
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
            
            {/* About Cluj-Napoca */}
            <Box 
              p={6} 
              bg={cardBg} 
              borderRadius="lg" 
              borderWidth="1px" 
              borderColor={borderColor}
              backdropFilter="blur(8px)"
            >
              <Heading 
                size="md" 
                mb={4} 
                display="flex" 
                alignItems="center"
                color="white"
              >
                <Icon as={FaMapMarkerAlt} color="red.400" mr={2} />
                About Cluj-Napoca
              </Heading>
              
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                <GridItem>
                  <Text color="gray.300" lineHeight="taller">
                    Cluj-Napoca, often called simply Cluj, is the second most populous city in Romania and the seat 
                    of Cluj County. Located in the northwestern part of the country, it's a vibrant cultural 
                    and economic center with a rich history dating back to Roman times.
                  </Text>
                  
                  <Text color="gray.300" mt={4} lineHeight="taller">
                    Home to Romania's largest university, Babeș-Bolyai University, Cluj is known for its 
                    youthful atmosphere, flourishing arts scene, and growing IT sector. The city combines 
                    historical architecture with modern development, creating a unique urban landscape.
                  </Text>
                </GridItem>
                
                <GridItem>
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Badge colorScheme="cyan" px={2} py={1} borderRadius="md">History</Badge>
                      <Text color="gray.300" fontSize="sm">
                        Founded by Romans as Napoca in 106 AD
                      </Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="purple" px={2} py={1} borderRadius="md">Population</Badge>
                      <Text color="gray.300" fontSize="sm">
                        Approximately 320,000 inhabitants
                      </Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="pink" px={2} py={1} borderRadius="md">Known for</Badge>
                      <Text color="gray.300" fontSize="sm">
                        Universities, IT hub, cultural festivals
                      </Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="orange" px={2} py={1} borderRadius="md">Landmarks</Badge>
                      <Text color="gray.300" fontSize="sm">
                        St. Michael's Church, Botanical Garden, Union Square
                      </Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="green" px={2} py={1} borderRadius="md">Events</Badge>
                      <Text color="gray.300" fontSize="sm">
                        TIFF Film Festival, Electric Castle, Untold Festival
                      </Text>
                    </HStack>
                  </VStack>
                </GridItem>
              </Grid>
            </Box>
            
            {/* About the Developers */}
            <Box 
              p={6} 
              bg={cardBg} 
              borderRadius="lg" 
              borderWidth="1px" 
              borderColor={borderColor}
              backdropFilter="blur(8px)"
            >
              <Heading 
                size="md" 
                mb={4} 
                display="flex" 
                alignItems="center"
                color="white"
              >
                <Icon as={FaLightbulb} color="yellow.400" mr={2} />
                About the Project
              </Heading>
              
              <Text color="gray.300" lineHeight="taller" mb={4}>
                PoliPhotoQuest was created as part of the Bitstone contest, aiming to promote tourism 
                and cultural awareness in Cluj-Napoca. The app combines gamification elements with photography 
                to create an engaging way to explore the city.
              </Text>
              
              <HStack mt={6} spacing={4}>
                <Link 
                  href="https://github.com/IonutzHerbil/bitstone-contest" 
                  isExternal
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button
                    leftIcon={<FaGithub />}
                    bg="gray.800"
                    color="white"
                    _hover={{
                      bg: "gray.700",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                    }}
                    size="sm"
                  >
                    GitHub Repository
                  </Button>
                </Link>
              </HStack>
              
              <Divider my={6} borderColor="gray.700" />
              
              <Text color="gray.500" fontSize="sm" textAlign="center">
                Created with <Icon as={FaHeart} color="red.400" mx={1} /> in Cluj-Napoca
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.800" borderTop="1px" borderColor="gray.700">
          <Button colorScheme="gray" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default About;