import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import App from './App'
import theme from './theme'
import { AuthProvider } from './contexts/AuthContext'
import { SearchProvider } from './contexts/SearchContext'

const root = (
  <ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <AuthProvider>
      <SearchProvider>
        <App />
      </SearchProvider>
    </AuthProvider>
  </ChakraProvider>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{root}</React.StrictMode>
)
