
// Init AOS
AOS.init({ duration: 800, once: true, offset: 60 });

// ── Dropdown Menu (JS-controlled, not CSS hover) ──
document.querySelectorAll('.dropdown').forEach(dropdown => {
  const menu = dropdown.querySelector('.dropdown-menu');
  let closeTimer;

  dropdown.addEventListener('mouseenter', () => {
    clearTimeout(closeTimer);
    // Close any other open dropdowns first
    document.querySelectorAll('.dropdown-menu.open').forEach(m => {
      if (m !== menu) m.classList.remove('open');
    });
    menu.classList.add('open');
  });

  dropdown.addEventListener('mouseleave', () => {
    closeTimer = setTimeout(() => menu.classList.remove('open'), 180);
  });

  menu.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  menu.addEventListener('mouseleave', () => {
    closeTimer = setTimeout(() => menu.classList.remove('open'), 180);
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  }
});

// ── Scroll Progress ──
window.addEventListener('scroll', () => {
  const doc = document.documentElement;
  const progress = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
  document.getElementById('scroll-progress').style.width = progress + '%';
});

// ── Navbar scroll + Back-to-top ──
window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  if (window.scrollY > 60) nb.classList.add('scrolled');
  else nb.classList.remove('scrolled');
  // Back to top — show after 400px
  const btt = document.getElementById('back-to-top');
  btt.style.display = window.scrollY > 400 ? 'flex' : 'none';
});

// ── Hamburger ──
const BARS_SVG  = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';
const CLOSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

document.getElementById('hamburger').addEventListener('click', () => {
  const m = document.getElementById('mobile-menu');
  const ic = document.getElementById('ham-icon');
  m.classList.toggle('open');
  if (ic) ic.innerHTML = m.classList.contains('open') ? CLOSE_SVG : BARS_SVG;
});
// Close mobile menu on link click
document.querySelectorAll('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.remove('open');
  const ic = document.getElementById('ham-icon');
  if (ic) ic.innerHTML = BARS_SVG;
}));

// ── Dark Mode ──
const MOON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const SUN_SVG  = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';

function toggleDark() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  const iconEl = document.getElementById('dark-icon');
  if (iconEl) iconEl.innerHTML = isDark ? SUN_SVG : MOON_SVG;
  localStorage.setItem('darkMode', isDark);
}
document.getElementById('dark-toggle').addEventListener('click', toggleDark);
document.getElementById('dark-toggle-mob').addEventListener('click', toggleDark);
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark');
  const iconEl = document.getElementById('dark-icon');
  if (iconEl) iconEl.innerHTML = SUN_SVG;
}

// ── Animated Counters ──
function animateCounter(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const isDecimal = target % 1 !== 0;
  const duration = 2000;
  const start = performance.now();
  const startVal = 0;
  function update(ts) {
    const elapsed = ts - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startVal + (target - startVal) * eased;
    el.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = isDecimal ? target.toFixed(2) : target;
  }
  requestAnimationFrame(update);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));

// ── Accordion ──
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const content = btn.nextElementSibling;
    const icon = btn.querySelector('.accordion-icon');
    const isOpen = content.classList.contains('open');
    document.querySelectorAll('.accordion-content.open').forEach(c => {
      c.classList.remove('open');
      {const ic=c.previousElementSibling.querySelector('.accordion-icon');if(ic)ic.style.transform='rotate(0deg)';}
    });
    if (!isOpen) {
      content.classList.add('open');
      if(icon)icon.style.transform='rotate(45deg)';
    }
  });
});

