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
