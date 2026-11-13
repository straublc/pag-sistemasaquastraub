/* ─────────────────────────────────────────
   Navegação: sombra ao rolar, menu mobile, link ativo
───────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');
const navLinks  = navMenu.querySelectorAll('.nav__link');

// Lê scrollY uma vez por quadro (rAF) e só altera a classe quando o estado muda,
// evitando ajustes forçados (leitura de layout logo após invalidar estilos).
let navScrolled = false;
let scrollTicking = false;
function updateNavShadow() {
  scrollTicking = false;
  const next = window.scrollY > 8;
  if (next !== navScrolled) {
    navScrolled = next;
    navbar.classList.toggle('scrolled', next);
  }
}
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateNavShadow);
}, { passive: true });
updateNavShadow();

function setMenu(open) {
  navMenu.classList.toggle('open', open);
  navbar.classList.toggle('menu-open', open);
  document.body.classList.toggle('menu-lock', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', e => { if (!navbar.contains(e.target)) setMenu(false); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) { setMenu(false); navToggle.focus(); }
});

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('section[id], header[id]').forEach(s => sectionObserver.observe(s));

/* ─────────────────────────────────────────
   Revelação ao rolar (com escalonamento entre irmãos)
───────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.children].filter(el => el.hasAttribute('data-reveal'));
    const delay = Math.min(siblings.indexOf(entry.target), 5) * 60;
    setTimeout(() => entry.target.classList.add('visible'), delay);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ─────────────────────────────────────────
   Comparativo: reproduzir os dois vídeos lado a lado
───────────────────────────────────────── */
(function initCompare() {
  const oldV  = document.getElementById('videoOld');
  const newV  = document.getElementById('videoNew');
  const btn   = document.getElementById('syncPlay');
  const label = document.getElementById('syncLabel');
  if (!oldV || !newV || !btn) return;

  const videos = [oldV, newV];
  let syncing = false;

  function setState(on) {
    syncing = on;
    btn.setAttribute('aria-pressed', String(on));
    label.textContent = on ? 'Pausar os dois' : 'Reproduzir lado a lado';
  }

  btn.addEventListener('click', () => {
    if (syncing) {
      videos.forEach(v => v.pause());
      setState(false);
      return;
    }
    videos.forEach(v => { v.muted = true; v.play().catch(() => {}); });
    setState(true);
  });

  // Se o usuário pausar um vídeo manualmente, sai do modo sincronizado
  videos.forEach(v => v.addEventListener('pause', () => { if (syncing) setState(false); }));

  // Tocar um vídeo isoladamente pausa o outro (fora do modo lado a lado)
  videos.forEach(v => v.addEventListener('play', () => {
    if (syncing) return;
    videos.filter(o => o !== v).forEach(o => o.pause());
  }));
})();
