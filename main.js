/* ─────────────────────────────────────────
   Navbar – scroll shadow + mobile toggle + active link
───────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');
const navLinks  = navMenu.querySelectorAll('.nav__link');

// Scroll shadow
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Mobile toggle
function openMenu() {
  navMenu.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Fechar menu');
}
function closeMenu() {
  navMenu.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Abrir menu');
}

navToggle.addEventListener('click', () => {
  navMenu.classList.contains('open') ? closeMenu() : openMenu();
});

// Close on link click (mobile)
navLinks.forEach(link => link.addEventListener('click', closeMenu));

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) closeMenu();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeMenu(); navToggle.focus(); }
});

// Active link on scroll
const sections = document.querySelectorAll('section[id], header[id]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = navMenu.querySelector(`[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

/* ─────────────────────────────────────────
   Reveal on scroll
───────────────────────────────────────── */
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings inside the same parent
      const siblings = [...entry.target.parentElement.querySelectorAll('[data-reveal]')];
      const delay = siblings.indexOf(entry.target) * 80;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

/* ─────────────────────────────────────────
   Carousel
───────────────────────────────────────── */
(function initCarousel() {
  const track      = document.getElementById('carouselTrack');
  const dotsWrap   = document.getElementById('carouselDots');
  const thumbsWrap = document.getElementById('thumbsTrack');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');
  const slides     = track.querySelectorAll('.carousel__slide');
  const total      = slides.length;
  let current      = 0;
  let autoTimer    = null;
  let isDragging   = false;
  let startX       = 0;
  let dragDelta    = 0;

  // ── Build dots ──
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Print ${i + 1}`);
    dot.setAttribute('aria-selected', String(i === 0));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  // ── Build thumbnails ──
  slides.forEach((slide, i) => {
    const img = slide.querySelector('img');
    const thumb = document.createElement('button');
    thumb.className = 'thumb' + (i === 0 ? ' active' : '');
    thumb.setAttribute('role', 'listitem');
    thumb.setAttribute('aria-label', img.alt);
    const tImg = document.createElement('img');
    tImg.src = img.src;
    tImg.alt = '';
    tImg.loading = 'lazy';
    tImg.width  = 90;
    tImg.height = 62;
    thumb.appendChild(tImg);
    thumb.addEventListener('click', () => goTo(i));
    thumbsWrap.appendChild(thumb);
  });

  const dots   = dotsWrap.querySelectorAll('.carousel__dot');
  const thumbs = thumbsWrap.querySelectorAll('.thumb');

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i)   => { d.classList.toggle('active', i === current); d.setAttribute('aria-selected', String(i === current)); });
    thumbs.forEach((t, i) => t.classList.toggle('active', i === current));

    // Scroll active thumb into view (only inside the thumbs container, never moves the page)
    const activeThumb = thumbs[current];
    const thumbLeft   = activeThumb.offsetLeft;
    const thumbWidth  = activeThumb.offsetWidth;
    const wrapWidth   = thumbsWrap.offsetWidth;
    const scrollTarget = thumbLeft - (wrapWidth / 2) + (thumbWidth / 2);
    thumbsWrap.scrollTo({ left: scrollTarget, behavior: 'smooth' });

    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // Keyboard
  document.querySelector('#carousel').addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  // ── Touch / drag ──
  function onDragStart(x) { isDragging = true; startX = x; dragDelta = 0; }
  function onDragMove(x)  { if (!isDragging) return; dragDelta = x - startX; }
  function onDragEnd()    {
    if (!isDragging) return;
    isDragging = false;
    if (dragDelta < -50)      next();
    else if (dragDelta > 50)  prev();
  }

  track.addEventListener('touchstart',  e => onDragStart(e.touches[0].clientX),   { passive: true });
  track.addEventListener('touchmove',   e => onDragMove(e.touches[0].clientX),    { passive: true });
  track.addEventListener('touchend',    onDragEnd);

  track.addEventListener('mousedown',   e => onDragStart(e.clientX));
  track.addEventListener('mousemove',   e => onDragMove(e.clientX));
  track.addEventListener('mouseup',     onDragEnd);
  track.addEventListener('mouseleave',  onDragEnd);

  // ── Autoplay ──
  function startAuto() { autoTimer = setInterval(next, 3500); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  // Pause on hover/focus
  const carousel = document.getElementById('carousel');
  carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin',    () => clearInterval(autoTimer));
  carousel.addEventListener('focusout',   startAuto);

  startAuto();
})();
