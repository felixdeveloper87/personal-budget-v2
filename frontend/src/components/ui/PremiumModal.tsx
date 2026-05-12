import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    useColorModeValue,
    Box,
    ModalProps,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { safariStyles, getResponsiveStyles } from './ui'

export interface PremiumModalProps extends Omit<ModalProps, 'children'> {
    children: ReactNode
    header?: ReactNode
    footer?: ReactNode
    showCloseButton?: boolean
    contentProps?: any
}

const MotionModalContent = motion.create(ModalContent)

export default function PremiumModal({
    isOpen,
    onClose,
    children,
    header,
    footer,
    showCloseButton = true,
    contentProps,
    ...props
}: PremiumModalProps) {
    const responsiveStyles = getResponsiveStyles()
    const { sx: contentSx, ...restContentProps } = contentProps ?? {}

    // Premium visual styles
    const overlayBg = useColorModeValue('rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.6)')
    const contentBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(20, 20, 20, 0.95)')
    const borderColor = useColorModeValue('rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.08)')
    const shadow = useColorModeValue(
        '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 20px 50px -12px rgba(0, 0, 0, 0.5)'
    )

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            scrollBehavior="inside"
            blockScrollOnMount={true}
            motionPreset="none" // We'll handle animation manually
            {...props}
        >
            <ModalOverlay
                bg={overlayBg}
                backdropFilter="blur(16px)"
                transition="all 0.3s ease-in-out"
            />

            <MotionModalContent
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                bg={contentBg}
                backdropFilter="blur(20px) saturate(180%)"
                borderRadius={{ base: 0, md: '3xl' }}
                border="1px solid"
                borderColor={borderColor}
                boxShadow={shadow}
                overflow="hidden"
                // No margin on mobile: with `size='full'` + `100dvh` we want
                // the modal to sit edge-to-edge in the visible viewport, so
                // the X close button is never pushed under the iOS URL bar
                // / Dynamic Island.
                mx={{ base: 0, md: 0 }}
                my={{ base: 0, md: 0 }}
                {...responsiveStyles.modal}
                sx={{
                    ...safariStyles.modal,
                    ...(contentSx && typeof contentSx === 'object' ? contentSx : {}),
                }}
                {...restContentProps}
            >
                {header && (
                    <Box
                        position="relative"
                        zIndex={2}
                    >
                        {header}
                    </Box>
                )}

                <ModalBody
                    p={0}
                    display="flex"
                    flexDirection="column"
                    flex="1"
                    position="relative"
                    zIndex={1}
                >
                    {children}
                </ModalBody>

                {footer && (
                    <Box
                        position="relative"
                        zIndex={2}
                        px={{ base: 4, md: 6 }}
                        pt={{ base: 4, md: 6 }}
                        pb={{
                            // Keep buttons clear of the iOS home indicator
                            // with extra breathing room beyond the raw inset.
                            base: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
                            md: 6,
                        }}
                        borderTop="1px solid"
                        borderColor={useColorModeValue('gray.100', 'whiteAlpha.100')}
                    >
                        {footer}
                    </Box>
                )}
            </MotionModalContent>
        </Modal>
    )
}
