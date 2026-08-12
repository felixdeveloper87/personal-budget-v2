import { useCallback, useEffect, useState } from 'react'
import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { AUTH_COLORS as C, AUTH_FONTS as F } from './authTheme'
import { useI18n } from '../../i18n'

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

type GoogleStatus = 'loading' | 'ready' | 'error'

interface GoogleNotice {
  tone: 'info' | 'error'
  message: string
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.accounts?.id) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`)
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google script failed')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google script failed'))
    document.head.appendChild(script)
  })
}

export default function GoogleSignInSection() {
  const { locale, t } = useI18n()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const { loginWithGoogle } = useAuth()
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<GoogleStatus>('loading')
  const [notice, setNotice] = useState<GoogleNotice>()
  const [buttonHost, setButtonHost] = useState<HTMLDivElement | null>(null)

  const onCredential = useCallback(
    async (credential: string | undefined) => {
      if (!credential) return
      setBusy(true)
      setNotice(undefined)
      try {
        const outcome = await loginWithGoogle(credential)
        if (outcome.status === 'pending') {
          setNotice({
            tone: 'info',
            message:
              (locale === 'en-GB' ? outcome.message : undefined) ??
              t('auth.google.pendingFallback'),
          })
        }
      } catch (error: unknown) {
        let message = t('auth.google.failed')
        if (axios.isAxiosError(error)) {
          const body = error.response?.data as { error?: string; message?: string } | undefined
          if (locale === 'en-GB' && body?.message) message = body.message
          else if (locale === 'en-GB' && body?.error) message = body.error
          if (error.response?.status === 503) {
            message = t('auth.google.notEnabled')
          }
        }
        setNotice({ tone: 'error', message })
      } finally {
        setBusy(false)
      }
    },
    [locale, loginWithGoogle, t],
  )

  useEffect(() => {
    if (!clientId || !buttonHost) return

    let cancelled = false
    let resizeObserver: ResizeObserver | undefined
    let renderFrame = 0
    let renderedWidth = 0
    setStatus('loading')

    loadGisScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return
        const googleIdentity = window.google.accounts.id
        googleIdentity.initialize({
          client_id: clientId,
          callback: (response) => {
            void onCredential(response.credential)
          },
        })

        const renderAtCurrentWidth = () => {
          window.cancelAnimationFrame(renderFrame)
          renderFrame = window.requestAnimationFrame(() => {
            if (cancelled) return

            const availableWidth = Math.floor(buttonHost.getBoundingClientRect().width)
            if (availableWidth < 200) return

            const nextWidth = Math.min(400, availableWidth)
            if (nextWidth === renderedWidth && buttonHost.childElementCount > 0) return

            renderedWidth = nextWidth
            buttonHost.innerHTML = ''
            googleIdentity.renderButton(buttonHost, {
              theme: 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              width: nextWidth,
              logo_alignment: 'left',
            })
            setStatus('ready')
          })
        }

        resizeObserver = new ResizeObserver(renderAtCurrentWidth)
        resizeObserver.observe(buttonHost)
        renderAtCurrentWidth()
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(renderFrame)
      resizeObserver?.disconnect()
      buttonHost.innerHTML = ''
    }
  }, [clientId, buttonHost, onCredential])

  if (!clientId) return null

  const unavailable = status === 'error'

  return (
    <VStack spacing={4} align="stretch" w="full">
      <Box
        position="relative"
        display="flex"
        h="44px"
        w="full"
        maxW="400px"
        mx="auto"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        border={status === 'ready' ? '0' : '1px solid'}
        borderColor={unavailable ? C.line : C.lineStrong}
        borderRadius="999px"
        bg={status === 'ready' ? 'transparent' : C.panelSoft}
        boxShadow={status === 'ready' ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.025)'}
      >
        <Box
          ref={setButtonHost}
          w="full"
          h="44px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          borderRadius="999px"
          opacity={status === 'ready' && !busy ? 1 : 0}
          pointerEvents={status === 'ready' && !busy ? 'auto' : 'none'}
          transition="opacity 0.18s ease"
          sx={{
            '& > div': {
              display: 'flex !important',
              justifyContent: 'center !important',
              maxWidth: '100% !important',
            },
            '& iframe': {
              maxWidth: '100% !important',
              height: '44px !important',
              display: 'block !important',
            },
          }}
        />

        {(status === 'loading' || busy) && (
          <HStack position="absolute" inset={0} justify="center" spacing={3} color={C.muted}>
            <Spinner size="xs" thickness="2px" color={C.jade} />
            <Text fontFamily={F.body} fontSize="sm" fontWeight={600}>
              {busy ? t('auth.google.completing') : t('auth.google.loading')}
            </Text>
          </HStack>
        )}

        {unavailable && (
          <HStack position="absolute" inset={0} justify="center" spacing={3} color={C.mutedDim}>
            <GoogleG />
            <Text fontFamily={F.body} fontSize="sm" fontWeight={600}>
              {t('auth.google.unavailable')}
            </Text>
          </HStack>
        )}
      </Box>

      {notice && (
        <Box
          role={notice.tone === 'error' ? 'alert' : 'status'}
          px={3.5}
          py={3}
          border="1px solid"
          borderColor={notice.tone === 'error' ? 'rgba(255,154,144,0.22)' : 'rgba(232,196,119,0.2)'}
          borderRadius="12px"
          bg={notice.tone === 'error' ? C.coralSoft : C.goldSoft}
          color={notice.tone === 'error' ? C.coral : C.gold}
        >
          <Text fontFamily={F.body} fontSize="xs" lineHeight={1.5}>
            {notice.message}
          </Text>
        </Box>
      )}

      <HStack spacing={3} aria-hidden="true">
        <Box h="1px" flex={1} bg={C.line} />
        <Text
          color={C.mutedDim}
          fontFamily={F.mono}
          fontSize="8px"
          fontWeight={500}
          letterSpacing="0.12em"
          textTransform="uppercase"
        >
          {t('auth.google.orEmail')}
        </Text>
        <Box h="1px" flex={1} bg={C.line} />
      </HStack>
    </VStack>
  )
}
