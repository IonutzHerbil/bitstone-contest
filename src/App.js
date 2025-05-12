import React from 'react';
import { ChakraProvider, Container, VStack, Heading, Box } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import ImageUploader from './components/ImageUploader';
import LocationDisplay from './components/LocationDisplay';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'black',
        color: 'white',
      },
    },
  },
  components: {
    Container: {
      baseStyle: {
        maxW: 'container.md',
        px: [4, 6],
        py: [6, 8],
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="black" color="white">
        <Container maxW="container.md" py={8}>
          <VStack spacing={8}>
            <Heading 
              bgGradient="linear(to-r, cyan.400, purple.500)" 
              bgClip="text" 
              fontSize={["2xl", "3xl"]}
              fontWeight="extrabold"
            >
              Cluj-Napoca Landmark Detector
            </Heading>
            <ImageUploader />
            <LocationDisplay />
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 