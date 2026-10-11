import { ArrowRight, ChevronDown } from 'lucide-react'
import BrandMark from '../../components/brand/BrandMark'
import LanguageToggle from '../../components/layout/header/LanguageToggle'
import { OnBrandContext } from '../../components/layout/header/onBrand'
import { useI18n } from '../../i18n'
import './LandingMobile.css'

interface LandingMobileProps {
  onRequestAccess: () => void
  onSignIn: () => void
}

/* Organic purple waves + floating spots, in the spirit of an app splash.
   Sliced to the top of the screen so it scales with any phone height. */
function SplashArtwork() {
  return (
    <svg
      className="pbm-art"
      viewBox="0 0 390 600"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="pbm-art__wave pbm-art__wave--back"
        d="M0 0H390V330C350 360 318 300 268 318C214 338 236 420 170 440C110 458 84 400 40 420C20 429 8 446 0 460Z"
      />
      <path
        className="pbm-art__wave pbm-art__wave--front"
        d="M0 0H300C340 40 300 92 252 104C196 118 182 72 132 96C78 122 128 196 78 236C46 262 18 250 0 262Z"
      />
      <g className="pbm-art__spots">
        <ellipse cx="318" cy="96" rx="30" ry="34" />
        <circle cx="348" cy="176" r="9" />
        <ellipse cx="214" cy="248" rx="22" ry="18" />
        <circle cx="96" cy="330" r="7" />
        <ellipse cx="300" cy="392" rx="14" ry="12" />
        <circle cx="172" cy="34" r="6" />
      </g>
      <g className="pbm-art__bubbles">
        <circle cx="62" cy="150" r="5" />
        <circle cx="262" cy="196" r="4" />
        <circle cx="354" cy="292" r="6" />
      </g>
    </svg>
  )
}

export default function LandingMobile({ onRequestAccess, onSignIn }: LandingMobileProps) {
  const { t } = useI18n()

  return (
    <header className="pbm" id="top">
      <SplashArtwork />

      <div className="pbm-top">
        <BrandMark variant="title" colorMode="dark" size={148} />
        <OnBrandContext.Provider value>
          <LanguageToggle />
        </OnBrandContext.Provider>
      </div>

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
