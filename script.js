'use strict';
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
menuButton.addEventListener('click', () => { const open = mobileNav.hidden; mobileNav.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
const cards = [...document.querySelectorAll('.work-card')];
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
  cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
  document.querySelector('#filter-status').textContent = `${cards.filter(card => !card.hidden).length} ${button.textContent === 'All work' ? '' : button.textContent + ' '}work samples shown.`;
}));
const contactEmail = 'josephberin12356@gmail.com';
document.querySelector('.copy-email').addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try { await navigator.clipboard.writeText(contactEmail); status.textContent = 'Email address copied.'; }
  catch { status.textContent = 'Select the email address above to copy it, or tap it to open your email app.'; }
});
document.querySelector('#inquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = String(data.get('name')).trim();
  const email = String(data.get('email')).trim();
  const details = String(data.get('details')).trim();
  if (!name || !details) { document.querySelector('.form-status').textContent = 'Please add your name and a short project description.'; return; }
  const subject = `Portfolio inquiry: ${data.get('service')}`;
  const body = `Hello Joseph,\n\nMy name is ${name}.\nEmail: ${email}\nSupport needed: ${data.get('service')}\n\nProject details:\n${details}\n\nThank you.`;
  document.querySelector('.form-status').textContent = 'Email draft requested. If no app opens, email me directly using the address above.';
  window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
document.querySelector('#year').textContent = new Date().getFullYear();
