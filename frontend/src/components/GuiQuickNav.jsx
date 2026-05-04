import { Link } from 'react-router-dom';
import {
  ALL_GUI_SLUGS,
  ANALYSIS_OPTIONS,
  GUI_SLUG_TO_CONFIG,
  MAP_GUI_LINKS,
  PREFERRED_GUI_SLUGS,
  REQUIRED_GUI_SLUGS,
} from '../gui/guiRouteConfig';
import './GuiQuickNav.css';

export default function GuiQuickNav({ stateAbbr }) {
  if (!stateAbbr) return null;

  const analysisSlugs = ANALYSIS_OPTIONS.map((option) => option.routeSlug);
  const extra = ALL_GUI_SLUGS.filter((slug) => !analysisSlugs.includes(slug));
  const orderedSlugs = [...new Set([
    ...REQUIRED_GUI_SLUGS,
    ...PREFERRED_GUI_SLUGS,
    ...MAP_GUI_LINKS.map((link) => link.slug),
    ...analysisSlugs,
    ...extra,
  ])];

  const labelBySlug = Object.fromEntries([
    ...ALL_GUI_SLUGS.map((slug) => [slug, `${slug.toUpperCase()} · ${GUI_SLUG_TO_CONFIG[slug].title}`]),
    ...MAP_GUI_LINKS.map((link) => [link.slug, link.label]),
    ...ANALYSIS_OPTIONS.map((option) => [option.routeSlug, option.label]),
  ]);

  return (
    <nav className="gui-quick-nav" aria-label="GUI use case routes">
      <div className="gui-quick-nav__header">
        <span className="gui-quick-nav__title">Use Cases</span>
        <Link className="gui-quick-nav__link gui-quick-nav__link--home" to={`/state/${stateAbbr}`}>
          Overview
        </Link>
      </div>
      <div className="gui-quick-nav__grid">
        {orderedSlugs.map((slug) => (
          <Link key={slug} className="gui-quick-nav__link" to={slug === 'gui-24' ? '/' : `/state/${stateAbbr}/gui/${slug}`}>
            <span className="gui-quick-nav__slug">{slug.toUpperCase()}</span>
            <span className="gui-quick-nav__label">{labelBySlug[slug]?.replace(/^GUI-\d+\s*·\s*/, '') || GUI_SLUG_TO_CONFIG[slug]?.title || slug}</span>
            <span className={`gui-quick-nav__badge ${REQUIRED_GUI_SLUGS.includes(slug) ? 'gui-quick-nav__badge--required' : ''}`}>
              {REQUIRED_GUI_SLUGS.includes(slug) ? 'Req' : 'Pref'}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
