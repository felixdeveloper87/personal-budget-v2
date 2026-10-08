import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Select,
  Switch,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { InfoIcon } from '@phosphor-icons/react'
import { PremiumModal } from '../ui'
import NuModalHeader from '../ui/NuModalHeader'
import ImportCsvModal from '../transactions/ImportCsvModal'
import { deleteAllUserData } from '../../api'
import { exportAllData } from '../../utils/export'
import { ToastService } from '../../services/toast'
import {
  AlertTriangle,
  Bell,
  Home,
  Download,
  Globe,
  Settings,
  Shield,
  Trash2,
  Upload,
} from '../ui/icons'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useI18n } from '../../i18n'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { SHEET_SX, sheetContainerProps, sheetGrabberProps } from '../ui/modalLayout'

/** Household notifications, in the order they happen through the week. */
const HOUSEHOLD_SCHEDULE = [
  'activity',
  'cleaningWeek',
  'bins',
  'binsFinal',
  'cleaningUnfinished',
  'cleaningDone',
  'payments',
] as const

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { locale, setLocale, t } = useI18n()
  const push = usePushNotifications(isOpen)
  const pushDescription = {
    unsupported: t('settings.push.unsupported'),
    'needs-install': t('settings.push.needsInstall'),
    unavailable: t('settings.push.unavailable'),
    denied: t('settings.push.blocked'),
    off: t('settings.push.description'),
    on: t('settings.push.description'),
  }[push.state ?? 'off']
  const pushToggleable = push.state === 'on' || push.state === 'off'
  const colors = useThemeColors()
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

  const surfaceBg = colors.cardBg
  const textColor = colors.text.primary
  const mutedColor = colors.text.secondary
  const borderColor = colors.border
  const dangerBg = useColorModeValue('red.50', 'rgba(220,38,38,0.08)')
  const dangerBorder = useColorModeValue('red.100', 'rgba(220,38,38,0.2)')

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
    ToastService.info({
      title: t('settings.comingSoon'),
      description: t('settings.comingSoonDescription'),
      duration: 2500,
    })
  }

  const SectionTitle = ({ icon, label }: { icon: typeof Settings; label: string }) => (
    <HStack spacing={2.5} mb={2.5}>
      <Box role="presentation" w={{ base: 8, sm: 10 }} h={{ base: 8, sm: 10 }} borderRadius="xl" bg={colors.bgSecondary} color="#820ad1"
        display="flex" alignItems="center" justifyContent="center" flexShrink={0} aria-hidden>
        <Icon as={icon} boxSize={{ base: 4, sm: 5 }} sx={{ '& svg': { display: 'block' } }} />
      </Box>
      <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="600" color={colors.text.secondary} lineHeight="1.1">
        {label}
      </Text>
    </HStack>
  )

  const SettingRow = ({
    label,
    labelAddon,
    description,
    children,
    noBorder,
  }: {
    label: string
    labelAddon?: React.ReactNode
    description?: string
    children: React.ReactNode
    noBorder?: boolean
  }) => (
    <HStack
      px={{ base: 3, sm: 4 }}
      py={3.5}
      bg="transparent"
      justify="space-between"
      borderBottom={noBorder ? undefined : '1px solid'}
      borderColor={borderColor}
      _hover={{ bg: colors.bgSecondary }}
      transition="background 0.15s ease"
      gap={4}
    >
      <Box minW={0} flex={1}>
        <HStack spacing={1}>
          <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight={600} color={textColor}>{label}</Text>
          {labelAddon}
        </HStack>
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
      size={{ base: 'full', md: 'xl' }}
      contentProps={{ className: 'nu-dashboard' }}
      header={<NuModalHeader title={t('settings.title')} caption={t('settings.caption')} onClose={onClose} />}
    >
      <Box flex="1" bg="var(--nu-page, #ffffff)" overflowY="auto">
        <VStack
          spacing={4}
          align="stretch"
          p={{ base: 3, sm: 5, md: 6 }}
        >

          {/* Preferences */}
          <Box>
            <SectionTitle icon={Globe} label={t('settings.preferences')} />
            <VStack
              spacing={0}
              align="stretch"
              bg={colors.inputBg}
              border="2px solid"
              borderColor={borderColor}
              borderRadius="2xl"
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

          {/* Household: everything the shared-home core sends, for people who only use that part */}
          <Box>
            <SectionTitle icon={Home} label={t('settings.household')} />
            <VStack
              spacing={0}
              align="stretch"
              bg={colors.inputBg}
              border="2px solid"
              borderColor={borderColor}
              borderRadius="2xl"
              overflow="hidden"
            >
              <SettingRow
                label={t('settings.push')}
                description={pushDescription}
                labelAddon={(
                  <Popover placement="bottom-start" isLazy>
                    <PopoverTrigger>
                      <IconButton
                        aria-label={t('settings.household.whatYouGet')}
                        icon={<InfoIcon size={16} weight="bold" />}
                        size="xs"
                        variant="ghost"
                        borderRadius="full"
                        minW="22px"
                        h="22px"
                        color={mutedColor}
                      />
                    </PopoverTrigger>
                    <Portal>
                      <PopoverContent
                        w={{ base: 'calc(100vw - 32px)', sm: '380px' }}
                        bg={colors.cardBg}
                        borderColor={borderColor}
                        borderRadius="xl"
                      >
                        <PopoverArrow bg={colors.cardBg} />
                        <PopoverBody p={4}>
                          <Text fontSize="xs" fontWeight={600} color={mutedColor} mb={2}>
                            {t('settings.household.whatYouGet')}
                          </Text>
                          <VStack spacing={1.5} align="stretch">
                            {HOUSEHOLD_SCHEDULE.map((item) => (
                              <HStack key={item} spacing={3} align="baseline">
                                <Text fontSize="xs" fontWeight={700} color={textColor} minW="84px" flexShrink={0}>
                                  {t(`settings.household.when.${item}`)}
                                </Text>
                                <Text fontSize="xs" color={mutedColor}>
                                  {t(`settings.household.what.${item}`)}
                                </Text>
                              </HStack>
                            ))}
                          </VStack>
                        </PopoverBody>
                      </PopoverContent>
                    </Portal>
                  </Popover>
                )}
              >
                <HStack spacing={3}>
                  {push.state === 'on' && (
                    <Button
                      size="xs"
                      variant="link"
                      color={textColor}
                      fontWeight={600}
                      onClick={() => void push.sendTest()}
                      isDisabled={push.busy}
                    >
                      {t('settings.push.sendTest')}
                    </Button>
                  )}
                  <Switch
                    aria-label={t('settings.push')}
                    isChecked={push.state === 'on'}
                    isDisabled={!pushToggleable || push.busy}
                    onChange={(e) => void push.setEnabled(e.target.checked)}
                    colorScheme="purple"
                    size="md"
                  />
                </HStack>
              </SettingRow>
            </VStack>
          </Box>

          {/* Notifications */}
          <Box>
            <SectionTitle icon={Bell} label={t('settings.notifications')} />
            <VStack
              spacing={0}
              align="stretch"
              bg={colors.inputBg}
              border="2px solid"
              borderColor={borderColor}
              borderRadius="2xl"
              overflow="hidden"
            >
              <SettingRow
                label={t('settings.billsDue')}
                description={push.state === 'on'
                  ? t('settings.billsDueDescription')
                  : t('settings.billsDueNeedsPush')}
              >
                <Switch
                  aria-label={t('settings.billsDue')}
                  isChecked={push.preferences?.billsDue ?? true}
                  isDisabled={!push.preferences}
                  onChange={(e) => void push.setPreference('billsDue', e.target.checked)}
                  colorScheme="purple"
                  size="md"
                />
              </SettingRow>
              <SettingRow
                label={t('settings.emailReports')}
                description={t('settings.emailReportsDescription')}
              >
                <Switch
                  isChecked={emailReports}
                  onChange={(e) => { setEmailReports(e.target.checked); showComingSoon() }}
                  colorScheme="purple"
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
                  colorScheme="purple"
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
                  colorScheme="purple"
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
              bg={colors.inputBg}
              border="2px solid"
              borderColor={borderColor}
              borderRadius="2xl"
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

          {/* Danger zone */}
          <Box
            p={4}
            bg={dangerBg}
            border="2px solid"
            borderColor={dangerBorder}
            borderRadius="2xl"
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
          <AlertDialogContent bg={surfaceBg} borderRadius="xl" mx={4} containerProps={sheetContainerProps} sx={SHEET_SX}>
            <Box {...sheetGrabberProps} />
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
