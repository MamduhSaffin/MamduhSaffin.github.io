const menuButton = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

const OLD_PHONE = '60129153527';
const NEW_PHONE = '60128681339';
const OLD_DISPLAY = '+60 12-915 3527';
const NEW_DISPLAY = '+60 12-868 1339';

document.querySelectorAll('a[href]').forEach(a => {
  const href = a.getAttribute('href') || '';
  if (href.includes(OLD_PHONE)) a.setAttribute('href', href.replaceAll(OLD_PHONE, NEW_PHONE));
});

const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
const nodes = [];
while (walker.nextNode()) nodes.push(walker.currentNode);
nodes.forEach(n => {
  if (n.nodeValue && n.nodeValue.includes(OLD_DISPLAY)) n.nodeValue = n.nodeValue.replaceAll(OLD_DISPLAY, NEW_DISPLAY);
});

document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
  if (s.textContent && s.textContent.includes(OLD_PHONE)) s.textContent = s.textContent.replaceAll(OLD_PHONE, NEW_PHONE);
});

/* Current-page search: visible in the header on desktop and mobile. */
(() => {
  if (document.getElementById('site-search-open')) return;

  const isArabic = document.documentElement.lang === 'ar' || document.body.classList.contains('rtl');
  const copy = isArabic ? {
    open: 'بحث',
    title: 'البحث في هذه الصفحة',
    placeholder: 'اكتب كلمة أو عبارة…',
    previous: 'السابق',
    next: 'التالي',
    close: 'إغلاق',
    empty: 'اكتب للبحث في محتوى هذه الصفحة',
    noResults: 'لا توجد نتائج'
  } : {
    open: 'Search',
    title: 'Search this page',
    placeholder: 'Type a word or phrase…',
    previous: 'Previous',
    next: 'Next',
    close: 'Close',
    empty: 'Type to search the content on this page',
    noResults: 'No results'
  };

  const navInner = document.querySelector('.nav-inner');
  const menuBtn = document.querySelector('.menu-btn');
  if (!navInner) return;

  const openButton = document.createElement('button');
  openButton.id = 'site-search-open';
  openButton.className = 'site-search-open';
  openButton.type = 'button';
  openButton.setAttribute('aria-label', copy.title);
  openButton.innerHTML = `<span aria-hidden="true">⌕</span><b>${copy.open}</b>`;
  navInner.insertBefore(openButton, menuBtn || null);

  const panel = document.createElement('div');
  panel.id = 'site-search-panel';
  panel.className = 'site-search-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="site-search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
      <div class="site-search-top">
        <div>
          <div class="site-search-kicker">TGPU GULF ADVISORY</div>
          <h2 id="site-search-title">${copy.title}</h2>
        </div>
        <button class="site-search-close" type="button" aria-label="${copy.close}">×</button>
      </div>
      <div class="site-search-form">
        <span class="site-search-icon" aria-hidden="true">⌕</span>
        <input id="site-search-input" type="search" autocomplete="off" placeholder="${copy.placeholder}" aria-label="${copy.title}">
      </div>
      <div class="site-search-controls">
        <div id="site-search-status" class="site-search-status">${copy.empty}</div>
        <div class="site-search-nav">
          <button id="site-search-prev" type="button" disabled>↑ ${copy.previous}</button>
          <button id="site-search-next" type="button" disabled>${copy.next} ↓</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(panel);

  const input = panel.querySelector('#site-search-input');
  const status = panel.querySelector('#site-search-status');
  const prev = panel.querySelector('#site-search-prev');
  const next = panel.querySelector('#site-search-next');
  const close = panel.querySelector('.site-search-close');
  let hits = [];
  let activeIndex = -1;

  const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const clearHighlights = () => {
    document.querySelectorAll('mark.site-search-hit').forEach(mark => {
      const text = document.createTextNode(mark.textContent || '');
      mark.replaceWith(text);
      text.parentNode && text.parentNode.normalize();
    });
    hits = [];
    activeIndex = -1;
  };

  const updateStatus = () => {
    if (!input.value.trim()) status.textContent = copy.empty;
    else if (!hits.length) status.textContent = copy.noResults;
    else status.textContent = `${activeIndex + 1} / ${hits.length}`;
    prev.disabled = hits.length < 2;
    next.disabled = hits.length < 2;
  };

  const activate = index => {
    if (!hits.length) return;
    hits.forEach(hit => hit.classList.remove('active'));
    activeIndex = (index + hits.length) % hits.length;
    const current = hits[activeIndex];
    current.classList.add('active');
    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateStatus();
  };

  const runSearch = () => {
    clearHighlights();
    const query = input.value.trim();
    if (!query) {
      updateStatus();
      return;
    }

    const main = document.querySelector('main') || document.body;
    const textWalker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script,style,noscript,mark,.site-search-panel')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes = [];
    while (textWalker.nextNode()) textNodes.push(textWalker.currentNode);
    const regex = new RegExp(escapeRegExp(query), 'gi');

    textNodes.forEach(node => {
      const text = node.nodeValue;
      if (!regex.test(text)) {
        regex.lastIndex = 0;
        return;
      }
      regex.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        const mark = document.createElement('mark');
        mark.className = 'site-search-hit';
        mark.textContent = match[0];
        frag.appendChild(mark);
        last = match.index + match[0].length;
        if (hits.length >= 199) break;
      }
      frag.appendChild(document.createTextNode(text.slice(last)));
      node.replaceWith(frag);
    });

    hits = Array.from(document.querySelectorAll('main mark.site-search-hit'));
    if (hits.length) activate(0);
    else updateStatus();
  };

  const openPanel = () => {
    panel.hidden = false;
    document.body.classList.add('site-search-opened');
    navLinks && navLinks.classList.remove('open');
    setTimeout(() => input.focus(), 20);
  };

  const closePanel = () => {
    panel.hidden = true;
    document.body.classList.remove('site-search-opened');
    clearHighlights();
    input.value = '';
    updateStatus();
    openButton.focus();
  };

  let searchTimer;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, 120);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (hits.length) activate(activeIndex + (e.shiftKey ? -1 : 1));
      else runSearch();
    }
  });
  prev.addEventListener('click', () => activate(activeIndex - 1));
  next.addEventListener('click', () => activate(activeIndex + 1));
  openButton.addEventListener('click', openPanel);
  close.addEventListener('click', closePanel);
  panel.addEventListener('click', e => { if (e.target === panel) closePanel(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      panel.hidden ? openPanel() : closePanel();
    }
  });
})();

