import React, { useState } from 'react';
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
  useDisclosure,
  useColorModeValue,
  Container,
  Heading,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  CloseIcon, 
  ChevronDownIcon,
  InfoIcon,
  StarIcon,
  SettingsIcon
} from '@chakra-ui/icons';
import { FaMapMarkedAlt, FaCamera } from 'react-icons/fa';

const Navbar = ({ onNavigate }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRoute, setSelectedRoute] = useState('home');

  const handleNavigation = (route) => {
    setSelectedRoute(route);
    onNavigate(route);
    onClose();
  };

  return (
    <Box 
      position="sticky" 
      top="0" 
      zIndex="1000" 
      bg="rgba(0, 0, 0, 0.8)"
      backdropFilter="blur(10px)"
      borderBottom="1px" 
      borderColor="whiteAlpha.200"
      py={2}
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            variant="ghost"
            colorScheme="whiteAlpha"
          />
          
          <HStack spacing={8} alignItems="center">
            <Heading 
              size="md" 
              bgGradient="linear(to-r, cyan.400, purple.500)" 
              bgClip="text"
              fontWeight="extrabold"
              cursor="pointer"
              onClick={() => handleNavigation('home')}
            >
              Cluj Explorer
            </Heading>
            
            <HStack as="nav" spacing={6} display={{ base: 'none', md: 'flex' }}>
              <Button
                leftIcon={<FaCamera />}
                variant={selectedRoute === 'challenge' ? "solid" : "ghost"} 
                colorScheme={selectedRoute === 'challenge' ? "purple" : "whiteAlpha"}
                onClick={() => handleNavigation('challenge')}
                size="md"
                fontWeight="medium"
                px={4}
                _hover={{
                  bg: "whiteAlpha.200",
                  transform: "translateY(-2px)",
                  transition: "all 0.2s"
                }}
              >
                Photo Challenge
              </Button>
              
              <Button
                leftIcon={<FaMapMarkedAlt />}
                variant={selectedRoute === 'explorer' ? "solid" : "ghost"}
                colorScheme={selectedRoute === 'explorer' ? "cyan" : "whiteAlpha"}
                onClick={() => handleNavigation('explorer')}
                size="md"
                fontWeight="medium"
                px={4}
                _hover={{
                  bg: "whiteAlpha.200",
                  transform: "translateY(-2px)",
                  transition: "all 0.2s"
                }}
              >
                Location Explorer
              </Button>
            </HStack>
          </HStack>

          <Menu>
            <MenuButton
              as={Button}
              variant="outline"
              colorScheme="purple"
              rightIcon={<ChevronDownIcon />}
              borderRadius="full"
              borderWidth="2px"
              _hover={{
                bg: "whiteAlpha.200",
                borderColor: "cyan.400"
              }}
              _active={{
                bg: "whiteAlpha.300",
              }}
            >
              Menu
            </MenuButton>
            <MenuList bg="gray.900" borderColor="whiteAlpha.300">
              <MenuItem 
                icon={<InfoIcon />} 
                onClick={() => handleNavigation('about')}
                _hover={{ bg: "whiteAlpha.200" }}
              >
                About Cluj-Napoca
              </MenuItem>
              <MenuItem 
                icon={<StarIcon />} 
                onClick={() => handleNavigation('favorites')}
                _hover={{ bg: "whiteAlpha.200" }}
              >
                My Favorites
              </MenuItem>
              <MenuItem 
                icon={<SettingsIcon />} 
                onClick={() => handleNavigation('settings')}
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Settings
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        {/* Mobile drawer menu */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent bg="gray.900" color="white">
            <DrawerCloseButton />
            <DrawerHeader 
              bgGradient="linear(to-r, cyan.400, purple.500)" 
              bgClip="text"
            >
              Cluj Explorer
            </DrawerHeader>
            <DrawerBody>
              <VStack align="stretch" spacing={4} mt={4}>
                <Button
                  leftIcon={<FaCamera />}
                  variant={selectedRoute === 'challenge' ? "solid" : "ghost"}
                  colorScheme={selectedRoute === 'challenge' ? "purple" : "whiteAlpha"}
                  onClick={() => handleNavigation('challenge')}
                  justifyContent="flex-start"
                >
                  Photo Challenge
                </Button>
                
                <Button
                  leftIcon={<FaMapMarkedAlt />}
                  variant={selectedRoute === 'explorer' ? "solid" : "ghost"}
                  colorScheme={selectedRoute === 'explorer' ? "cyan" : "whiteAlpha"}
                  onClick={() => handleNavigation('explorer')}
                  justifyContent="flex-start"
                >
                  Location Explorer
                </Button>
                
                <Button
                  leftIcon={<InfoIcon />}
                  variant={selectedRoute === 'about' ? "solid" : "ghost"}
                  colorScheme="whiteAlpha"
                  onClick={() => handleNavigation('about')}
                  justifyContent="flex-start"
                >
                  About Cluj-Napoca
                </Button>
                
                <Button
                  leftIcon={<StarIcon />}
                  variant={selectedRoute === 'favorites' ? "solid" : "ghost"}
                  colorScheme="whiteAlpha"
                  onClick={() => handleNavigation('favorites')}
                  justifyContent="flex-start"
                >
                  My Favorites
                </Button>
                
                <Button
                  leftIcon={<SettingsIcon />}
                  variant={selectedRoute === 'settings' ? "solid" : "ghost"}
                  colorScheme="whiteAlpha"
                  onClick={() => handleNavigation('settings')}
                  justifyContent="flex-start"
                >
                  Settings
                </Button>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Container>
    </Box>
  );
};

export default Navbar; 