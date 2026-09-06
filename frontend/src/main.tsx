import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  ChakraProvider,
  ColorModeScript,
  createLocalStorageManager,
  extendTheme,
} from '@chakra-ui/react'
import App from './App'
import ReportPrintPage from './pages/ReportPrintPage'
import theme from './theme'
import './styles/button-motion.css'
import { AuthProvider } from './contexts/AuthContext'
import { SearchProvider } from './contexts/SearchContext'
import { AppToastContainer } from './services/toast'
import { I18nProvider } from './i18n'

// The print/export page is a standalone route (no app shell). The project has no
// router, so we branch on the pathname — nginx already falls back to index.html.
const isPrintRoute = window.location.pathname.startsWith('/reports/print')

// Force light mode for the printable report, isolated from the app's own
// color-mode preference via a dedicated storage key.
const printTheme = extendTheme(
  { config: { initialColorMode: 'light', useSystemColorMode: false } },
  theme,
)
const printColorModeManager = createLocalStorageManager('pbudget-print-color-mode')

const printRoot = (
  <I18nProvider>
    <ChakraProvider theme={printTheme} colorModeManager={printColorModeManager}>
      <ColorModeScript initialColorMode="light" />
      <AuthProvider>
        <ReportPrintPage />
      </AuthProvider>
      <AppToastContainer />
    </ChakraProvider>
  </I18nProvider>
)

const appRoot = (
  <I18nProvider>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <AuthProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </AuthProvider>
      <AppToastContainer />
    </ChakraProvider>
  </I18nProvider>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{isPrintRoute ? printRoot : appRoot}</React.StrictMode>,
)