(() => {
  const path = location.pathname.replace(/\/+$/, '/') || '/';
  const isMainPage = path === '/' || path === '/ar/';
  if (!isMainPage || document.getElementById('tgpu-connected')) return;

  const isArabic = path === '/ar/' || document.documentElement.lang === 'ar' || document.body.classList.contains('rtl');
  const copy = isArabic ? {
    kicker: 'رحلة TGPU الأوسع',
    title: 'مبادرات مترابطة، ولكل منصة دورها الخاص.',
    intro: 'TGPU Gulf Advisory متخصصة في الأعمال بين ماليزيا والسعودية والخليج، وهي مرتبطة بمبادرات TGPU الأخرى في الإرث والتعليم والعافية والمعرفة.',
    visit: 'زيارة',
    cards: [
      ['TGPU Legacy', 'إرث العائلة والتعليم وخدمة المجتمع.', 'https://tgpu.my/'],
      ['TGPU Academy', 'القرآن واللغة العربية والتعليم الإسلامي.', 'https://tgpu.my/academy/ar.html'],
      ['TGPU Naturals', 'مبادرة العائلة لمنتجات العافية الطبيعية.', 'https://tgpu.my/wellness/?lang=ar'],
      ['GCC Market Entry', 'أدلة وموارد عملية لدخول أسواق الخليج.', 'https://gccmarketentry.me/']
    ]
  } : {
    kicker: 'THE WIDER TGPU JOURNEY',
    title: 'Connected initiatives, each with a distinct purpose.',
    intro: 'TGPU Gulf Advisory focuses on Malaysia ↔ Saudi/GCC business. It remains connected to the wider TGPU journey across legacy, education, wellness and practical market-entry knowledge.',
    visit: 'Visit',
    cards: [
      ['TGPU Legacy', 'Family legacy, education and community.', 'https://tgpu.my/'],
      ['TGPU Academy', 'Quran, Arabic and Islamic education.', 'https://tgpu.my/academy/'],
      ['TGPU Naturals', 'The family natural-wellness product initiative.', 'https://tgpu.my/wellness/'],
      ['GCC Market Entry', 'Practical GCC market-entry guides and resources.', 'https://gccmarketentry.me/']
    ]
  };

  const style = document.createElement('style');
  style.id = 'tgpu-connected-style';
  style.textContent = `
    .tgpu-connected{padding:74px 0;background:#f7f4ed;border-top:1px solid #dde5e1}
    .tgpu-connected .connected-head{max-width:780px;margin-bottom:30px}
    .tgpu-connected .connected-head h2{margin:10px 0 16px}
    .tgpu-connected .connected-head p:last-child{color:#66746e;font-size:1.05rem}
    .tgpu-connected-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
    .tgpu-connected-card{display:flex;min-height:190px;flex-direction:column;padding:24px;border:1px solid #dde5e1;border-radius:20px;background:#fff;box-shadow:0 8px 28px rgba(20,54,43,.04);transition:.2s}
    .tgpu-connected-card:hover{transform:translateY(-2px);border-color:#b89558;box-shadow:0 14px 36px rgba(20,54,43,.08)}
    .tgpu-connected-card h3{margin:0 0 8px;color:#173d32;font-size:1.12rem}
    .tgpu-connected-card p{margin:0 0 18px;color:#66746e;font-size:.92rem;line-height:1.6}
    .tgpu-connected-card span{margin-top:auto;color:#235b49;font-weight:800}
    .rtl .tgpu-connected,.rtl .tgpu-connected-card{text-align:right}
    @media(max-width:900px){.tgpu-connected-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:620px){.tgpu-connected{padding:58px 0}.tgpu-connected-grid{grid-template-columns:1fr}.tgpu-connected-card{min-height:0}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.id = 'tgpu-connected';
  section.className = 'tgpu-connected';
  section.innerHTML = `
    <div class="container">
      <div class="connected-head">
        <span class="kicker">${copy.kicker}</span>
        <h2>${copy.title}</h2>
        <p>${copy.intro}</p>
      </div>
      <div class="tgpu-connected-grid">
        ${copy.cards.map(([name, description, href]) => `<a class="tgpu-connected-card" href="${href}" target="_blank" rel="noopener"><h3>${name}</h3><p>${description}</p><span>${copy.visit} →</span></a>`).join('')}
      </div>
    </div>`;

  const footer = document.querySelector('footer');
  if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer);
})();
