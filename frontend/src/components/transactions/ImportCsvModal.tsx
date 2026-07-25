import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Icon,
  Progress,
  FormControl,
  FormLabel,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { PremiumModal, ModalHeader } from '../ui'
import { Upload, FileText, CheckCircle2, AlertTriangle, Download } from '../ui/icons'
import {
  parseTransactionsCsv,
  downloadCsv,
  CSV_HEADERS,
  type CsvParseResult,
} from '../../utils/csv'
import {
  createAccount,
  createInstallmentPlan,
  createPaymentMethod,
  createRecurringTransaction,
  importTransactions,
  listAccounts,
  listPaymentMethods,
} from '../../api'
import {
  FinancialAccount,
  FinancialAccountRequest,
  PaymentMethod,
  PaymentMethodRequest,
} from '../../types'
import { ToastService } from '../../services/toast'

interface ImportCsvModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called after a successful import so the parent can refresh its data. */
  onImported: () => void
}

const TEMPLATE_ROW = ['2026-01-15', 'EXPENSE', 'Groceries', 'Weekly shop', '54.20', 'Monzo']

export default function ImportCsvModal({ isOpen, onClose, onImported }: ImportCsvModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<CsvParseResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [accountId, setAccountId] = useState<number | null>(null)

  const dropBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const dropActiveBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.12)')
  const dropBorder = useColorModeValue('gray.300', 'whiteAlpha.300')
  const dropActiveBorder = useColorModeValue('blue.400', 'blue.300')
  const dropTextColor = useColorModeValue('gray.600', 'gray.300')
  const subColor = useColorModeValue('gray.500', 'gray.400')
  const tableBorder = useColorModeValue('gray.100', 'whiteAlpha.100')
  const tableHeadColor = useColorModeValue('gray.500', 'gray.400')
  const validBg = useColorModeValue('green.50', 'rgba(34,197,94,0.12)')
  const validColor = useColorModeValue('green.700', 'green.300')
  const errorBg = useColorModeValue('red.50', 'rgba(239,68,68,0.12)')
  const errorColor = useColorModeValue('red.700', 'red.300')
  const errorPanelBg = useColorModeValue('red.50', 'rgba(239,68,68,0.08)')
  const linkColor = useColorModeValue('blue.600', 'blue.300')
  const cellColor = useColorModeValue('gray.700', 'gray.200')

  useEffect(() => {
    if (!isOpen) return
    Promise.all([listAccounts(), listPaymentMethods()])
      .then(([accountItems, methodItems]) => {
        setAccounts(accountItems)
        setPaymentMethods(methodItems)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: 'Could not load accounts',
          dedupeKey: 'csv-accounts-load-failed',
        })
      })
  }, [isOpen])

  const reset = useCallback(() => {
    setFileName(null)
    setResult(null)
    setImporting(false)
    setDragOver(false)
  }, [])

  const handleClose = useCallback(() => {
    if (importing) return
    reset()
    onClose()
  }, [importing, reset, onClose])

  const readFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      const firstLine = text.replace(/^﻿/, '').split(/\r\n|\n|\r/)[0] ?? ''
      // Match whole header cells (not substrings) so "First Date"/"Total Amount" from the
      // installments/fixed-payments exports are not mistaken for the transactions header.
      const headerCells = firstLine.split(',').map((cell) => cell.trim().toLowerCase())
      const looksLikeTransactions =
        headerCells.includes('date') && (headerCells.includes('amount') || headerCells.includes('value'))
      const looksLikeFullExport = headerCells.includes('record type')
      const parsed = parseTransactionsCsv(text)

      // A transactions CSV always has Date + Amount headers. The installments and
      // fixed-payments exports start with "Description" and can't be imported here.
      if (!looksLikeTransactions && !looksLikeFullExport && parsed.rows.length === 0) {
        ToastService.error({
          title: 'Wrong file format',
          description: 'This looks like an installments or fixed-payments export. Import the transactions CSV (transactions-*.csv) instead.',
          dedupeKey: 'csv-wrong-format',
        })
        setFileName(null)
        setResult(null)
        return
      }

      setFileName(file.name)
      setResult(parsed)
    }
    reader.onerror = () => {
      ToastService.error({ title: 'Could not read file', dedupeKey: 'csv-read-failed' })
    }
    reader.readAsText(file)
  }, [])

  const onFilePicked = (file?: File | null) => {
    if (!file) return
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      ToastService.error({
        title: 'Unsupported file',
        description: 'Please choose a .csv file.',
        dedupeKey: 'csv-bad-type',
      })
      return
    }
    readFile(file)
  }

  const downloadTemplate = () => {
    const content = [CSV_HEADERS.join(','), TEMPLATE_ROW.join(',')].join('\r\n')
    downloadCsv('transactions-template.csv', content)
  }

  const runImport = async () => {
    if (!result || (result.rows.length === 0 && result.fullDataRows.length === 0)) return
    setImporting(true)

    try {
      const isFullDataImport = result.fullDataRows.some((row) => row.recordType !== 'TRANSACTION')
      if (isFullDataImport) {
        const get = (values: Record<string, string>, key: string) => values[key.toLowerCase()] ?? ''
        const number = (value: string, fallback = 0) => {
          const parsed = Number(value)
          return Number.isFinite(parsed) ? parsed : fallback
        }
        const optionalNumber = (value: string) => value ? number(value) : undefined
        const bool = (value: string, fallback = true) =>
          value ? value.trim().toLowerCase() === 'true' : fallback
        const key = (value: string) => value.trim().toLowerCase()

        const accountByName = new Map(accounts.map((account) => [key(account.name), account]))
        for (const row of result.fullDataRows.filter((item) => item.recordType === 'ACCOUNT')) {
          const name = get(row.values, 'name')
          if (!name || accountByName.has(key(name))) continue
          const request: FinancialAccountRequest = {
            name,
            type: get(row.values, 'type') as FinancialAccountRequest['type'],
            institution: get(row.values, 'institution') || undefined,
            currency: get(row.values, 'currency') || 'GBP',
            openingBalance: number(get(row.values, 'opening balance')),
            overdraftLimit: number(get(row.values, 'overdraft limit')),
            active: bool(get(row.values, 'active')),
          }
          const created = await createAccount(request)
          accountByName.set(key(created.name), created)
        }

        const methodByName = new Map(paymentMethods.map((method) => [key(method.name), method]))
        for (const row of result.fullDataRows.filter((item) => item.recordType === 'PAYMENT_METHOD')) {
          const name = get(row.values, 'name')
          if (!name || methodByName.has(key(name))) continue
          const request: PaymentMethodRequest = {
            name,
            type: get(row.values, 'type') as PaymentMethodRequest['type'],
            issuer: get(row.values, 'issuer') || undefined,
            active: bool(get(row.values, 'active')),
            statementClosingDay: optionalNumber(get(row.values, 'statement closing day')),
            paymentDay: optionalNumber(get(row.values, 'payment day')),
          }
          const created = await createPaymentMethod(request)
          methodByName.set(key(created.name), created)
        }

        let fixedPaymentsImported = 0
        for (const row of result.fullDataRows.filter((item) => item.recordType === 'FIXED_PAYMENT')) {
          const account = accountByName.get(key(get(row.values, 'account')))
          if (!account) continue
          const method = methodByName.get(key(get(row.values, 'payment method')))
          await createRecurringTransaction({
            type: get(row.values, 'type') as 'INCOME' | 'EXPENSE',
            category: get(row.values, 'category'),
            description: get(row.values, 'description'),
            amount: number(get(row.values, 'amount')),
            startDate: get(row.values, 'start date'),
            endDate: get(row.values, 'end date') || undefined,
            dayOfMonth: optionalNumber(get(row.values, 'day of month')),
            accountId: account.id,
            paymentMethodId: method?.id ?? null,
          })
          fixedPaymentsImported++
        }

        let installmentsImported = 0
        for (const row of result.fullDataRows.filter((item) => item.recordType === 'INSTALLMENT_PLAN')) {
          const account = accountByName.get(key(get(row.values, 'account')))
          if (!account) continue
          const method = methodByName.get(key(get(row.values, 'payment method')))
          await createInstallmentPlan({
            totalInstallments: number(get(row.values, 'total installments')),
            installmentValue: number(get(row.values, 'installment value')),
            category: get(row.values, 'category'),
            description: get(row.values, 'description')
              .replace(/\s*\(Installment\s+\d+\/\d+\)\s*$/i, '')
              .trim(),
            startDate: get(row.values, 'first date'),
            purchaseDate: get(row.values, 'first date'),
            accountId: account.id,
            paymentMethodId: method?.id ?? null,
          })
          installmentsImported++
        }

        const standaloneTransactions = result.rows.filter(
          (row) => !row.installmentPlanId && !row.fixedPaymentId,
        )
        const transactionOutcome = standaloneTransactions.length > 0
          ? await importTransactions(
              standaloneTransactions.map((row) => ({
                line: row.line,
                date: row.date,
                type: row.type,
                category: row.category,
                description: row.description,
                amount: row.amount,
                paymentMethodName: row.paymentMethodName || undefined,
                accountName: row.accountName || undefined,
                paymentDate: row.paymentDate,
                status: row.status,
              })),
              null,
            )
          : { imported: 0, failed: 0, errors: [] }

        ToastService.success({
          title: 'Data imported',
          description: `${accountByName.size} accounts available, ${methodByName.size} cards/payment methods available, ${installmentsImported} installment plans, ${fixedPaymentsImported} fixed payments and ${transactionOutcome.imported} standalone transactions imported.`,
          dedupeKey: 'csv-full-import-done',
        })
        onImported()
        reset()
        onClose()
        return
      }

      const outcome = await importTransactions(
        result.rows.map((r) => ({
          line: r.line,
          date: r.date,
          type: r.type,
          category: r.category,
          description: r.description,
          amount: r.amount,
          paymentMethodName: r.paymentMethodName || undefined,
          accountName: r.accountName || undefined,
          paymentDate: r.paymentDate,
          status: r.status,
        })),
        accountId,
      )

      if (outcome.imported > 0) {
        ToastService.success({
          title: `Imported ${outcome.imported} transaction${outcome.imported === 1 ? '' : 's'}`,
          description: outcome.failed > 0 ? `${outcome.failed} row${outcome.failed === 1 ? '' : 's'} skipped.` : undefined,
          dedupeKey: 'csv-import-done',
        })
        onImported()
        reset()
        onClose()
      } else {
        ToastService.error({
          title: 'Import failed',
          description: 'None of the rows could be saved.',
          dedupeKey: 'csv-import-failed',
        })
      }
    } catch (err) {
      ToastService.apiError(err, { title: 'Import failed', dedupeKey: 'csv-import-failed' })
    } finally {
      setImporting(false)
    }
  }

  const rows = result?.rows ?? []
  const fullDataRows = result?.fullDataRows ?? []
  const importCount = fullDataRows.length > 0 ? fullDataRows.length : rows.length
  const errors = result?.errors ?? []
  const previewRows = rows.slice(0, 8)

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <ModalHeader
          icon={Upload}
          title="Import data"
          caption="Restore a full data export or import transactions in bulk"
          accent="blue"
          onClose={handleClose}
        />
      }
      footer={
        <HStack justify="space-between" w="full">
          <Button variant="ghost" onClick={handleClose} isDisabled={importing}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={Upload} boxSize={4} />}
            onClick={runImport}
            isLoading={importing}
            loadingText="Importing…"
            isDisabled={!result || importCount === 0 || importing}
          >
            Import {importCount > 0 ? `${importCount} row${importCount === 1 ? '' : 's'}` : ''}
          </Button>
        </HStack>
      }
    >
      <VStack align="stretch" spacing={4} px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
        <FormControl>
          <FormLabel fontSize="sm">Import into account (optional)</FormLabel>
          <Select
            value={accountId ?? ''}
            onChange={(event) => setAccountId(event.target.value ? Number(event.target.value) : null)}
            placeholder="No account — associate later"
          >
            {accounts.filter((account) => account.active).map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>
          <Text fontSize="xs" color={subColor} mt={1}>
            Leave empty to match each row by the Account column. Unmatched or blank account
            names are imported without an account.
          </Text>
        </FormControl>

        {/* Drop zone */}
        <Box
          as="button"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e: React.DragEvent) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e: React.DragEvent) => {
            e.preventDefault()
            setDragOver(false)
            onFilePicked(e.dataTransfer.files?.[0])
          }}
          w="full"
          borderRadius="xl"
          border="2px dashed"
          borderColor={dragOver ? dropActiveBorder : dropBorder}
          bg={dragOver ? dropActiveBg : dropBg}
          px={6}
          py={8}
          transition="all 0.15s ease"
          _hover={{ borderColor: dropActiveBorder, bg: dropActiveBg }}
          cursor="pointer"
        >
          <VStack spacing={2}>
            <Icon as={fileName ? FileText : Upload} boxSize={7} color={dropActiveBorder} weight="duotone" />
            <Text fontSize="sm" fontWeight={700} color={dropTextColor}>
              {fileName ?? 'Click to choose a CSV, or drag & drop'}
            </Text>
            <Text fontSize="xs" color={subColor}>
              Columns: {CSV_HEADERS.join(', ')}
            </Text>
          </VStack>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => {
            onFilePicked(e.target.files?.[0])
            e.target.value = '' // allow re-selecting the same file
          }}
        />

        <HStack justify="space-between" fontSize="xs">
          <HStack
            as="button"
            type="button"
            onClick={downloadTemplate}
            spacing={1.5}
            color={linkColor}
            fontWeight={600}
          >
            <Icon as={Download} boxSize={3.5} />
            <Text>Download template</Text>
          </HStack>
        </HStack>

        {/* Summary */}
        {result && (
          <HStack spacing={3}>
            <HStack
              spacing={1.5}
              px={3}
              py={1.5}
              borderRadius="lg"
              bg={validBg}
              flex={1}
              justify="center"
            >
              <Icon as={CheckCircle2} boxSize={4} color={validColor} weight="fill" />
              <Text fontSize="sm" fontWeight={700} color={validColor}>
                {rows.length} ready
              </Text>
            </HStack>
            <HStack
              spacing={1.5}
              px={3}
              py={1.5}
              borderRadius="lg"
              bg={errorBg}
              flex={1}
              justify="center"
              opacity={errors.length === 0 ? 0.5 : 1}
            >
              <Icon as={AlertTriangle} boxSize={4} color={errorColor} weight="fill" />
              <Text fontSize="sm" fontWeight={700} color={errorColor}>
                {errors.length} skipped
              </Text>
            </HStack>
          </HStack>
        )}

        {/* Import progress */}
        {importing && <Progress isIndeterminate size="sm" colorScheme="blue" borderRadius="full" />}

        {/* Preview table */}
        {previewRows.length > 0 && (
          <Box border="1px solid" borderColor={tableBorder} borderRadius="xl" overflow="hidden">
            <TableContainer>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    {['Date', 'Type', 'Category', 'Description', 'Amount', 'Method'].map((h) => (
                      <Th key={h} color={tableHeadColor} fontSize="2xs" borderColor={tableBorder}>
                        {h}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {previewRows.map((r) => (
                    <Tr key={r.line}>
                      <Td color={cellColor} borderColor={tableBorder} fontSize="xs">{r.date}</Td>
                      <Td color={cellColor} borderColor={tableBorder} fontSize="xs">{r.type}</Td>
                      <Td color={cellColor} borderColor={tableBorder} fontSize="xs">{r.category}</Td>
                      <Td color={cellColor} borderColor={tableBorder} fontSize="xs" maxW="160px" isTruncated>
                        {r.description}
                      </Td>
                      <Td color={cellColor} borderColor={tableBorder} fontSize="xs" isNumeric>
                        {r.amount.toFixed(2)}
                      </Td>
                      <Td color={cellColor} borderColor={tableBorder} fontSize="xs">{r.paymentMethodName || '—'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            {rows.length > previewRows.length && (
              <Text fontSize="xs" color={subColor} px={3} py={2}>
                + {rows.length - previewRows.length} more row{rows.length - previewRows.length === 1 ? '' : 's'}
              </Text>
            )}
          </Box>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Box bg={errorPanelBg} borderRadius="xl" px={4} py={3}>
            <Text fontSize="xs" fontWeight={700} color={errorColor} mb={1.5}>
              Skipped rows
            </Text>
            <VStack align="stretch" spacing={1} maxH="120px" overflowY="auto">
              {errors.slice(0, 20).map((e, i) => (
                <Text key={i} fontSize="xs" color={errorColor}>
                  Line {e.line}: {e.message}
                </Text>
              ))}
              {errors.length > 20 && (
                <Text fontSize="xs" color={errorColor} opacity={0.7}>
                  + {errors.length - 20} more…
                </Text>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </PremiumModal>
  )
}
