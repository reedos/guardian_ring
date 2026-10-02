// Shared public-page chrome, matching IF's chapter/reference navigation.
export const PUBLICATION_NOTICE = 'Personal educational project based on cited public sources. Not an official publication of my employer or of the agencies or companies discussed. Models are schematic; estimates and assumptions are identified.';
export const REFERENCE_NAV = [['evidence', 'Evidence'], ['method', 'Method'], ['glossary', 'Glossary'], ['parts', 'Parts']];
export function siteHeader(current = '') {
  return `<header class="topbar" id="topbar">
  <a class="brand" href="index.html" aria-label="The Guardian Ring, home"><span class="mark ring-mark" aria-hidden="true"></span><span class="brand-t">The Guardian Ring</span></a>
  <nav class="topnav" id="topnav" aria-label="Site">
    <a href="index.html#ring">The ring</a><a href="index.html#satellite">Spacecraft</a><a href="index.html#payload">Payload</a><a href="index.html#data-path">Data path</a><span class="sep" aria-hidden="true"></span>
    ${REFERENCE_NAV.map(([id, title]) => `<a href="${id}.html"${id === current ? ' aria-current="page"' : ''}>${title}</a>`).join('')}
  </nav>
  <a class="btn go top-cta" id="top-cta" href="visualizer.html">Open the visualizer <span aria-hidden="true">→</span></a>
  <button type="button" class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="topnav"><span aria-hidden="true"></span>Menu</button>
</header>`;
}
export function siteFooter() {
  return `<footer class="site-footer"><div><a class="brand" href="index.html"><span class="mark ring-mark" aria-hidden="true"></span><span class="brand-t">The Guardian Ring</span></a><p>${PUBLICATION_NOTICE}</p></div><nav class="footer-links" aria-label="Footer"><a href="visualizer.html">Visualizer</a><a href="index.html">The story</a>${REFERENCE_NAV.map(([id, title]) => `<a href="${id}.html">${title}</a>`).join('')}</nav></footer>`;
}
