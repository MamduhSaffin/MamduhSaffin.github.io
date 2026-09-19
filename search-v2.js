(() => {
  const existing = document.getElementById('site-search-panel-v2');
  if (existing) return;

  const isArabic = document.documentElement.lang === 'ar' || document.body.classList.contains('rtl');
  const copy = isArabic ? {
    open: 'بحث', title: 'البحث في هذه الصفحة', placeholder: 'اكتب كلمة أو عبارة…',
    prev: 'السابق', next: 'التالي', close: 'إغلاق', empty: 'اكتب للبحث في محتوى هذه الصفحة', none: 'لا توجد نتائج'
  } : {
    open: 'Search', title: 'Search this page', placeholder: 'Type a word or phrase…',
    prev: 'Previous', next: 'Next', close: 'Close', empty: 'Type to search the content on this page', none: 'No results'
  };

  let openButton = document.getElementById('site-search-open');
  if (!openButton) {
    openButton = document.createElement('button');
    openButton.id = 'site-search-open';
    openButton.type = 'button';
    openButton.textContent = `🔍 ${copy.open}`;
    const nav = document.querySelector('.nav-links');
    (nav || document.querySelector('.nav-inner') || document.body).appendChild(openButton);
  }
  openButton.type = 'button';
  openButton.classList.add('site-search-open');
  openButton.setAttribute('aria-label', copy.title);
  if (!openButton.textContent.trim()) openButton.textContent = `🔍 ${copy.open}`;

  const style = document.createElement('style');
  style.id = 'site-search-v2-style';
  style.textContent = `
    #site-search-open{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:0 14px;border:1px solid #dde5e1;border-radius:999px;background:#173d32;color:#fff;font:inherit;font-size:.9rem;font-weight:800;cursor:pointer;white-space:nowrap}
    #site-search-open:hover{background:#235b49}
    #site-search-panel-v2[hidden]{display:none!important}
    #site-search-panel-v2{position:fixed;inset:0;z-index:9999;background:rgba(9,29,23,.68);backdrop-filter:blur(7px);display:flex;align-items:flex-start;justify-content:center;padding:90px 18px 24px}
    .ssv2-dialog{width:min(760px,100%);background:#fff;color:#10261f;border-radius:22px;padding:24px;box-shadow:0 30px 90px rgba(5,28,20,.3)}
    .ssv2-top{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}.ssv2-top h2{font-family:Georgia,serif;font-size:2rem;line-height:1.1;margin:4px 0 18px}.ssv2-kicker{color:#b89558;font-size:.72rem;font-weight:900;letter-spacing:.12em}.ssv2-close{width:42px;height:42px;border:1px solid #dde5e1;border-radius:50%;background:#fff;color:#173d32;font-size:1.6rem;cursor:pointer}
    .ssv2-form{display:flex;align-items:center;gap:10px;border:2px solid #173d32;border-radius:14px;padding:0 14px}.ssv2-form input{width:100%;height:54px;border:0;outline:0;background:transparent;font:inherit;font-size:1rem;color:#10261f}.ssv2-controls{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:16px}.ssv2-status{color:#66746e;font-size:.9rem}.ssv2-nav{display:flex;gap:8px}.ssv2-nav button{border:1px solid #dde5e1;background:#f8faf9;color:#173d32;border-radius:10px;padding:9px 12px;font:inherit;font-size:.82rem;font-weight:800;cursor:pointer}.ssv2-nav button:disabled{opacity:.4;cursor:default}
    mark.ssv2-hit{background:#ffe6a7;color:#17231e;padding:1px 2px;border-radius:3px}mark.ssv2-hit.active{background:#f0b84b;box-shadow:0 0 0 3px rgba(240,184,75,.25)}
    body.ssv2-open{overflow:hidden}
    @media(max-width:900px){#site-search-open{width:100%;border-radius:12px;min-height:44px}.ssv2-dialog{padding:20px}.ssv2-top h2{font-size:1.6rem}.ssv2-controls{align-items:flex-start;flex-direction:column}.ssv2-nav{width:100%}.ssv2-nav button{flex:1}}
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.id = 'site-search-panel-v2';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="ssv2-dialog" role="dialog" aria-modal="true" aria-labelledby="ssv2-title">
      <div class="ssv2-top"><div><div class="ssv2-kicker">TGPU GULF ADVISORY</div><h2 id="ssv2-title">${copy.title}</h2></div><button class="ssv2-close" type="button" aria-label="${copy.close}">×</button></div>
      <div class="ssv2-form"><span aria-hidden="true">🔍</span><input id="ssv2-input" type="search" autocomplete="off" placeholder="${copy.placeholder}" aria-label="${copy.title}"></div>
      <div class="ssv2-controls"><div class="ssv2-status">${copy.empty}</div><div class="ssv2-nav"><button class="ssv2-prev" type="button" disabled>← ${copy.prev}</button><button class="ssv2-next" type="button" disabled>${copy.next} →</button></div></div>
    </div>`;
  document.body.appendChild(panel);

  const input = panel.querySelector('#ssv2-input');
  const status = panel.querySelector('.ssv2-status');
  const prev = panel.querySelector('.ssv2-prev');
  const next = panel.querySelector('.ssv2-next');
  const close = panel.querySelector('.ssv2-close');
  let hits = [], active = -1, timer;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function clear() {
    document.querySelectorAll('mark.ssv2-hit').forEach(m => {
      const t = document.createTextNode(m.textContent || ''); m.replaceWith(t); if (t.parentNode) t.parentNode.normalize();
    }); hits = []; active = -1;
  }
  function update() {
    const q = input.value.trim();
    status.textContent = !q ? copy.empty : !hits.length ? copy.none : `${active + 1} / ${hits.length}`;
    prev.disabled = next.disabled = hits.length < 2;
  }
  function activate(i) {
    if (!hits.length) return;
    hits.forEach(h => h.classList.remove('active'));
    active = (i + hits.length) % hits.length;
    hits[active].classList.add('active');
    hits[active].scrollIntoView({behavior:'smooth',block:'center'});
    update();
  }
  function run() {
    clear();
    const q = input.value.trim(); if (!q) return update();
    const root = document.querySelector('main') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode(n){
      const p=n.parentElement; if(!p||!n.nodeValue||!n.nodeValue.trim()||p.closest('script,style,noscript,mark,#site-search-panel-v2')) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    const re=new RegExp(esc(q),'gi');
    nodes.forEach(n=>{const text=n.nodeValue; re.lastIndex=0; if(!re.test(text)) return; re.lastIndex=0; const frag=document.createDocumentFragment(); let last=0,m; while((m=re.exec(text))){frag.appendChild(document.createTextNode(text.slice(last,m.index))); const mark=document.createElement('mark'); mark.className='ssv2-hit'; mark.textContent=m[0]; frag.appendChild(mark); last=m.index+m[0].length; if(re.lastIndex===m.index) re.lastIndex++;} frag.appendChild(document.createTextNode(text.slice(last))); n.replaceWith(frag);});
    hits=Array.from(document.querySelectorAll('main mark.ssv2-hit')); hits.length?activate(0):update();
  }
  function show(){panel.hidden=false;document.body.classList.add('ssv2-open');setTimeout(()=>input.focus(),20)}
  function hide(){panel.hidden=true;document.body.classList.remove('ssv2-open');clear();input.value='';update()}
  openButton.addEventListener('click',show); close.addEventListener('click',hide); panel.addEventListener('click',e=>{if(e.target===panel)hide()});
  input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,120)}); prev.addEventListener('click',()=>activate(active-1)); next.addEventListener('click',()=>activate(active+1));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)hide();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();panel.hidden?show():hide();}});
})();
