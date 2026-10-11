import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, Eye, EyeOff, ShoppingBasket } from 'lucide-react'
import BrandMark from '../../components/brand/BrandMark'
import BrandWaves from '../../components/brand/BrandWaves'
import LanguageToggle from '../../components/layout/header/LanguageToggle'
import { OnBrandContext } from '../../components/layout/header/onBrand'
import { useI18n } from '../../i18n'
import './LandingMobile.css'

interface LandingMobileProps {
  onRequestAccess: () => void
  onSignIn: () => void
}

// The splash tells one tiny story, once: the balance counts up, a purchase
// lands as a notification, the balance settles. Then everything rests.
const BALANCE = 2287.2
const PURCHASE = 42.8
const MONTH_GAIN = 540
const FORECAST = 2640
const COUNT_UP_AT = 450
const PURCHASE_AT = 2100
const MASK = '••••••'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Tweens towards `target` with an ease-out curve whenever it changes. */
function useTweenedNumber(target: number, duration: number) {
  const [value, setValue] = useState(target)
  const currentRef = useRef(target)

  useEffect(() => {
    const from = currentRef.current
    if (from === target) return
    if (prefersReducedMotion()) {
      currentRef.current = target
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      currentRef.current = from + (target - from) * eased
      setValue(currentRef.current)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [duration, target])

  return value
}

function BalanceStage() {
  const { t, formatCurrency } = useI18n()
  const [target, setTarget] = useState(() => (prefersReducedMotion() ? BALANCE - PURCHASE : 0))
  const [purchased, setPurchased] = useState(prefersReducedMotion)
  const [hidden, setHidden] = useState(false)
  const balance = useTweenedNumber(target, target === BALANCE ? 1300 : 650)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const timers = [
      window.setTimeout(() => setTarget(BALANCE), COUNT_UP_AT),
      window.setTimeout(() => {
        setPurchased(true)
        setTarget(BALANCE - PURCHASE)
      }, PURCHASE_AT),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [])

  return (
    <div className="pbm-stage">
      <div className="pbm-card pbm-card--back" aria-hidden="true">
        <small>{t('landing.snapshot.forecastLabel')}</small>
        <b>{hidden ? MASK : formatCurrency(FORECAST, { maximumFractionDigits: 0 })}</b>
      </div>

      <div className="pbm-card pbm-card--front">
        <div className="pbm-card__head">
          <small>{t('landing.snapshot.availableLabel')}</small>
          <button
            type="button"
            className="pbm-card__eye"
            aria-pressed={hidden}
            aria-label={hidden ? t('landing.mobile.showBalance') : t('landing.mobile.hideBalance')}
            onClick={() => setHidden((value) => !value)}
          >
            {hidden ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>

        <strong className="pbm-card__amount">
          {hidden ? <span className="pbm-card__mask" /> : formatCurrency(balance)}
        </strong>

        <span className="pbm-card__delta">
          {t('landing.snapshot.delta', { amount: `+${formatCurrency(MONTH_GAIN)}` })}
        </span>

        <svg className="pbm-spark" viewBox="0 0 300 64" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="pbm-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#820ad1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#820ad1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="pbm-spark__area"
            d="M0 54C30 52 36 36 64 38C92 40 104 22 136 26C170 30 178 10 212 14C240 17 258 4 300 6V64H0Z"
            fill="url(#pbm-spark-fill)"
          />
          <path
            className="pbm-spark__line"
            pathLength={1}
            d="M0 54C30 52 36 36 64 38C92 40 104 22 136 26C170 30 178 10 212 14C240 17 258 4 300 6"
          />
          <circle className="pbm-spark__dot" cx="300" cy="6" r="4" />
        </svg>
      </div>

      <div className={`pbm-toast${purchased ? ' is-in' : ''}`} aria-hidden="true">
        <span className="pbm-toast__icon">
          <ShoppingBasket size={16} strokeWidth={2} />
        </span>
        <span className="pbm-toast__copy">
          <small>{t('landing.snapshot.transactionAdded')}</small>
          <b>{t('landing.snapshot.transaction.groceries')}</b>
        </span>
        <strong>{hidden ? MASK : `−${formatCurrency(PURCHASE)}`}</strong>
      </div>
    </div>
  )
}

export default function LandingMobile({ onRequestAccess, onSignIn }: LandingMobileProps) {
  const { t } = useI18n()

  return (
    <header className="pbm" id="top">
      <BrandWaves className="pbm-art" />

      <div className="pbm-top">
        <BrandMark variant="title" colorMode="dark" size={196} />
        <OnBrandContext.Provider value>
          <LanguageToggle />
        </OnBrandContext.Provider>
      </div>

      <BalanceStage />

      <div className="pbm-bottom">
        <h1>{t('landing.mobile.title')}</h1>
        <p>{t('landing.mobile.subtitle')}</p>

        <div className="pbm-actions">
          <button className="pbm-button" type="button" onClick={onSignIn}>
            {t('landing.hero.signInCta')}
          </button>
          <button className="pbm-button pbm-button--ghost" type="button" onClick={onRequestAccess}>
            {t('landing.nav.requestAccess')}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        <small className="pbm-note">{t('landing.mobile.note')}</small>
        <a className="pbm-explore" href="#proof">
          {t('landing.hero.secondaryCta')}
          <ChevronDown size={16} aria-hidden="true" />
        </a>
      </div>
    </header>
  )
}
