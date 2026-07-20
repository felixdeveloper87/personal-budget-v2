import { useCallback, useEffect, useState } from 'react'
import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { ToastService } from '../../services/toast'

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.accounts?.id) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`)
    if (existing) {
      if (window.google?.accounts?.id) { resolve(); return }
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Google script failed')))
      return
    }
    const s = document.createElement('script')
    s.src = GIS_SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Google script failed'))
    document.head.appendChild(s)
  })
}

export default function GoogleSignInSection() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const { loginWithGoogle } = useAuth()
  const [busy, setBusy] = useState(false)
  const [buttonHost, setButtonHost] = useState<HTMLDivElement | null>(null)

  const btnBg = 'rgba(22, 24, 30, 0.6)'
  const btnBorder = 'rgba(239, 234, 224, 0.18)'
  const btnText = '#efeae0'
  const btnShadow = '0 1px 4px rgba(0,0,0,0.25)'
  const dividerColor = '#60a5fa'
  const muted = '#94a398'

  const onCredential = useCallback(
    async (credential: string | undefined) => {
      if (!credential) return
      setBusy(true)
      try {
        const outcome = await loginWithGoogle(credential)
        if (outcome.status === 'pending') {
          ToastService.info({
            title: 'Registration received',
            description:
              outcome.message ??
              'An administrator must approve your account before you can sign in.',
            duration: 6000,
            dedupeKey: 'google-registration-pending',
          })
        } else {
          ToastService.success({
            title: 'Signed in with Google',
            duration: 2000,
            dedupeKey: 'google-login-success',
          })
        }
      } catch (error: unknown) {
        let message = 'Google sign-in failed'
        if (axios.isAxiosError(error)) {
          const body = error.response?.data as { error?: string } | undefined
          if (body?.error) message = body.error
          if (error.response?.status === 503) {
            message = 'Google sign-in is not enabled on the server.'
          }
        }
        ToastService.error({
          title: 'Google sign-in failed',
          description: message,
          duration: 4000,
          dedupeKey: 'google-login-failed',
        })
      } finally {
        setBusy(false)
      }
    },
    [loginWithGoogle]
  )

  useEffect(() => {
    if (!clientId || !buttonHost) return

    let cancelled = false

    loadGisScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return
        const gid = window.google.accounts.id
        buttonHost.innerHTML = ''
        gid.initialize({
          client_id: clientId,
          callback: (res) => { void onCredential(res.credential) },
        })
        gid.renderButton(buttonHost, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: buttonHost.offsetWidth || 400,
        })
      })
      .catch(() => {
        ToastService.error({
          title: 'Google sign-in',
          description: 'Could not load Google script. Check your connection.',
          duration: 4000,
          dedupeKey: 'google-script-load-failed',
        })
      })

    return () => {
      cancelled = true
      buttonHost.innerHTML = ''
    }
  }, [clientId, buttonHost, onCredential])

  if (!clientId) return null

  return (
    <VStack spacing={4} align="stretch" w="full">
      {/*
       * Custom-styled button layered over the invisible GIS iframe.
       * The GIS iframe (opacity 0, z-index 1) handles the actual click/credential flow.
       * overflow:hidden clips the iframe visually while pointer-events still fire within bounds.
       */}
      <Box position="relative" h="44px" w="full" borderRadius="xl" overflow="hidden">
        {/* Visible layer — no pointer events so clicks fall through to GIS iframe */}
        <HStack
          position="absolute"
          inset={0}
          justify="center"
          spacing={3}
          bg={btnBg}
          border="1px solid"
          borderColor={btnBorder}
          borderRadius="xl"
          boxShadow={btnShadow}
          pointerEvents="none"
          opacity={busy ? 0.55 : 1}
          transition="opacity 0.2s"
        >
          {busy ? <Spinner size="xs" thickness="2px" /> : <GoogleG />}
          <Text fontSize="sm" fontWeight={600} color={btnText} letterSpacing="-0.01em">
            Continue with Google
          </Text>
        </HStack>

        {/* GIS iframe — invisible, handles all click + credential events */}
        <Box
          ref={setButtonHost}
          position="absolute"
          inset={0}
          opacity={0}
          zIndex={1}
          pointerEvents={busy ? 'none' : 'auto'}
          sx={{
            '& > div': { width: '100% !important' },
            '& iframe': { width: '100% !important', height: '44px !important' },
          }}
        />
      </Box>

      <Text
        fontSize="xs"
        fontWeight={600}
        textAlign="center"
        color={muted}
        textTransform="uppercase"
        letterSpacing="0.08em"
      >
        <Text as="span" color={dividerColor}>or</Text>{' '}
        continue with email
      </Text>
    </VStack>
  )
}
