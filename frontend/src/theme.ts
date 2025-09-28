import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    // Cores modernas para o tema light
    light: {
      bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      card: '#ffffff',
      cardHover: '#fefefe',
      input: '#f8fafc',
      border: '#e2e8f0',
      borderHover: '#cbd5e1',
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        muted: '#64748b',
        label: '#334155',
      },
      accent: '#0ea5e9',
      accentHover: '#0284c7',
    },
    // Cores customizadas para o tema dark
    dark: {
      bg: '#000000',
      card: '#111111',
      input: '#1a1a1a',
      border: 'gray.800',
      text: {
        primary: '#ffffff',
        secondary: 'gray.300',
        muted: 'gray.400',
      },
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#000000' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        color: props.colorMode === 'dark' ? '#ffffff' : '#1e293b',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        minHeight: '100vh',
      },
      '*': {
        borderColor: props.colorMode === 'dark' ? 'gray.800' : '#e2e8f0',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'xl',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'brand.500' : 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
          color: 'white',
          boxShadow: props.colorMode === 'dark' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(14, 165, 233, 0.3), 0 2px 4px -1px rgba(14, 165, 233, 0.2)',
        }),
        outline: (props: any) => ({
          borderColor: props.colorMode === 'dark' ? 'gray.600' : '#e2e8f0',
          color: props.colorMode === 'dark' ? 'gray.200' : '#475569',
          borderWidth: '2px',
        }),
        ghost: (props: any) => ({
          color: props.colorMode === 'dark' ? 'gray.300' : '#64748b',
        }),
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? '#111111' : 'white',
          borderColor: props.colorMode === 'dark' ? 'gray.800' : '#e2e8f0',
          borderRadius: '2xl',
          boxShadow: props.colorMode === 'dark' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        },
      }),
    },
    Input: {
      variants: {
        filled: (props: any) => ({
          field: {
            bg: props.colorMode === 'dark' ? '#1a1a1a' : '#f8fafc',
            border: '2px solid',
            borderColor: props.colorMode === 'dark' ? 'gray.800' : '#e2e8f0',
            color: props.colorMode === 'dark' ? 'white' : '#1e293b',
            borderRadius: 'xl',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.700' : '#cbd5e1',
              bg: props.colorMode === 'dark' ? '#1a1a1a' : '#f1f5f9',
            },
            _focus: {
              borderColor: 'brand.500',
              bg: props.colorMode === 'dark' ? '#1a1a1a' : 'white',
              boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
            },
          },
        }),
      },
    },
    Select: {
      variants: {
        filled: (props: any) => ({
          field: {
            bg: props.colorMode === 'dark' ? '#1a1a1a' : '#f8fafc',
            border: '2px solid',
            borderColor: props.colorMode === 'dark' ? 'gray.800' : '#e2e8f0',
            color: props.colorMode === 'dark' ? 'white' : '#1e293b',
            borderRadius: 'xl',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.700' : '#cbd5e1',
              bg: props.colorMode === 'dark' ? '#1a1a1a' : '#f1f5f9',
            },
            _focus: {
              borderColor: 'brand.500',
              bg: props.colorMode === 'dark' ? '#1a1a1a' : 'white',
              boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
            },
          },
        }),
      },
    },
    Textarea: {
      variants: {
        filled: (props: any) => ({
          bg: props.colorMode === 'dark' ? '#1a1a1a' : '#f8fafc',
          border: '2px solid',
          borderColor: props.colorMode === 'dark' ? 'gray.800' : '#e2e8f0',
          color: props.colorMode === 'dark' ? 'white' : '#1e293b',
          borderRadius: 'xl',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'gray.700' : '#cbd5e1',
            bg: props.colorMode === 'dark' ? '#1a1a1a' : '#f1f5f9',
          },
          _focus: {
            borderColor: 'brand.500',
            bg: props.colorMode === 'dark' ? '#1a1a1a' : 'white',
            boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
          },
        }),
      },
    },
    Modal: {
      baseStyle: (props: any) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? '#111111' : 'white',
          borderRadius: '2xl',
          border: props.colorMode === 'dark' ? '1px solid' : 'none',
          borderColor: props.colorMode === 'dark' ? 'gray.800' : 'transparent',
        },
        overlay: {
          bg: props.colorMode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.6)',
        },
      }),
    },
    Drawer: {
      baseStyle: (props: any) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? '#111111' : 'white',
          border: props.colorMode === 'dark' ? '1px solid' : 'none',
          borderColor: props.colorMode === 'dark' ? 'gray.800' : 'transparent',
        },
        overlay: {
          bg: props.colorMode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.6)',
        },
      }),
    },
    Progress: {
      baseStyle: (props: any) => ({
        track: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
        },
      }),
    },
    Tabs: {
      baseStyle: (props: any) => ({
        tablist: {
          borderColor: props.colorMode === 'dark' ? 'gray.800' : 'gray.200',
        },
        tab: {
          bg: props.colorMode === 'dark' ? '#1a1a1a' : 'gray.50',
          color: props.colorMode === 'dark' ? 'gray.300' : 'gray.600',
          borderColor: props.colorMode === 'dark' ? 'gray.800' : 'gray.200',
          _selected: {
            bg: props.colorMode === 'dark' ? '#111111' : 'white',
            color: props.colorMode === 'dark' ? 'white' : 'gray.800',
            borderColor: props.colorMode === 'dark' ? 'gray.800' : 'gray.200',
          },
        },
      }),
    },
    Badge: {
      baseStyle: (props: any) => ({
        container: {
          color: props.colorMode === 'dark' ? 'gray.300' : 'gray.600',
        },
      }),
    },
    Divider: {
      baseStyle: (props: any) => ({
        borderColor: props.colorMode === 'dark' ? 'gray.800' : 'gray.200',
      }),
    },
    Text: {
      baseStyle: (props: any) => ({
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
      }),
    },
    Heading: {
      baseStyle: (props: any) => ({
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      }),
    },
    IconButton: {
      baseStyle: {
        _hover: {},
      },
    },
    Table: {
      baseStyle: (props: any) => ({
        table: {
          _hover: {},
        },
        tbody: {
          tr: {
            _hover: {},
            transition: 'none',
          },
        },
        thead: {
          tr: {
            _hover: {},
          },
        },
      }),
    },
  },
})

export default theme

