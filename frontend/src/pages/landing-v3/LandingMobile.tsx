import { ArrowRight, ChevronDown } from 'lucide-react'
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

export default function LandingMobile({ onRequestAccess, onSignIn }: LandingMobileProps) {
  const { t } = useI18n()

  return (
    <header className="pbm" id="top">
      <BrandWaves className="pbm-art" />

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
