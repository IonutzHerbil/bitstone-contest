import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
  Image,
  Container,
  Heading,
  Avatar,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ExternalLinkIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FaCamera, FaMapMarkerAlt, FaSignInAlt, FaInfoCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const NavLink = ({ children, icon, to, ...rest }) => (
  <RouterLink to={to}>
    <Button
      px={4}
      py={2}
      rounded="md"
      variant="ghost"
      color="whiteAlpha.800"
      fontWeight="medium"
      leftIcon={icon}
      _hover={{
        textDecoration: 'none',
        bg: 'whiteAlpha.100',
        color: 'white',
      }}
      {...rest}
    >
      {children}
    </Button>
  </RouterLink>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user data on component mount and when localStorage changes
    const checkUserData = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    checkUserData();
    
    // Listen for storage changes
    window.addEventListener('storage', checkUserData);
    window.addEventListener('userDataUpdate', checkUserData);
    
    return () => {
      window.removeEventListener('storage', checkUserData);
      window.removeEventListener('userDataUpdate', checkUserData);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    
    // Dispatch custom event to update other components
    window.dispatchEvent(new Event('userDataUpdate'));
  };

  return (
    <Box 
      borderBottom="1px" 
      borderColor="rgba(0,255,255,0.1)" 
      bg="rgba(13, 16, 22, 0.95)"
      backdropFilter="blur(10px)"
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.15)"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            variant="outline"
            colorScheme="cyan"
          />
          <HStack spacing={8} alignItems={'center'}>
            <Flex align="center">
              <Box
                bg="cyan.500"
                p={1}
                borderRadius="md"
                mr={2}
                boxShadow="0 0 10px rgba(0, 255, 255, 0.5)"
              >
                <FaCamera size="1.5em" color="white" />
              </Box>
              <Heading
                as={RouterLink}
                to="/"
                size="md"
                bgGradient="linear(to-r, cyan.400, purple.500)"
                bgClip="text"
                fontWeight="bold"
                letterSpacing="tight"
                _hover={{
                  textDecoration: 'none',
                  bgGradient: "linear(to-r, cyan.300, purple.400)",
                }}
              >
                Cluj Explorer
              </Heading>
            </Flex>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLink to="/" icon={<FaCamera />}>Photo Challenge</NavLink>
              <NavLink to="/explorer" icon={<FaMapMarkerAlt />}>Location Explorer</NavLink>
              <NavLink to="/about" icon={<FaInfoCircle />}>About</NavLink>
            </HStack>
          </HStack>
          
          <Flex alignItems={'center'}>
            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                  colorScheme="cyan"
                  rightIcon={<ChevronDownIcon />}
                >
                  <Avatar
                    size={'sm'}
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                    borderWidth={2}
                    borderColor="cyan.400"
                  />
                </MenuButton>
                <MenuList 
                  bg="gray.800" 
                  borderColor="gray.700"
                  boxShadow="0 0 20px rgba(0, 255, 255, 0.2)"
                >
                  <MenuItem 
                    bg="gray.800" 
                    _hover={{ bg: 'gray.700' }} 
                    icon={<FaUser />}
                  >
                    Profile
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem 
                    bg="gray.800" 
                    _hover={{ bg: 'gray.700' }}
                    icon={<FaSignOutAlt />}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                as={RouterLink}
                to="/login"
                colorScheme="cyan"
                variant="outline"
                leftIcon={<FaSignInAlt />}
                size="sm"
              >
                Sign In
              </Button>
            )}
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              <NavLink to="/" icon={<FaCamera />}>Photo Challenge</NavLink>
              <NavLink to="/explorer" icon={<FaMapMarkerAlt />}>Location Explorer</NavLink>
              <NavLink to="/about" icon={<FaInfoCircle />}>About</NavLink>
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default Navbar; 