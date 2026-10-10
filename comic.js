'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled=!reduced.matches;
try{const saved=localStorage.getItem('joseph-comic-motion');if(saved==='off')motionEnabled=false;}catch{}
function applyMotion(){document.documentElement.classList.toggle('motion-off',!motionEnabled);$('#motion-toggle').setAttribute('aria-pressed',String(motionEnabled));$('#motion-label').textContent=motionEnabled?'Motion on':'Motion off';}
$('#motion-toggle').addEventListener('click',()=>{motionEnabled=!motionEnabled;applyMotion();try{localStorage.setItem('joseph-comic-motion',motionEnabled?'on':'off');}catch{}});
reduced.addEventListener('change',()=>{motionEnabled=!reduced.matches;applyMotion();});applyMotion();
const menu=$('#menu-toggle'),nav=$('#main-nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menu.textContent='☰';}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');menu.textContent=open?'×':'☰';});
$$('#main-nav a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const wasOpen=nav.classList.contains('open');closeMenu();if(wasOpen)menu.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
matchMedia('(min-width: 721px)').addEventListener('change',closeMenu);
if('IntersectionObserver' in window){
 document.documentElement.classList.add('js');
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
 $$('.reveal').forEach(el=>observer.observe(el));
}
const filters=$$('[data-filter]'),cards=$$('[data-category]');
filters.forEach(button=>button.addEventListener('click',()=>{
 const filter=button.dataset.filter;
 filters.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 let count=0;cards.forEach(card=>{const show=filter==='all'||card.dataset.category===filter;card.hidden=!show;if(show){card.classList.add('visible');count++;}});
 $('#filter-status').textContent=`Showing ${count} ${filter==='all'?'':filter==='commerce'?'e-commerce ':'SEO '}project${count===1?'':'s'}.`;
}));
const sections=$$('main>section[id]'),navLinks=$$('#main-nav a');
let scrollPending=false;
function updateScroll(){
 const total=document.documentElement.scrollHeight-innerHeight;
 const percentage=total>0?Math.max(0,Math.min(100,scrollY/total*100)):0;
 $('#scroll-progress').style.width=percentage+'%';$('#page-percent').textContent=String(Math.round(percentage)).padStart(2,'0');
 let current='home';for(const section of sections){if(section.getBoundingClientRect().top<=180)current=section.id;}
 navLinks.forEach(link=>{const active=link.hash==='#'+current;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});scrollPending=false;
}
addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateScroll);}},{passive:true});
addEventListener('resize',updateScroll);addEventListener('load',updateScroll);updateScroll();
const email='josephberin12356@gmail.com';
$('#copy-email').addEventListener('click',async()=>{
 try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(email);$('#copy-status').textContent='Email copied. Ready when you are.';}
 catch{const range=document.createRange();range.selectNodeContents($('.email-link'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);$('#copy-status').textContent='Email selected. Press ⌘C or Ctrl+C to copy.';}
});
$('#contact-form').addEventListener('submit',e=>{
 e.preventDefault();
 const name=$('#sender-name').value.trim(),sender=$('#sender-email').value.trim(),task=$('#task-type').value,message=$('#task-details').value.trim();
 if(!name||!message){$('#form-status').textContent='Please add your name and a short description of the task.';return;}
 const subject=task+' — '+name;
 const body=`Hi Joseph,\n\n${message}\n\nTask: ${task}\n\nFrom: ${name}\nReply email: ${sender}`;
 location.href=`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 $('#form-status').textContent='Email draft requested. Review and send it in your email app. If nothing opens, use the email link beside this form.';
});
// Listing comparison remains readable without JavaScript; enhancements are optional.
const copyButtons=$$('[data-copy]');
copyButtons.forEach(button=>button.addEventListener('click',()=>{
 copyButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 $('#copy-before').hidden=button.dataset.copy!=='before';$('#copy-after').hidden=button.dataset.copy!=='after';
 const panel=$('.lab-copy');panel.classList.remove('copy-enter');requestAnimationFrame(()=>panel.classList.add('copy-enter'));
}));
if('IntersectionObserver' in window){const headings=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');headings.unobserve(entry.target);}}),{threshold:.5});$$('.section-heading').forEach(el=>headings.observe(el));}
$$('.skill-card').forEach(card=>{
 card.addEventListener('pointermove',event=>{if(!motionEnabled||event.pointerType!=='mouse')return;const rect=card.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;card.style.setProperty('--tilt-x',((.5-y)*5)+'deg');card.style.setProperty('--tilt-y',((x-.5)*5)+'deg');card.style.setProperty('--spot-x',x*100+'%');card.style.setProperty('--spot-y',y*100+'%');},{passive:true});
 card.addEventListener('pointerleave',()=>{card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');});
});
