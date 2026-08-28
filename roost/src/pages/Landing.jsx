import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, supportedLanguages, languageLabel } from '../i18n'
import { rtlLanguages } from '../i18n/strings'
import { coverage } from '../lib/market'
import { photos } from '../data/listings'
import './Landing.css'

// A slow-drifting wall of listing photos behind the hero, same shape as the
// bookrank landing. Built in JS because the column count depends on viewport
// width; prefers-reduced-motion stops it in CSS.
function buildWall(el) {
  const urls = photos.map(u => u.replace('w=600&h=400', 'w=320&h=420'))
  const cols = Math.max(4, Math.ceil(window.innerWidth / 220))
  el.replaceChildren()
  for (let c = 0; c < cols; c++) {
    const col = document.createElement('div')
    col.className = 'wall-col ' + (c % 2 ? 'down' : 'up')
    col.style.setProperty('--dur', `${70 + c * 11}s`)
    const slice = [...urls].sort(() => Math.random() - 0.5).slice(0, 5)
    // Doubled so the loop is seamless.
    slice.concat(slice).forEach(u => {
      const img = new Image()
      img.src = u
      img.alt = ''
      img.loading = 'lazy'
      col.appendChild(img)
    })
    el.appendChild(col)
  }
}

export default function Landing() {
  const wallRef = useRef(null)
  const { t } = useI18n()

  useEffect(() => {
    if (wallRef.current) buildWall(wallRef.current)
  }, [])

  const stats = [
    [coverage.countries, t('stat_countries')],
    [coverage.currencies, t('stat_currencies')],
    [supportedLanguages.length, t('stat_languages')],
    [rtlLanguages.length, t('stat_rtl')]
  ]

  const features = [
    ['feat_search_title', 'feat_search_body'],
    ['feat_streets_title', 'feat_streets_body'],
    ['feat_money_title', 'feat_money_body'],
    ['feat_rent_title', 'feat_rent_body']
  ]

  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="hero-wall" ref={wallRef} aria-hidden="true" />
        <div className="landing-inner">
          <svg className="hero-icon" width="72" height="72" viewBox="0 0 1024 1024" aria-hidden="true">
            <path d="M512 208 872 512H152Z" fill="currentColor" />
            <rect x="248" y="496" width="528" height="320" rx="16" fill="currentColor" />
            <rect x="440" y="640" width="144" height="176" rx="8" fill="var(--blue)" />
          </svg>
          <h1>{t('brand')}</h1>
          <p>{t('landing_pitch')}</p>
          <div className="landing-buttons">
            <Link to="/browse" className="btn btn-primary">{t('listings')}</Link>
            <Link to="/login" className="btn btn-ghost">{t('sign_in')}</Link>
            <a href="https://github.com/nulljosh/roost" className="btn btn-ghost">GitHub</a>
          </div>
        </div>
      </section>

      <section className="landing-stats">
        <dl>
          {stats.map(([n, label]) => (
            <div key={label}>
              <dt>{n}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="landing-section">
        <p className="section-label">{t('how_label')}</p>
        <h2>{t('how_title')}</h2>
        <div className="feature-grid">
          {features.map(([title, body]) => (
            <article key={title} className="card feature">
              <h3>{t(title)}</h3>
              <p>{t(body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <p className="section-label">{t('lang_label')}</p>
        <h2>{t('lang_title')}</h2>
        <p className="section-body">{t('lang_body', { n: supportedLanguages.length })}</p>
        <ul className="lang-list">
          {supportedLanguages.map(code => (
            <li key={code} lang={code} dir={rtlLanguages.includes(code) ? 'rtl' : 'ltr'}>
              {languageLabel(code)}
            </li>
          ))}
        </ul>
      </section>

      <section className="landing-section">
        <p className="section-label">{t('honest_label')}</p>
        <h2>{t('honest_title')}</h2>
        <p className="section-body">{t('honest_body')}</p>
      </section>

      <section className="landing-cta">
        <h2>{t('cta_title')}</h2>
        <p>{t('cta_body')}</p>
        <Link to="/browse" className="btn btn-primary">{t('listings')}</Link>
      </section>
    </main>
  )
}
