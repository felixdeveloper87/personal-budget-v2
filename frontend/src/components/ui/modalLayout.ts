/**
 * The one place that decides how big modals are.
 *
 * Phones and small tablets (below Chakra's `md`, 48em): every modal is a bottom
 * sheet, like a native app sheet — full width, anchored to the bottom, one fixed
 * height, rounded top corners. Change SHEET_HEIGHT to resize every modal at once.
 *
 * Desktop (`md` and up): each modal keeps whatever size its caller asks for.
 *
 * The sheet is applied through a max-width media query inside `sx` rather than
 * responsive props: a responsive `base` value also applies on desktop whenever
 * the caller set no `md` value, which would stretch desktop dialogs.
 */

/** Height of every modal on mobile. */
export const SHEET_HEIGHT = '80dvh'
export const SHEET_RADIUS = '28px'

/** Everything narrower than Chakra's `md` breakpoint (48em) is "mobile". */
export const MOBILE_MEDIA = '@media screen and (max-width: 47.99em)'

/**
 * `!important` because callers still pass their own responsive sizes (for
 * desktop), and those generate media rules whose order relative to ours is not
 * guaranteed; on mobile the sheet must always win.
 */
const important = (value: string | number) => `${value} !important`
const SHEET_CSS = {
  width: important('100%'),
  maxWidth: important('100vw'),
  height: important(SHEET_HEIGHT),
  maxHeight: important(SHEET_HEIGHT),
  minHeight: important(0),
  marginTop: important('auto'),
  marginBottom: important(0),
  marginLeft: important(0),
  marginRight: important(0),
  borderRadius: important(`${SHEET_RADIUS} ${SHEET_RADIUS} 0 0`),
  // Modals whose body does not scroll on its own stay reachable at a fixed height.
  overflowY: 'auto',
} as const

type WithSx = { sx?: Record<string, unknown> } & Record<string, unknown>

/**
 * Props for `ModalContent`: the caller's props (which still drive the desktop
 * size), plus the mobile sheet, which overrides any mobile sizing they set.
 */
export function sheetContentProps<T extends WithSx>(props?: T): T {
  const callerSx = (props?.sx ?? {}) as Record<string, unknown>
  const callerMobile = (callerSx[MOBILE_MEDIA] ?? {}) as Record<string, unknown>
  return {
    ...(props ?? {}),
    sx: {
      ...callerSx,
      // Ours last, so the sheet wins on mobile whatever the caller passed.
      [MOBILE_MEDIA]: { ...callerMobile, ...SHEET_CSS },
    },
  } as unknown as T
}

/** `sx` for a plain Chakra `ModalContent` that has no `sx` of its own. */
export const SHEET_SX = sheetContentProps().sx

/** For `ModalContent`'s `containerProps`: bottom-anchored on mobile, centred on desktop. */
export const sheetContainerProps = {
  alignItems: { base: 'flex-end', md: 'center' },
  justifyContent: 'center',
} as const

/** Small "grabber" bar drawn at the top of a sheet (mobile only). */
export const sheetGrabberProps = {
  'aria-hidden': true,
  display: { base: 'block', md: 'none' },
  position: 'absolute',
  top: '8px',
  left: '50%',
  transform: 'translateX(-50%)',
  w: '36px',
  h: '5px',
  borderRadius: 'full',
  bg: 'var(--pb-hair-2, rgba(0, 0, 0, 0.15))',
  zIndex: 4,
  pointerEvents: 'none',
} as const
