import React from 'react';
import { Box, Container, Flex, Text, HStack, VStack, Link as ChakraLink, Divider, Icon, Button, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebook, FaGithub, FaHeart } from 'react-icons/fa';
import { MdEmail, MdLocationOn } from 'react-icons/md';

const Footer = ({ onViewChange }) => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  
  // Enhanced styling with subtle glass-like effect
  const footerBg = "rgba(17, 25, 40, 0.95)";
  const borderColor = useColorModeValue("whiteAlpha.300", "whiteAlpha.200");
  const glowColor = "rgba(0, 255, 255, 0.1)";
  
  return (
    <Box 
      as="footer" 
      bg={footerBg}
      backgroundImage="radial-gradient(circle at 40% 20%, rgba(128, 0, 128, 0.05) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(0, 255, 255, 0.05) 0%, transparent 45%)"
      borderTop="1px"
      borderColor={borderColor}
      py={12}
      mt={16}
      position="relative"
      boxShadow="0 -10px 30px -15px rgba(0, 0, 0, 0.3)"
      _before={{
        content: '""',
        position: 'absolute',
        top: '-2px',
        left: '0',
        right: '0',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent)',
      }}
    >
      <Container maxW="container.xl">
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'center', md: 'flex-start' }}
          gap={10}
        >
          {/* Left Section - Enhanced */}
          <VStack align={{ base: 'center', md: 'flex-start' }} spacing={5} flex="1.2">
            <Text 
              fontSize="2xl" 
              fontWeight="bold" 
              bgGradient="linear(to-r, cyan.400, purple.500)"
              bgClip="text"
              letterSpacing="tight"
              textShadow="0 0 15px rgba(0, 255, 255, 0.3)"
            >
              PoliPhotoQuest
            </Text>
            <Text color="gray.300" maxW="350px" textAlign={{ base: 'center', md: 'left' }} lineHeight="taller" fontSize="md">
              Explore Cluj-Napoca through an immersive photo adventure. Discover landmarks and capture memories.
            </Text>
            <HStack spacing={5} pt={3} wrap="wrap">
              <ChakraLink 
                href="https://instagram.com" 
                isExternal
                _hover={{ transform: 'translateY(-3px)', color: 'cyan.400', boxShadow: `0 5px 15px -5px ${glowColor}` }}
                p={2}
                borderRadius="md"
                transition="all 0.3s ease"
              >
                <Icon as={FaInstagram} w={5} h={5} />
              </ChakraLink>
              <ChakraLink 
                href="https://twitter.com" 
                isExternal
                _hover={{ transform: 'translateY(-3px)', color: 'cyan.400', boxShadow: `0 5px 15px -5px ${glowColor}` }}
                p={2}
                borderRadius="md"
                transition="all 0.3s ease"
              >
                <Icon as={FaTwitter} w={5} h={5} />
              </ChakraLink>
              <ChakraLink 
                href="https://facebook.com" 
                isExternal
                _hover={{ transform: 'translateY(-3px)', color: 'cyan.400', boxShadow: `0 5px 15px -5px ${glowColor}` }}
                p={2}
                borderRadius="md"
                transition="all 0.3s ease"
              >
                <Icon as={FaFacebook} w={5} h={5} />
              </ChakraLink>
              <ChakraLink 
                href="https://github.com/IonutzHerbil/bitstone-contest"
                isExternal
                _hover={{ transform: 'translateY(-3px)', color: 'cyan.400', boxShadow: `0 5px 15px -5px ${glowColor}` }}
                p={2}
                borderRadius="md"
                transition="all 0.3s ease"
              >
                <Icon as={FaGithub} w={5} h={5} />
              </ChakraLink>
            </HStack>
          </VStack>

          {/* Right Section - Enhanced */}
          <VStack 
            align={{ base: 'center', md: 'flex-start' }} 
            spacing={5} 
            flex="1"
            p={6}
            bg="rgba(26, 32, 44, 0.4)"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
            backdropFilter="blur(10px)"
          >
            <Text 
              fontWeight="bold" 
              fontSize="lg" 
              bgGradient="linear(to-r, purple.400, pink.400)"
              bgClip="text"
            >
              Contact Us
            </Text>
            <HStack spacing={3}>
              <Icon as={MdLocationOn} color="purple.400" w={5} h={5} />
              <Text color="gray.300">Cluj-Napoca, Romania</Text>
            </HStack>
            <HStack spacing={3}>
              <Icon as={MdEmail} color="purple.400" w={5} h={5} />
              <Text color="gray.300">info@photoexplorer.com</Text>
            </HStack>
          </VStack>
        </Flex>
        
        <Divider 
          my={10} 
          borderColor="whiteAlpha.200" 
          css={{
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)"
          }}
        />
        
        <Flex 
          direction={{ base: 'column', sm: 'row' }} 
          justify="space-between"
          align="center"
          textAlign="center"
          fontSize="sm"
          color="gray.400"
          gap={4}
        >
          <Text>
            © {currentYear} PoliPhotoQuest. All rights reserved.
          </Text>
          <HStack spacing={6} justify="center">
            <ChakraLink 
              _hover={{ color: 'cyan.400', textDecoration: "none" }} 
              transition="all 0.2s"
              fontWeight="medium"
            >
              Privacy Policy
            </ChakraLink>
            <ChakraLink 
              _hover={{ color: 'cyan.400', textDecoration: "none" }} 
              transition="all 0.2s"
              fontWeight="medium"
            >
              Terms of Service
            </ChakraLink>
            <ChakraLink 
              _hover={{ color: 'cyan.400', textDecoration: "none" }} 
              transition="all 0.2s"
              fontWeight="medium"
            >
              Cookie Policy
            </ChakraLink>
          </HStack>
          <Text display="flex" alignItems="center">
            Made with <Icon as={FaHeart} color="red.400" mx={2} animation="pulse 1.5s infinite" /> in Cluj-Napoca
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;