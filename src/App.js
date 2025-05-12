import React from 'react';
import { ChakraProvider, Container, VStack, Heading } from '@chakra-ui/react';
import ImageUploader from './components/ImageUploader';
import LocationDisplay from './components/LocationDisplay';

function App() {
  return (
    <ChakraProvider>
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <Heading>Cluj-Napoca Landmark Detector</Heading>
          <ImageUploader />
          <LocationDisplay />
        </VStack>
      </Container>
    </ChakraProvider>
  );
}

export default App; 