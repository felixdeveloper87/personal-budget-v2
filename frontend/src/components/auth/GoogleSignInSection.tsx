import { useCallback, useEffect, useState } from 'react'
import { Box, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { ToastService } from '../../services/toast'

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

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

/**
 * Google Identity Services button + divider. No npm package — loads the official gsi/client script.
 * Hidden when `VITE_GOOGLE_CLIENT_ID` is unset.
 */
export default function GoogleSignInSection() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const { loginWithGoogle } = useAuth()
  const [busy, setBusy] = useState(false)
  /** Ensures GIS runs only after the button mount is in the DOM. */
  const [buttonHost, setButtonHost] = useState<HTMLDivElement | null>(null)

  const dividerColor = useColorModeValue('gray.400', 'gray.500')
  const muted = useColorModeValue('gray.500', 'gray.400')

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
        if (cancelled || !window.google?.accounts?.id) {
          return
        }
        const gid = window.google.accounts.id
        buttonHost.innerHTML = ''
        gid.initialize({
          client_id: clientId,
          callback: (res) => {
            void onCredential(res.credential)
          },
        })
        gid.renderButton(buttonHost, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 320,
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

  if (!clientId) {
    return null
  }

  return (
    <VStack spacing={4} align="stretch" w="full">
      <Box
        w="full"
        display="flex"
        justifyContent="center"
        opacity={busy ? 0.7 : 1}
        pointerEvents={busy ? 'none' : 'auto'}
      >
        <Box ref={setButtonHost} minH="40px" display="flex" justifyContent="center" alignItems="center" />
      </Box>

      <Text
        fontSize="xs"
        fontWeight={600}
        textAlign="center"
        color={muted}
        textTransform="uppercase"
        letterSpacing="0.08em"
      >
        <Text as="span" color={dividerColor}>
          or
        </Text>{' '}
        continue with email
      </Text>
    </VStack>
  )
}
