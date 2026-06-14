import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  Input,
  Select,
  Switch,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { ModalHeader, PremiumModal } from '../ui'
import ImportCsvModal from '../transactions/ImportCsvModal'
import { deleteAllUserData } from '../../api'
import { exportAllData } from '../../utils/export'
import { ToastService } from '../../services/toast'
import {
  AlertTriangle,
  Bell,
  Download,
  Globe,
  Moon,
  Settings,
  Shield,
  Sun,
  Trash2,
  Upload,
} from '../ui/icons'

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { colorMode, setColorMode } = useColorMode()
  const toast = useToast()

  const [language, setLanguage] = useState('en')
  const [currency, setCurrency] = useState('USD')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [emailReports, setEmailReports] = useState(true)
  const [monthlySummary, setMonthlySummary] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const deleteDialog = useDisclosure()
  const importDialog = useDisclosure()
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')
  const textColor = useColorModeValue('gray.900', 'gray.50')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.100')
  const rowBg = useColorModeValue('white', 'whiteAlpha.50')
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.80')
  const sectionTitleColor = useColorModeValue('gray.700', 'gray.200')
  const iconBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const themeActiveBg = useColorModeValue('blue.50', 'rgba(37,99,235,0.15)')
  const themeActiveBorder = useColorModeValue('blue.200', 'rgba(37,99,235,0.4)')
  const themeActiveColor = useColorModeValue('blue.700', 'blue.200')
  const themeInactiveBg = useColorModeValue('white', 'whiteAlpha.50')
  const themeInactiveBorder = useColorModeValue('gray.200', 'whiteAlpha.100')
  const dangerBg = useColorModeValue('red.50', 'rgba(220,38,38,0.05)')
  const dangerBorder = useColorModeValue('red.100', 'rgba(220,38,38,0.15)')

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportAllData()
      ToastService.success({
        title: 'Export ready',
        description: 'One CSV containing all of your data was downloaded.',
        dedupeKey: 'csv-export-done',
      })
    } catch (err) {
      ToastService.apiError(err, { title: 'Export failed', dedupeKey: 'csv-export-failed' })
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAll = async () => {
    setDeleting(true)
    try {
      await deleteAllUserData()
      ToastService.success({
        title: 'All data deleted',
        description: 'Your account was kept. Reloading…',
        dedupeKey: 'user-data-deleted',
      })
      deleteDialog.onClose()
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not delete data', dedupeKey: 'user-data-delete-failed' })
      setDeleting(false)
    }
  }

  const showComingSoon = () => {
    toast({
      title: 'Coming soon',
      description: 'This setting will be available in a future update.',
      status: 'info',
      duration: 2500,
      isClosable: true,
      position: 'top',
    })
  }

  const SectionTitle = ({ icon, label }: { icon: typeof Settings; label: string }) => (
    <HStack spacing={2} mb={2}>
      <Box
        p={1.5}
        borderRadius="md"
        bg={iconBg}
        border="1px solid"
        borderColor={borderColor}
        flexShrink={0}
      >
        <Icon as={icon} boxSize={3.5} color={mutedColor} />
      </Box>
      <Text
        fontSize="xs"
        fontWeight={700}
        color={sectionTitleColor}
        letterSpacing="0.06em"
        textTransform="uppercase"
      >
        {label}
      </Text>
    </HStack>
  )

  const SettingRow = ({
    label,
    description,
    children,
    noBorder,
  }: {
    label: string
    description?: string
    children: React.ReactNode
    noBorder?: boolean
  }) => (
    <HStack
      px={4}
      py={3.5}
      bg={rowBg}
      justify="space-between"
      borderBottom={noBorder ? undefined : '1px solid'}
      borderColor={borderColor}
      _hover={{ bg: rowHoverBg }}
      transition="background 0.15s ease"
      gap={4}
    >
      <Box minW={0} flex={1}>
        <Text fontSize="sm" fontWeight={600} color={textColor}>{label}</Text>
        {description && (
          <Text fontSize="xs" color={mutedColor} mt={0.5}>{description}</Text>
        )}
      </Box>
      <Box flexShrink={0}>{children}</Box>
    </HStack>
  )

  return (
    <>
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '2xl' }}
      header={
        <ModalHeader
          icon={Settings}
          title="Settings"
          caption="Preferences, appearance and privacy"
          onClose={onClose}
          accent="blue"
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} overflowY="auto">
        <VStack
          spacing={5}
          align="stretch"
          px={{ base: 4, sm: 6, md: 8 }}
          py={{ base: 4, sm: 6, md: 8 }}
        >

          {/* Preferences */}
          <Box>
            <SectionTitle icon={Globe} label="Preferences" />
            <VStack
              spacing={0}
              align="stretch"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
            >
              <SettingRow
                label="Language"
                description="Interface display language"
              >
                <Select
                  size="sm"
                  value={language}
                  onChange={(e) => { setLanguage(e.target.value); showComingSoon() }}
                  w="140px"
                  borderRadius="lg"
                >
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </Select>
              </SettingRow>
              <SettingRow
                label="Currency"
                description="Default currency for display"
              >
                <Select
                  size="sm"
                  value={currency}
                  onChange={(e) => { setCurrency(e.target.value); showComingSoon() }}
                  w="140px"
                  borderRadius="lg"
                >
                  <option value="USD">USD – US Dollar</option>
                  <option value="EUR">EUR – Euro</option>
                  <option value="GBP">GBP – Pound</option>
                  <option value="BRL">BRL – Real</option>
                  <option value="CAD">CAD – Canadian Dollar</option>
                  <option value="AUD">AUD – Australian Dollar</option>
                </Select>
              </SettingRow>
              <SettingRow
                label="Date format"
                description="How dates are displayed across the app"
                noBorder
              >
                <Select
                  size="sm"
                  value={dateFormat}
                  onChange={(e) => { setDateFormat(e.target.value); showComingSoon() }}
                  w="140px"
                  borderRadius="lg"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </SettingRow>
            </VStack>
          </Box>

          {/* Appearance */}
          <Box>
            <SectionTitle icon={Sun} label="Appearance" />
            <VStack
              spacing={0}
              align="stretch"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
            >
              <Box px={4} py={3.5} bg={rowBg}>
                <Text fontSize="sm" fontWeight={600} color={textColor} mb={3}>Theme</Text>
                <HStack spacing={2}>
                  {(['light', 'dark', 'system'] as const).map((mode) => {
                    const isActive = mode === 'system'
                      ? false
                      : colorMode === mode
                    const label = mode.charAt(0).toUpperCase() + mode.slice(1)
                    const ModeIcon = mode === 'dark' ? Moon : Sun
                    return (
                      <Button
                        key={mode}
                        size="sm"
                        h="36px"
                        px={3}
                        borderRadius="lg"
                        variant="outline"
                        leftIcon={<Icon as={ModeIcon} boxSize={3.5} />}
                        bg={isActive ? themeActiveBg : themeInactiveBg}
                        borderColor={isActive ? themeActiveBorder : themeInactiveBorder}
                        color={isActive ? themeActiveColor : mutedColor}
                        fontWeight={isActive ? 700 : 500}
                        onClick={() => {
                          if (mode === 'system') { showComingSoon(); return }
                          setColorMode(mode)
                        }}
                        transition="all 0.2s ease"
                        _hover={{ borderColor: themeActiveBorder, color: themeActiveColor }}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </HStack>
              </Box>
            </VStack>
          </Box>

          {/* Notifications */}
          <Box>
            <SectionTitle icon={Bell} label="Notifications" />
            <VStack
              spacing={0}
              align="stretch"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
            >
              <SettingRow
                label="Email reports"
                description="Weekly spending digest sent to your inbox"
              >
                <Switch
                  isChecked={emailReports}
                  onChange={(e) => { setEmailReports(e.target.checked); showComingSoon() }}
                  colorScheme="blue"
                  size="md"
                />
              </SettingRow>
              <SettingRow
                label="Monthly summary"
                description="End-of-month totals and category breakdown"
              >
                <Switch
                  isChecked={monthlySummary}
                  onChange={(e) => { setMonthlySummary(e.target.checked); showComingSoon() }}
                  colorScheme="blue"
                  size="md"
                />
              </SettingRow>
              <SettingRow
                label="Budget alerts"
                description="Notify when spending exceeds 80% of a category"
                noBorder
              >
                <Switch
                  isChecked={budgetAlerts}
                  onChange={(e) => { setBudgetAlerts(e.target.checked); showComingSoon() }}
                  colorScheme="blue"
                  size="md"
                />
              </SettingRow>
            </VStack>
          </Box>

          {/* Privacy & Data */}
          <Box>
            <SectionTitle icon={Shield} label="Privacy & data" />
            <VStack
              spacing={0}
              align="stretch"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
            >
              <SettingRow
                label="Export all data"
                description="Download one CSV containing transactions, accounts, cards, installments, fixed payments and planning data"
              >
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={Download} boxSize={3.5} />}
                  borderRadius="lg"
                  onClick={handleExport}
                  isLoading={exporting}
                  loadingText="Exporting"
                >
                  Export
                </Button>
              </SettingRow>
              <SettingRow
                label="Import data"
                description="Restore accounts, cards, installments, fixed payments and transactions from the full data CSV"
                noBorder
              >
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={Upload} boxSize={3.5} />}
                  borderRadius="lg"
                  onClick={importDialog.onOpen}
                >
                  Import
                </Button>
              </SettingRow>
            </VStack>
          </Box>

          <Divider borderColor={borderColor} />

          {/* Danger zone */}
          <Box
            p={4}
            bg={dangerBg}
            border="1px solid"
            borderColor={dangerBorder}
            borderRadius="xl"
          >
            <HStack spacing={2} mb={1}>
              <Icon as={AlertTriangle} boxSize={4} color="red.500" />
              <Text fontSize="sm" fontWeight={700} color="red.600">Danger zone</Text>
            </HStack>
            <Text fontSize="xs" color={mutedColor} mb={3}>
              These actions are irreversible. Please proceed with caution.
            </Text>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              borderRadius="lg"
              leftIcon={<Icon as={Trash2} boxSize={3.5} />}
              onClick={() => { setConfirmText(''); deleteDialog.onOpen() }}
            >
              Delete all data
            </Button>
            <Text fontSize="xs" color={mutedColor} mt={2}>
              Removes all transactions, installments, fixed payments, accounts, payment
              methods, goals and budgets. Your login is kept.
            </Text>
          </Box>

        </VStack>
      </Box>

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={deleteDialog.onClose}
        isCentered
        closeOnOverlayClick={!deleting}
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(8px)">
          <AlertDialogContent bg={surfaceBg} borderRadius="xl" mx={4}>
            <AlertDialogHeader display="flex" alignItems="center" gap={3}>
              <Box
                w={9}
                h={9}
                borderRadius="lg"
                bg={dangerBg}
                color="red.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={AlertTriangle} boxSize={4} />
              </Box>
              <Text fontWeight={800} color={textColor}>Delete all data</Text>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text fontSize="sm" color={mutedColor} mb={3}>
                This permanently deletes every transaction, installment plan, fixed payment,
                account, payment method, goal and budget. This cannot be undone.
              </Text>
              <Text fontSize="sm" color={textColor} fontWeight={600} mb={2}>
                Type <Text as="span" color="red.500">DELETE</Text> to confirm:
              </Text>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoFocus
              />
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelDeleteRef} variant="ghost" onClick={deleteDialog.onClose} isDisabled={deleting}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteAll}
                isLoading={deleting}
                loadingText="Deleting…"
                isDisabled={confirmText.trim().toUpperCase() !== 'DELETE'}
              >
                Delete everything
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PremiumModal>
    <ImportCsvModal
      isOpen={importDialog.isOpen}
      onClose={importDialog.onClose}
      onImported={() => window.location.reload()}
    />
    </>
  )
}
