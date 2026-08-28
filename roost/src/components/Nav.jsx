import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n, supportedLanguages, languageLabel } from '../i18n'
import PlaceSearch from './PlaceSearch'
import './Nav.css'

export default function Nav() {
  const { user } = useAuth()
  const location = useLocation()
  const { language, setLanguage, t } = useI18n()

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 21V9l9-7 9 7v12H15v-6h-2v6H3z" fill="currentColor" opacity="0.9"/>
            <path d="M10 21v-4h4v4" stroke="var(--blue-light)" strokeWidth="1.5" fill="none"/>
          </svg>
          <span>{t('brand')}</span>
        </Link>
        <PlaceSearch />
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            {t('listings')}
          </Link>
          <select
            className="nav-language"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            aria-label={t('language')}
          >
            {supportedLanguages.map(code => (
              <option key={code} value={code}>{languageLabel(code)}</option>
            ))}
          </select>
          <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}>
            {user?.name?.split(' ')[0] || t('settings')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
