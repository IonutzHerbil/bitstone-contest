import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useMediaQuery,
  Text,
  Heading,
  Avatar,
  Spacer,
  useColorModeValue,
  useDisclosure,
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
  ChevronDownIcon,
  InfoIcon
} from '@chakra-ui/icons';
import { FaMapMarkedAlt, FaCamera, FaSignOutAlt, FaHome, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout, onViewChange, currentView, onOpenProfile, onOpenAbout }) => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgGradient = "linear(to-r, gray.900, gray.800)";
  const activeBg = useColorModeValue('rgba(0, 255, 255, 0.15)', 'rgba(0, 255, 255, 0.15)');
  const navigate = useNavigate();
  
  const getButtonProps = (viewName) => ({
    size: 'md',
    variant: currentView === viewName ? 'solid' : 'ghost',
    colorScheme: currentView === viewName ? 'cyan' : 'whiteAlpha',
    onClick: () => {
      onViewChange(viewName);
      if (!isLargerThan768) onClose();
    },
    fontWeight: 'medium',
    px: 4,
    borderRadius: 'md',
    bg: currentView === viewName ? activeBg : 'transparent',
    color: 'white',
    _hover: {
      bg: currentView === viewName ? activeBg : 'whiteAlpha.200',
      transform: 'translateY(-2px)',
      boxShadow: currentView === viewName ? '0 4px 12px rgba(0, 255, 255, 0.2)' : 'none',
    },
    transition: 'all 0.2s',
  });

  const NavContent = () => (
    <>
      <Button 
        {...getButtonProps('home')}
        leftIcon={<FaHome />}
      >
        Home
      </Button>
      <Button 
        {...getButtonProps('game')}
        leftIcon={<FaCamera />}
      >
        Photo Games
      </Button>
      <Button 
        {...getButtonProps('explorer')}
        leftIcon={<FaMapMarkedAlt />}
      >
        Explorer
      </Button>
    </>
  );
  
  return (
    <Box
      position="sticky"
      top="0"
      zIndex="100"
      borderBottom="1px"
      borderColor="gray.800"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.25)"
      bgGradient={bgGradient}
      backdropFilter="blur(10px)"
    >
      <Flex
        px={[4, 6, 8]}
        py={4}
        align="center"
        maxW="container.xl"
        mx="auto"
      >
        {/* Logo Section */}
        <Heading 
          size="md"
          bgGradient="linear(to-r, cyan.400, purple.500)"
          bgClip="text"
          fontWeight="extrabold"
          letterSpacing="tight"
          minW="180px"
        >
          PoliPhotoQuest
        </Heading>
        
        {isLargerThan768 ? (
          <>
            {/* Navigation Section */}
            <HStack spacing={6} mx={8}>
              <NavContent />
            </HStack>
            
            {/* User Section */}
            <Spacer />
            {user && (
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon color="white" />}
                  bgGradient="linear(to-r, gray.700, gray.800)"
                  color="white"
                  _hover={{ 
                    bgGradient: "linear(to-r, cyan.900, purple.900)",
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 255, 255, 0.15)'
                  }}
                  _active={{ 
                    bgGradient: "linear(to-r, cyan.800, purple.800)",
                    transform: 'translateY(0)'
                  }}
                  transition="all 0.2s"
                  px={3}
                  py={2}
                  borderRadius="md"
                >
                  <HStack spacing={2}>
                    <Avatar size="xs" name={user.username || "User"} />
                    <Text fontSize="sm" display={{ base: 'none', md: 'block' }} color="white">
                      {user.username || "User"}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList
                  bg="gray.800"
                  borderColor="gray.700"
                  borderRadius="md"
                  boxShadow="0 10px 25px rgba(0, 0, 0, 0.5)"
                  overflow="hidden"
                  p={2}
                  minW="180px"
                  border="1px solid"
                  mt={2}
                  zIndex={100}
                >
                  <MenuItem
                    icon={<FaUser color="#4FD1C5" />}
                    fontSize="sm"
                    fontWeight="medium"
                    borderRadius="md"
                    transition="all 0.2s"
                    py={3}
                    color="white"
                    bg="transparent"
                    mb={1}
                    onClick={onOpenProfile}
                    _hover={{ 
                      bgGradient: "linear(to-r, rgba(49, 151, 149, 0.2), rgba(76, 81, 191, 0.2))",
                      transform: 'translateX(2px)'
                    }}
                    _active={{ 
                      bgGradient: "linear(to-r, rgba(49, 151, 149, 0.3), rgba(76, 81, 191, 0.3))"
                    }}
                    _focus={{
                      bgGradient: "linear(to-r, rgba(49, 151, 149, 0.2), rgba(76, 81, 191, 0.2))"
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    icon={<InfoIcon color="purple.400" />}
                    fontSize="sm"
                    fontWeight="medium"
                    borderRadius="md"
                    transition="all 0.2s"
                    py={3}
                    color="white"
                    bg="transparent"
                    mb={1}
                    onClick={onOpenAbout}
                    _hover={{ 
                      bgGradient: "linear(to-r, rgba(49, 151, 149, 0.2), rgba(76, 81, 191, 0.2))",
                      transform: 'translateX(2px)'
                    }}
                    _active={{ 
                      bgGradient: "linear(to-r, rgba(49, 151, 149, 0.3), rgba(76, 81, 191, 0.3))"
                    }}
                    _focus={{
                      bgGradient: "linear(to-r, rgba(49, 151, 149, 0.2), rgba(76, 81, 191, 0.2))"
                    }}
                  >
                    About
                  </MenuItem>
                  <Box h="1px" bg="gray.700" my={1} />
                  <MenuItem
                    icon={<FaSignOutAlt color="#FC8181" />}
                    fontSize="sm"
                    fontWeight="medium"
                    borderRadius="md"
                    transition="all 0.2s"
                    py={3}
                    color="white"
                    bg="transparent"
                    onClick={onLogout}
                    _hover={{ 
                      bgGradient: "linear(to-r, rgba(229, 62, 62, 0.2), rgba(197, 48, 48, 0.2))",
                      transform: 'translateX(2px)'
                    }}
                    _active={{ 
                      bgGradient: "linear(to-r, rgba(229, 62, 62, 0.3), rgba(197, 48, 48, 0.3))"
                    }}
                    _focus={{
                      bgGradient: "linear(to-r, rgba(229, 62, 62, 0.2), rgba(197, 48, 48, 0.2))"
                    }}
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </>
        ) : (
          <>
            <Spacer />
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              bgGradient="linear(to-r, cyan.900, purple.900)"
              color="white"
              onClick={onOpen}
              _hover={{ 
                bgGradient: "linear(to-r, cyan.800, purple.800)",
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 255, 255, 0.15)'
              }}
              _active={{ 
                bgGradient: "linear(to-r, cyan.700, purple.700)",
                transform: 'translateY(0)'
              }}
            />
            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
              <DrawerOverlay backdropFilter="blur(10px)" bg="blackAlpha.600" />
              <DrawerContent bg="gray.900">
                <DrawerCloseButton color="white" />
                <DrawerHeader
                  bgGradient="linear(to-r, cyan.900, purple.900)"
                  py={6}
                >
                  <Heading 
                    size="md"
                    bgGradient="linear(to-r, cyan.400, purple.500)"
                    bgClip="text"
                  >
                    PoliPhotoQuest
                  </Heading>
                </DrawerHeader>
                <DrawerBody py={4}>
                  <VStack align="stretch" spacing={4}>
                    <NavContent />
                    
                    <Box h="1px" bg="gray.700" my={4} />
                    
                    {user && (
                      <>
                        <Flex align="center" mb={4}>
                          <Avatar size="sm" name={user.username || "User"} mr={3} />
                          <Text fontWeight="medium" color="white">{user.username || "User"}</Text>
                        </Flex>
                        
                        <Button 
                          leftIcon={<FaUser color="#4FD1C5" />}
                          justifyContent="flex-start"
                          bg="transparent"
                          color="white"
                          onClick={() => {
                            onClose();
                            onOpenProfile();
                          }}
                          _hover={{ 
                            bg: "linear-gradient(to right, rgba(49, 151, 149, 0.2), rgba(76, 81, 191, 0.2))",
                            transform: 'translateX(2px)'
                          }}
                          _active={{ bg: "rgba(49, 151, 149, 0.3)" }}
                          transition="all 0.2s"
                          borderRadius="md"
                          py={5}
                        >
                          Profile
                        </Button>
                        <Button 
                          leftIcon={<InfoIcon color="purple.400" />}
                          justifyContent="flex-start"
                          bg="transparent"
                          color="white"
                          onClick={() => {
                            onClose();
                            onOpenAbout();
                          }}
                          _hover={{ 
                            bg: "linear-gradient(to right, rgba(49, 151, 149, 0.2), rgba(76, 81, 191, 0.2))",
                            transform: 'translateX(2px)'
                          }}
                          _active={{ bg: "rgba(76, 81, 191, 0.3)" }}
                          transition="all 0.2s"
                          borderRadius="md"
                          py={5}
                        >
                          About
                        </Button>
                        <Button 
                          leftIcon={<FaSignOutAlt color="#FC8181" />}
                          justifyContent="flex-start"
                          bgGradient="linear(to-r, red.500, red.600)"
                          color="white"
                          _hover={{ 
                            bgGradient: "linear(to-r, red.600, red.700)",
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(229, 62, 62, 0.2)'
                          }}
                          _active={{ 
                            bgGradient: "linear(to-r, red.700, red.800)",
                            transform: 'translateY(0)'
                          }}
                          transition="all 0.2s"
                          borderRadius="md"
                          onClick={onLogout}
                          py={5}
                        >
                          Logout
                        </Button>
                      </>
                    )}
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </>
        )}
      </Flex>
    </Box>
  );
};

export default Navbar;