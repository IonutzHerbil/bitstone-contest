import React from 'react';
import { ChakraProvider, Container, Box } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import PhotoGame from './components/PhotoGame';

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
          <PhotoGame />
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 