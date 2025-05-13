import React, { useState } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  useToast,
  Link,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simple client-side mock registration
      if (username && email && password) {
        // In a real app, this would be sent to a server
        const mockUser = {
          id: Date.now().toString(),
          username,
          email,
          gameProgress: []
        };

        const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        
        // Store the mock data
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        setTimeout(() => {
          // Call the onRegister callback with our mock user data
          onRegister(mockUser);

          toast({
            title: 'Registration successful',
            description: `Welcome, ${username}!`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          navigate('/');
        }, 800); // Small delay to simulate network request
      } else {
        throw new Error('Please fill out all required fields');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <Box
      w="100%"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#111111"
      p={6}
      position="relative"
      overflow="hidden"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(0,255,255,0.03) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="150%"
        height="150%"
        background="radial-gradient(circle at center, rgba(0,255,255,0.02) 0%, rgba(0,0,0,0) 60%)"
        opacity={0.5}
        pointerEvents="none"
      />
      <Box
        p={8}
        maxWidth="400px"
        width="100%"
        borderWidth="1px"
        borderRadius="2xl"
        borderColor="rgba(0,255,255,0.1)"
        bg="rgba(26, 32, 44, 0.95)"
        backdropFilter="blur(10px)"
        boxShadow="0 0 20px rgba(0, 255, 255, 0.2)"
        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: 'translateY(-5px)',
          boxShadow: "0 0 40px rgba(0, 255, 255, 0.3)",
        }}
      >
        <VStack align="stretch" spacing={4}>
          <Heading 
            size="lg"
            bgGradient="linear(to-r, cyan.400, purple.500)"
            bgClip="text"
            textAlign="center"
            letterSpacing="tight"
            mb={2}
          >
            Create Account
          </Heading>
          <Text 
            color="gray.300" 
            fontSize="md" 
            textAlign="center"
            pb={4}
            borderBottom="1px solid"
            borderColor="whiteAlpha.100"
          >
            Join the Cluj-Napoca explorer community
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel color="gray.300" fontSize="sm" fontWeight="medium">Username</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="cyan.400">
                    <FaUser />
                  </InputLeftElement>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    bg="gray.900"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{
                      borderColor: "cyan.400",
                      bg: "gray.800"
                    }}
                    _focus={{
                      borderColor: "cyan.400",
                      boxShadow: "0 0 0 1px rgba(0, 255, 255, 0.3)",
                      bg: "gray.800"
                    }}
                  />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="gray.300" fontSize="sm" fontWeight="medium">Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="cyan.400">
                    <FaEnvelope />
                  </InputLeftElement>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    bg="gray.900"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{
                      borderColor: "cyan.400",
                      bg: "gray.800"
                    }}
                    _focus={{
                      borderColor: "cyan.400",
                      boxShadow: "0 0 0 1px rgba(0, 255, 255, 0.3)",
                      bg: "gray.800"
                    }}
                  />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="gray.300" fontSize="sm" fontWeight="medium">Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="cyan.400">
                    <FaLock />
                  </InputLeftElement>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    bg="gray.900"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{
                      borderColor: "cyan.400",
                      bg: "gray.800"
                    }}
                    _focus={{
                      borderColor: "cyan.400",
                      boxShadow: "0 0 0 1px rgba(0, 255, 255, 0.3)",
                      bg: "gray.800"
                    }}
                  />
                </InputGroup>
              </FormControl>
              <Button
                type="submit"
                width="full"
                bgGradient="linear(to-r, cyan.400, purple.500)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, cyan.500, purple.600)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 20px -10px rgba(0, 255, 255, 0.3)"
                }}
                _active={{
                  transform: "translateY(0)",
                  bgGradient: "linear(to-r, cyan.600, purple.700)"
                }}
                isLoading={isLoading}
                loadingText="Creating Account..."
                fontSize="md"
                py={6}
                mt={2}
              >
                Sign Up
              </Button>
            </VStack>
          </form>
          <Text mt={6} color="gray.400" fontSize="sm" textAlign="center">
            Already have an account?{' '}
            <Link 
              as={RouterLink}
              to="/login"
              color="cyan.400" 
              position="relative"
              _hover={{
                color: "cyan.300",
                textDecoration: "none",
                _after: {
                  transform: "scaleX(1)"
                }
              }}
              _after={{
                content: '""',
                position: "absolute",
                width: "100%",
                height: "1px",
                bottom: "-1px",
                left: 0,
                background: "linear-gradient(to right, cyan.400, purple.500)",
                transform: "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.3s ease"
              }}
            >
              Sign In
            </Link>
          </Text>
          <Text color="gray.500" fontSize="xs" textAlign="center" mt={2}>
            For demo purposes, any details will work
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default Register; 