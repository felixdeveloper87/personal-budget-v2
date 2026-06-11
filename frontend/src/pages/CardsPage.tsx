import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { deletePaymentMethod, listPaymentMethods, listTransactions } from '../api'
import type { PaymentMethod, Transaction } from '../types'
import { buildCardStatements } from '../utils/creditCardStatements'
import { ConfirmDeleteDialog, PageHeader } from '../components/ui'
import { ArrowLeft, CreditCard, Pencil, Plus, Trash2 } from '../components/ui/icons'
import CreditCardTile from '../components/cards/CreditCardTile'
import CardFormModal from '../components/cards/CardFormModal'
import StatementCard from '../components/cards/StatementCard'
import { ToastService } from '../services/toast'

export default function CardsPage() {
  const [cards, setCards] = useState<PaymentMethod[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [openStatementKey, setOpenStatementKey] = useState<string | null>(null)

  // Create/edit modal: `undefined` closed, `null` create, a card edits it.
  const [formCard, setFormCard] = useState<PaymentMethod | null | undefined>(undefined)
  const [cardToDelete, setCardToDelete] = useState<PaymentMethod | null>(null)
  const [deleting, setDeleting] = useState(false)

  const muted = useColorModeValue('gray.500', 'gray.400')
  const emptyBorder = useColorModeValue('gray.200', 'gray.700')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [methods, txs] = await Promise.all([listPaymentMethods(), listTransactions()])
      setCards(methods.filter((m) => m.type === 'CREDIT_CARD'))
      setTransactions(txs)
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not load cards',
        dedupeKey: 'cards-page-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedId) ?? null,
    [cards, selectedId],
  )

  const statements = useMemo(
    () => (selectedCard ? buildCardStatements(selectedCard, transactions) : []),
    [selectedCard, transactions],
  )

  // Per-card current-statement total, for the tile preview.
  const currentTotals = useMemo(() => {
    const totals = new Map<number, { total: number; count: number }>()
    for (const card of cards) {
      const sts = buildCardStatements(card, transactions)
      const current = sts.find((s) => s.status === 'open')
      totals.set(card.id, { total: current?.total ?? 0, count: sts.length })
    }
    return totals
  }, [cards, transactions])

  const selectCard = (id: number) => {
    setSelectedId(id)
    const sts = buildCardStatements(
      cards.find((c) => c.id === id)!,
      transactions,
    )
    // Open the current statement by default, else the most recent one.
    const initial = sts.find((s) => s.status === 'open') ?? sts[0]
    setOpenStatementKey(initial?.key ?? null)
  }

  const confirmDelete = async () => {
    if (!cardToDelete) return
    setDeleting(true)
    try {
      await deletePaymentMethod(cardToDelete.id)
      ToastService.success({ title: 'Card deleted', dedupeKey: `card-deleted:${cardToDelete.id}` })
      if (selectedId === cardToDelete.id) setSelectedId(null)
      setCardToDelete(null)
      await load()
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not delete card',
        dedupeKey: `card-delete-failed:${cardToDelete.id}`,
      })
    } finally {
      setDeleting(false)
    }
  }

  // Modals are shared by both views, rendered once at the end.
  const modals = (
    <>
      <CardFormModal
        isOpen={formCard !== undefined}
        card={formCard}
        onClose={() => setFormCard(undefined)}
        onSaved={load}
      />
      <ConfirmDeleteDialog
        isOpen={cardToDelete !== null}
        onClose={() => setCardToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Delete card"
        itemName={cardToDelete?.name}
        description="Removes the card and its statement settings. Transactions are kept."
      />
    </>
  )

  if (loading) {
    return (
      <CardsShell>
        <HStack justify="center" py={20}>
          <Spinner color="blue.500" />
        </HStack>
      </CardsShell>
    )
  }

  // ---- Detail view: a single card's statements ----
  if (selectedCard) {
    return (
      <CardsShell>
        <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
          <Box>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Icon as={ArrowLeft} boxSize={4} />}
              onClick={() => setSelectedId(null)}
              mb={2}
              pl={1}
            >
              All cards
            </Button>
            <PageHeader
              icon={CreditCard}
              title={selectedCard.name}
              subtitle={`${selectedCard.issuer ? `${selectedCard.issuer} · ` : ''}Closes day ${selectedCard.statementClosingDay} · Pays day ${selectedCard.paymentDay}`}
              rightSlot={
                <HStack spacing={2}>
                  <Button
                    variant="outline"
                    leftIcon={<Icon as={Pencil} boxSize={4} />}
                    onClick={() => setFormCard(selectedCard)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="red"
                    leftIcon={<Icon as={Trash2} boxSize={4} />}
                    onClick={() => setCardToDelete(selectedCard)}
                  >
                    Delete
                  </Button>
                </HStack>
              }
            />
          </Box>

          {statements.length === 0 ? (
            <EmptyState
              border={emptyBorder}
              muted={muted}
              text="No charges on this card yet."
            />
          ) : (
            <VStack align="stretch" spacing={3}>
              {statements.map((statement) => (
                <StatementCard
                  key={statement.key}
                  statement={statement}
                  isOpen={openStatementKey === statement.key}
                  onToggle={() =>
                    setOpenStatementKey((current) =>
                      current === statement.key ? null : statement.key,
                    )
                  }
                />
              ))}
            </VStack>
          )}
        </VStack>
        {modals}
      </CardsShell>
    )
  }

  // ---- Overview: grid of cards ----
  return (
    <CardsShell>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <PageHeader
          icon={CreditCard}
          title="Cards"
          subtitle="Select a card to see its current and past statements."
          rightSlot={
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={Plus} boxSize={4} />}
              onClick={() => setFormCard(null)}
              w={{ base: 'full', sm: 'auto' }}
            >
              Add card
            </Button>
          }
        />

        {cards.length === 0 ? (
          <EmptyState
            border={emptyBorder}
            muted={muted}
            text="No credit cards yet. Add your first card to start tracking statements."
          />
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
            {cards.map((card) => {
              const info = currentTotals.get(card.id)
              return (
                <CreditCardTile
                  key={card.id}
                  card={card}
                  currentTotal={info?.total ?? 0}
                  statementCount={info?.count ?? 0}
                  onSelect={() => selectCard(card.id)}
                  onEdit={() => setFormCard(card)}
                  onDelete={() => setCardToDelete(card)}
                />
              )
            })}
          </SimpleGrid>
        )}
      </VStack>
      {modals}
    </CardsShell>
  )
}

function CardsShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      w="full"
      maxW="1400px"
      mx="auto"
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 4, md: 7 }}
    >
      {children}
    </Box>
  )
}

function EmptyState({
  text,
  border,
  muted,
}: {
  text: string
  border: string
  muted: string
}) {
  return (
    <Box py={12} textAlign="center" border="1px dashed" borderColor={border} borderRadius="xl">
      <Icon as={CreditCard} boxSize={7} color={muted} mb={3} />
      <Text fontSize="sm" color={muted}>
        {text}
      </Text>
    </Box>
  )
}
