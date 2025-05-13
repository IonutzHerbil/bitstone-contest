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
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaUser, FaLock } from 'react-icons/fa';
import config from '../config';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMigratingLocations, setIsMigratingLocations] = useState(false);
  const toast = useToast();

  // Function to migrate local saved locations to the server
  const migrateLocalLocations = async (token) => {
    try {
      setIsMigratingLocations(true);
      
      // Get locally saved locations
      const localLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
      
      if (localLocations.length === 0) {
        return; // No locations to migrate
      }
      
      // For each location, save it to the server
      for (const location of localLocations) {
        try {
          await fetch(`${config.apiBaseUrl}/api/auth/locations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ location }),
          });
        } catch (err) {
          console.error('Error migrating location:', location.id, err);
        }
      }
      
      // Show success message
      toast({
        title: 'Collection migrated',
        description: `${localLocations.length} locations from your local collection were added to your account.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Clear local locations after successful migration
      localStorage.removeItem('savedLocations');
    } catch (err) {
      console.error('Error during migration:', err);
      toast({
        title: 'Migration incomplete',
        description: 'Some locations may not have been transferred. They remain in your local storage.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsMigratingLocations(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Add logging for debugging
      console.log(`Attempting to login with API URL: ${config.apiBaseUrl}/api/auth/login`);
      
      const response = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', [...response.headers.entries()]);

      // Check content type before parsing as JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Received non-JSON response:", textResponse);
        throw new Error("The server returned an invalid response. Please try again later.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Migrate local locations to the server
      await migrateLocalLocations(data.token);
      
      // Notify parent component about login
      onLogin(data.user);

      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
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
            Welcome Back
          </Heading>
          <Text 
            color="gray.300" 
            fontSize="md" 
            textAlign="center"
            pb={4}
            borderBottom="1px solid"
            borderColor="whiteAlpha.100"
          >
            Sign in to continue your photo challenge journey
          </Text>

          {/* Display migration alert if there are local locations */}
          {JSON.parse(localStorage.getItem('savedLocations') || '[]').length > 0 && (
            <Alert status="info" borderRadius="md" fontSize="sm">
              <AlertIcon />
              Signing in will transfer your locally saved locations to your account.
            </Alert>
          )}

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
                    placeholder="Enter your username"
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
                    placeholder="Enter your password"
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
                isLoading={isLoading || isMigratingLocations}
                loadingText={isMigratingLocations ? "Migrating Collection..." : "Signing In..."}
                fontSize="md"
                py={6}
                mt={2}
              >
                Sign In
              </Button>
            </VStack>
          </form>
          <Text mt={6} color="gray.400" fontSize="sm" textAlign="center">
            Don't have an account?{' '}
            <Link 
              color="cyan.400" 
              href="/register"
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
              Sign Up
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login; 