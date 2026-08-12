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
import { useEd } from '../../editorial'
import { useI18n } from '../../i18n'

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { locale, setLocale, t } = useI18n()
  const ed = useEd()
  const { colorMode, setColorMode } = useColorMode()
  const toast = useToast()

  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [emailReports, setEmailReports] = useState(true)
  const [monthlySummary, setMonthlySummary] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const deleteConfirmWord = t('settings.deleteConfirmWord')
  const deleteDialog = useDisclosure()
  const importDialog = useDisclosure()
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)

  const fallbackSurfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const fallbackBodyBg = useColorModeValue('gray.50', '#0a0a0a')
  const surfaceBg = ed?.solid ?? fallbackSurfaceBg
  const bodyBg = ed?.bg ?? fallbackBodyBg
  const textColorBase = useColorModeValue('gray.900', 'gray.50')
  const textColor = ed?.cream ?? textColorBase
  const mutedColorBase = useColorModeValue('gray.500', 'gray.400')
  const mutedColor = ed?.muted ?? mutedColorBase
  const borderColorBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const borderColor = ed?.line ?? borderColorBase
  const rowBgBase = useColorModeValue('white', 'whiteAlpha.50')
  const rowBg = ed?.panel ?? rowBgBase
  const rowHoverBgBase = useColorModeValue('gray.50', 'whiteAlpha.80')
  const rowHoverBg = ed?.hoverBg ?? rowHoverBgBase
  const sectionTitleColorBase = useColorModeValue('gray.700', 'gray.200')
  const sectionTitleColor = ed?.muted ?? sectionTitleColorBase
  const iconBgBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  const iconBg = ed?.jadeSoft ?? iconBgBase
  const themeActiveBgBase = useColorModeValue('blue.50', 'rgba(37,99,235,0.15)')
  const themeActiveBg = ed?.jadeSoft ?? themeActiveBgBase
  const themeActiveBorderBase = useColorModeValue('blue.200', 'rgba(37,99,235,0.4)')
  const themeActiveBorder = ed?.lineStrong ?? themeActiveBorderBase
  const themeActiveColorBase = useColorModeValue('blue.700', 'blue.200')
  const themeActiveColor = ed?.jade ?? themeActiveColorBase
  const themeInactiveBgBase = useColorModeValue('white', 'whiteAlpha.50')
  const themeInactiveBg = ed?.controlBg ?? themeInactiveBgBase
  const themeInactiveBorderBase = useColorModeValue('gray.200', 'whiteAlpha.100')
  const themeInactiveBorder = ed?.line ?? themeInactiveBorderBase
  const dangerBgBase = useColorModeValue('red.50', 'rgba(220,38,38,0.05)')
  const dangerBg = ed ? 'var(--pb-tint-coral)' : dangerBgBase
  const dangerBorderBase = useColorModeValue('red.100', 'rgba(220,38,38,0.15)')
  const dangerBorder = ed ? 'var(--pb-tint-coral)' : dangerBorderBase

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportAllData()
      ToastService.success({
        title: t('settings.exportReady'),
        description: t('settings.exportReadyDescription'),
        dedupeKey: 'csv-export-done',
      })
    } catch (err) {
      ToastService.apiError(err, { title: t('settings.exportFailed'), dedupeKey: 'csv-export-failed' })
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAll = async () => {
    setDeleting(true)
    try {
      await deleteAllUserData()
      ToastService.success({
        title: t('settings.deleted'),
        description: t('settings.deletedDescription'),
        dedupeKey: 'user-data-deleted',
      })
      deleteDialog.onClose()
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      ToastService.apiError(err, { title: t('settings.deleteFailed'), dedupeKey: 'user-data-delete-failed' })
      setDeleting(false)
    }
  }

  const showComingSoon = () => {
    toast({
      title: t('settings.comingSoon'),
      description: t('settings.comingSoonDescription'),
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
          title={t('settings.title')}
          caption={t('settings.caption')}
          onClose={onClose}
          accent="blue"
        />
      }
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
            <SectionTitle icon={Globe} label={t('settings.preferences')} />
            <VStack
              spacing={0}
              align="stretch"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
            >
              <SettingRow
                label={t('language.label')}
                description={t('language.description')}
              >
                <Select
                  size="sm"
                  value={locale}
                  onChange={(event) => {
                    const nextLocale = event.target.value
                    if (nextLocale === 'en-GB' || nextLocale === 'pt-BR') {
                      setLocale(nextLocale)
                    }
                  }}
                  w="180px"
                  borderRadius="lg"
                >
                  <option value="en-GB">{t('language.english')}</option>
                  <option value="pt-BR">{t('language.portuguese')}</option>
                </Select>
              </SettingRow>
              <SettingRow
                label={t('currency.label')}
                description={t('currency.description')}
              >
                <Text fontSize="sm" fontWeight={700} color={textColor} whiteSpace="nowrap">
                  {t('currency.pound')}
                </Text>
              </SettingRow>
              <SettingRow
                label={t('settings.dateFormat')}
                description={t('settings.dateFormatDescription')}
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
            <SectionTitle icon={Sun} label={t('settings.appearance')} />
            <VStack
              spacing={0}
              align="stretch"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
            >
              <Box px={4} py={3.5} bg={rowBg}>
                <Text fontSize="sm" fontWeight={600} color={textColor} mb={3}>{t('settings.theme')}</Text>
                <HStack spacing={2}>
                  {(['light', 'dark', 'system'] as const).map((mode) => {
                    const isActive = mode === 'system'
                      ? false
                      : colorMode === mode
                    const label = t(`settings.theme.${mode}`)
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
            <SectionTitle icon={Bell} label={t('settings.notifications')} />
            <VStack
              spacing={0}
              align="stretch"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
            >
              <SettingRow
                label={t('settings.emailReports')}
                description={t('settings.emailReportsDescription')}
              >
                <Switch
                  isChecked={emailReports}
                  onChange={(e) => { setEmailReports(e.target.checked); showComingSoon() }}
                  colorScheme="blue"
                  size="md"
                />
              </SettingRow>
              <SettingRow
                label={t('settings.monthlySummary')}
                description={t('settings.monthlySummaryDescription')}
              >
                <Switch
                  isChecked={monthlySummary}
                  onChange={(e) => { setMonthlySummary(e.target.checked); showComingSoon() }}
                  colorScheme="blue"
                  size="md"
                />
              </SettingRow>
              <SettingRow
                label={t('settings.budgetAlerts')}
                description={t('settings.budgetAlertsDescription')}
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
            <SectionTitle icon={Shield} label={t('settings.privacyData')} />
            <VStack
              spacing={0}
              align="stretch"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
            >
              <SettingRow
                label={t('settings.exportAll')}
                description={t('settings.exportDescription')}
              >
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={Download} boxSize={3.5} />}
                  borderRadius="lg"
                  onClick={handleExport}
                  isLoading={exporting}
                  loadingText={t('settings.exporting')}
                >
                  {t('settings.export')}
                </Button>
              </SettingRow>
              <SettingRow
                label={t('settings.importData')}
                description={t('settings.importDescription')}
                noBorder
              >
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={Upload} boxSize={3.5} />}
                  borderRadius="lg"
                  onClick={importDialog.onOpen}
                >
                  {t('settings.import')}
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
              <Text fontSize="sm" fontWeight={700} color="red.600">{t('settings.dangerZone')}</Text>
            </HStack>
            <Text fontSize="xs" color={mutedColor} mb={3}>
              {t('settings.dangerWarning')}
            </Text>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              borderRadius="lg"
              leftIcon={<Icon as={Trash2} boxSize={3.5} />}
              onClick={() => { setConfirmText(''); deleteDialog.onOpen() }}
            >
              {t('settings.deleteAll')}
            </Button>
            <Text fontSize="xs" color={mutedColor} mt={2}>
              {t('settings.deleteSummary')}
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
              <Text fontWeight={800} color={textColor}>{t('settings.deleteAll')}</Text>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text fontSize="sm" color={mutedColor} mb={3}>
                {t('settings.deleteDescription')}
              </Text>
              <Text fontSize="sm" color={textColor} fontWeight={600} mb={2}>
                {t('settings.deletePrompt', { word: deleteConfirmWord })}
              </Text>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={deleteConfirmWord}
                autoFocus
              />
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelDeleteRef} variant="ghost" onClick={deleteDialog.onClose} isDisabled={deleting}>
                {t('settings.cancel')}
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteAll}
                isLoading={deleting}
                loadingText={t('settings.deleting')}
                isDisabled={confirmText.trim().toLocaleUpperCase(locale) !== deleteConfirmWord.toLocaleUpperCase(locale)}
              >
                {t('settings.deleteEverything')}
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