if(document.getElementById('testimonial-track')){
// ── Testimonial Carousel ──
let testIdx = 0;
const track = document.getElementById('testimonial-track');
function getVisible() { return window.innerWidth >= 768 ? 3 : 1; }
function getTotal() { return track.children.length; }
function updateCarousel() {
  const vis = getVisible();
  const maxIdx = getTotal() - vis;
  testIdx = Math.max(0, Math.min(testIdx, maxIdx));
  const pct = (100 / vis) * testIdx;
  track.style.transform = `translateX(-${pct}%)`;
  track.style.width = (getTotal() / vis * 100) + '%';
  [...track.children].forEach(c => { c.style.width = (100 / getTotal()) + '%'; });
}
document.getElementById('test-next').addEventListener('click', () => { const vis = getVisible(); if (testIdx < getTotal() - vis) testIdx++; updateCarousel(); });
document.getElementById('test-prev').addEventListener('click', () => { if (testIdx > 0) testIdx--; updateCarousel(); });
window.addEventListener('resize', updateCarousel);
updateCarousel();
// Auto-play
setInterval(() => { const vis = getVisible(); testIdx = (testIdx >= getTotal() - vis) ? 0 : testIdx + 1; updateCarousel(); }, 5000);

}
// ── Chat Widget ──
const CHAT_OPEN_SVG  = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/></svg>';
const CHAT_CLOSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

function toggleChat() {
  const box  = document.getElementById('chat-box');
  const icon = document.getElementById('chat-icon');
  box.classList.toggle('hidden');
  if (icon) icon.innerHTML = box.classList.contains('hidden') ? CHAT_OPEN_SVG : CHAT_CLOSE_SVG;
}

// ── OTP Modal ──
let otpTimerInterval;
function showOTPModal(phone) {
  document.getElementById('otp-phone-display').textContent = phone;
  document.getElementById('otp-modal').classList.add('active');
  document.querySelectorAll('.otp-digit').forEach((d, i) => {
    d.value = '';
    d.addEventListener('input', function() {
      if (this.value.length === 1 && i < 5) document.querySelectorAll('.otp-digit')[i+1].focus();
    });
    d.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && i > 0) document.querySelectorAll('.otp-digit')[i-1].focus();
    });
  });
  startOTPTimer();
}
function startOTPTimer() {
  let t = 30;
  document.getElementById('otp-timer').textContent = t;
  clearInterval(otpTimerInterval);
  otpTimerInterval = setInterval(() => {
    t--;
    document.getElementById('otp-timer').textContent = t;
    if (t <= 0) { clearInterval(otpTimerInterval); document.getElementById('resend-btn').innerHTML = '<span class="text-primary font-semibold cursor-pointer" onclick="resendOTP()">Resend OTP</span>'; }
  }, 1000);
}
function resendOTP() { startOTPTimer(); showToast('OTP resent successfully!'); }
function closeOTPModal() { document.getElementById('otp-modal').classList.remove('active'); clearInterval(otpTimerInterval); }
function verifyOTP() {
  const digits = [...document.querySelectorAll('.otp-digit')].map(d => d.value).join('');
  if (digits.length === 6) { closeOTPModal(); showToast('Phone verified! Form submitted successfully.'); }
  else { showToast('Please enter all 6 digits.'); }
}

// ── Contact Form ──
function handleContactForm(e) {
  e.preventDefault();
  const phone = document.getElementById('cf-phone').value;
  if (!phone) { showToast('Please enter your phone number.'); return; }
  showOTPModal(phone);
}

// ── Payment Modal ──
function openPayment(plan, amount) {
  document.getElementById('pay-plan-name').textContent = plan + ' Plan';
  document.getElementById('pay-plan-amount').textContent = '₹' + parseInt(amount).toLocaleString('en-IN');
  document.getElementById('payment-modal').classList.add('active');
}
function closePayment() { document.getElementById('payment-modal').classList.remove('active'); }
function processPayment() {
  closePayment();
  showToast('Payment successful! Check your email for activation details.');
}

// ── Newsletter ──
function handleNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('newsletter-email').value;
  if (email) { e.target.reset(); showToast('Subscribed! Welcome aboard 🎉'); }
}

// ── Toast ──
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3500);
}

// ── Smooth scroll for anchors ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});
