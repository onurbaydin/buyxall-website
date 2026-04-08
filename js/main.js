/* ─────────────────────────────────────────────
   buyXall digital — Main JS
   Scroll animations, nav behavior, interactions
───────────────────────────────────────────── */

// ── Nav scroll behavior ─────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


// ── Mobile menu ─────────────────────────────
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  burger.classList.toggle('open');
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !burger.contains(e.target)) {
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
  }
});


// ── Reveal on scroll (Intersection Observer) ─
const revealEls = document.querySelectorAll('.reveal, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px',
});

revealEls.forEach(el => revealObserver.observe(el));


// ── Parallax: hero visual subtle float ───────
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        heroVisual.style.transform = `translateY(${scrolled * 0.12}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}


// ── Smooth active nav link ────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));


// ── Contact form (mailto fallback) ───────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value || 'Inquiry from buyxall.com';
    const message = document.getElementById('message').value;

    const mailtoBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`
    );
    const mailtoSubject = encodeURIComponent(subject);
    window.location.href = `mailto:hello@buyxall.com?subject=${mailtoSubject}&body=${mailtoBody}`;
  });
}


// ── App screenshots hover animation ──────────
const screenshots = document.querySelectorAll('.ss');
screenshots.forEach((ss, i) => {
  ss.addEventListener('mouseenter', () => {
    ss.style.transform = i === 1
      ? 'translateX(-50%) translateY(-20px) scale(1.05)'
      : `rotate(${i === 0 ? -3 : 3}deg) translateY(-12px) scale(1.05)`;
    ss.style.zIndex = '10';
    ss.style.boxShadow = '0 24px 60px rgba(34,34,34,0.3)';
  });
  ss.addEventListener('mouseleave', () => {
    ss.style.transform = '';
    ss.style.zIndex = '';
    ss.style.boxShadow = '';
  });
});


// ── Burger animation ──────────────────────────
const style = document.createElement('style');
style.textContent = `
  .nav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .nav-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .nav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .nav-links a.active { color: var(--orange) !important; }
`;
document.head.appendChild(style);
