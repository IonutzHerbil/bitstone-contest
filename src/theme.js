import { extendTheme } from '@chakra-ui/react';

// Create styles separately for proper import handling
const globalStyles = {
  body: {
    bg: 'background.primary',
    color: 'white',
  },
};

const theme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
  fonts: {
    heading: '"Outfit", sans-serif',
    body: '"DM Sans", sans-serif',
  },
  colors: {
    brand: {
      50: '#e6ffff',
      100: '#b3ffff',
      200: '#80ffff',
      300: '#4dffff',
      400: '#1affff',
      500: '#00e6e6',
      600: '#00b3b3',
      700: '#008080',
      800: '#004d4d',
      900: '#001a1a',
    },
    background: {
      primary: '#0B0F19',
      secondary: '#111927',
      tertiary: '#1A202C',
    },
    accent: {
      primary: '#00B2FF',
      secondary: '#7928CA',
      tertiary: '#00DFD8',
    },
  },
  styles: {
    global: {
      ...globalStyles,
    }
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'accent.primary',
          color: 'white',
          _hover: {
            bg: 'cyan.400',
            boxShadow: '0 0 20px rgba(0, 178, 255, 0.5)',
          },
          _active: {
            bg: 'cyan.600',
          },
        },
        secondary: {
          bg: 'accent.secondary',
          color: 'white',
          _hover: {
            bg: 'purple.500',
            boxShadow: '0 0 20px rgba(121, 40, 202, 0.5)',
          },
          _active: {
            bg: 'purple.700',
          },
        },
        gradient: {
          bgGradient: 'linear(to-r, accent.primary, accent.secondary)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, cyan.400, purple.500)',
            boxShadow: '0 0 20px rgba(0, 178, 255, 0.5)',
          },
          _active: {
            bgGradient: 'linear(to-r, cyan.600, purple.700)',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'background.secondary',
          borderRadius: 'xl',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0, 178, 255, 0.1)',
          borderWidth: '1px',
          borderColor: 'rgba(0, 178, 255, 0.1)',
          transition: 'all 0.3s',
          _hover: {
            boxShadow: '0 0 30px rgba(0, 178, 255, 0.2)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: {
            _selected: {
              color: 'white',
              bg: 'accent.primary',
            },
            borderRadius: 'lg',
            mx: 1,
          },
        },
      },
    },
  },
});

// Import fonts using <link> tags in index.html instead of CSS @import
// This avoids the @import CSS rule error

export default theme; 