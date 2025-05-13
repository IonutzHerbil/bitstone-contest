import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  SimpleGrid,
  Flex,
  Badge,
  Link,
  Divider,
  useColorModeValue,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { FaCamera, FaMapMarkerAlt, FaHistory, FaLandmark, FaClock } from 'react-icons/fa';

const Feature = ({ icon, title, children }) => {
  return (
    <VStack 
      align="start" 
      bg="background.secondary" 
      p={6} 
      borderRadius="xl" 
      spacing={4}
      borderWidth="1px"
      borderColor="rgba(0, 178, 255, 0.1)"
      boxShadow="0 0 20px rgba(0, 178, 255, 0.05)"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: '0 0 30px rgba(0, 178, 255, 0.1)',
      }}
      transition="all 0.3s"
    >
      <Flex 
        align="center" 
        justify="center" 
        bg="background.tertiary" 
        p={3} 
        borderRadius="lg"
        boxShadow="0 0 15px rgba(0, 178, 255, 0.1)"
      >
        <Icon as={icon} boxSize={6} color="accent.primary" />
      </Flex>
      <Heading size="md" fontWeight="600" bgGradient="linear(to-r, accent.primary, accent.secondary)" bgClip="text">
        {title}
      </Heading>
      <Text color="whiteAlpha.800">{children}</Text>
    </VStack>
  );
};

const About = () => {
  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={12} align="stretch">
        {/* Hero section */}
        <VStack spacing={5} textAlign="center">
          <Heading 
            size="2xl" 
            bgGradient="linear(to-r, accent.primary, accent.secondary)" 
            bgClip="text"
            lineHeight="1.2"
            letterSpacing="tight"
          >
            Discover Cluj-Napoca
          </Heading>
          <Text fontSize="xl" maxW="container.md" mx="auto" color="whiteAlpha.800">
            Explore the historical and cultural landmarks of one of Romania's most vibrant cities
            through interactive photo challenges and guided exploration.
          </Text>
        </VStack>

        {/* About the city */}
        <Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
            <VStack align="start" spacing={6} justifyContent="center">
              <Badge colorScheme="purple" px={3} py={1} borderRadius="full">About the City</Badge>
              <Heading size="lg">Cluj-Napoca: Transylvania's Cultural Heart</Heading>
              <Text color="whiteAlpha.800">
                Cluj-Napoca is the unofficial capital of Transylvania and one of Romania's most 
                vibrant and cosmopolitan cities. With a history dating back to ancient Dacian 
                settlements and Roman occupation, the city blends centuries of architectural 
                heritage with modern innovation and a lively student atmosphere.
              </Text>
              <Text color="whiteAlpha.800">
                Home to prestigious universities, thriving tech sector, and numerous cultural 
                festivals, Cluj-Napoca offers visitors an authentic glimpse into Romanian culture
                while providing all the amenities of a modern European city.
              </Text>
            </VStack>
            <Box 
              borderRadius="xl" 
              overflow="hidden" 
              boxShadow="0 0 30px rgba(0, 178, 255, 0.15)"
              position="relative"
            >
              <Image 
                src="https://images.unsplash.com/photo-1597210159038-a364fd9fbe5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80" 
                alt="Cluj-Napoca panorama" 
                w="100%" 
                h="100%" 
                objectFit="cover"
              />
              <Box 
                position="absolute" 
                bottom={0} 
                left={0} 
                right={0} 
                bg="rgba(0,0,0,0.7)" 
                p={4}
                backdropFilter="blur(5px)"
              >
                <Text fontSize="sm" color="whiteAlpha.900">
                  The stunning panorama of Cluj-Napoca with its blend of historical and modern architecture
                </Text>
              </Box>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Features */}
        <Box>
          <VStack align="start" spacing={8}>
            <Heading size="lg">About Cluj Explorer App</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="100%">
              <Feature icon={FaCamera} title="Photo Challenge Game">
                Test your exploration skills through our photo challenges. Find landmarks around Cluj-Napoca
                and capture them to earn points and learn about the city's rich history.
              </Feature>
              <Feature icon={FaMapMarkerAlt} title="Location Explorer">
                Upload photos of any landmark in Cluj-Napoca and let our AI identify it for you. Save
                locations to your collection and build your personal city guide.
              </Feature>
              <Feature icon={FaHistory} title="Historical Insights">
                Discover hidden stories and fascinating facts about Cluj-Napoca's landmarks, curated by local historians
                and enhanced by cutting-edge AI technology.
              </Feature>
            </SimpleGrid>
          </VStack>
        </Box>

        {/* How to use */}
        <Box pt={8}>
          <VStack spacing={8} align="start">
            <Heading size="lg">How to Use Cluj Explorer</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
              <Box>
                <HStack mb={4}>
                  <Icon as={FaLandmark} color="accent.primary" boxSize={6} />
                  <Heading size="md">Photo Challenge</Heading>
                </HStack>
                <Text color="whiteAlpha.800" mb={4}>
                  1. Select a game mode from the home screen<br />
                  2. Follow the clues to find famous landmarks<br />
                  3. Take photos to verify your discoveries<br />
                  4. Earn points and complete your collection
                </Text>
              </Box>
              <Box>
                <HStack mb={4}>
                  <Icon as={FaClock} color="accent.secondary" boxSize={6} />
                  <Heading size="md">Location Explorer</Heading>
                </HStack>
                <Text color="whiteAlpha.800" mb={4}>
                  1. Navigate to the Explorer tab<br />
                  2. Upload a photo of any Cluj landmark<br />
                  3. Get instant identification and information<br />
                  4. Save to your collection with personal notes
                </Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Box>

        {/* Footer */}
        <Box pt={12}>
          <Divider mb={8} />
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="start">
              <Heading size="sm" mb={2}>Cluj Explorer</Heading>
              <Text fontSize="sm" color="whiteAlpha.700">
                © 2023 Cluj Explorer App. Created with love for the city of Cluj-Napoca.
              </Text>
            </VStack>
            <VStack align={{ base: "start", md: "end" }}>
              <Heading size="sm" mb={2}>Credits</Heading>
              <Text fontSize="sm" color="whiteAlpha.700">
                Photos from Unsplash • Powered by OpenAI Vision
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
};

export default About; 