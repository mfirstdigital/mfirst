(()=>{const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const hb=$('#hamburger'),mm=$('#mobile-menu');
if(hb&&mm)hb.addEventListener('click',()=>setTimeout(()=>{const o=mm.classList.contains('open');hb.setAttribute('aria-expanded',o);hb.setAttribute('aria-label',o?'Close menu':'Open menu')},0));
$$('.accordion-btn').forEach(b=>{b.setAttribute('aria-expanded','false');b.addEventListener('click',()=>setTimeout(()=>$$('.accordion-btn').forEach(x=>x.setAttribute('aria-expanded',x.nextElementSibling.classList.contains('open'))),0))});
$$('.dropdown').forEach(d=>{const m=d.querySelector('.dropdown-menu'),a=d.querySelector('a');a.setAttribute('aria-haspopup','true');a.setAttribute('aria-expanded','false');
 const set=o=>{m.classList.toggle('open',o);a.setAttribute('aria-expanded',o)};
 d.addEventListener('focusin',()=>set(true));d.addEventListener('focusout',e=>{if(!d.contains(e.relatedTarget))set(false)});
 d.addEventListener('keydown',e=>{if(e.key==='Escape'){set(false);a.focus()}})});
const om=$('#otp-modal');
if(om){let last;
 new MutationObserver(()=>{if(om.classList.contains('active')){last=document.activeElement;setTimeout(()=>{const d=om.querySelector('.otp-digit');d&&d.focus()},50)}else if(last){last.focus();last=null}}).observe(om,{attributes:true,attributeFilter:['class']});
 om.addEventListener('keydown',e=>{if(e.key==='Escape')closeOTPModal();if(e.key==='Tab'){const f=$$('#otp-modal input,#otp-modal button'),a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}})}
})();
(()=>{const sv=new URLSearchParams(location.search).get('service'),ss=document.querySelector('#cf-service');if(sv&&ss)[...ss.options].forEach(o=>{if(o.text===sv)ss.value=o.text})})();
document.addEventListener('click',e=>{const a=e.target.closest('a[href="#main"]');const m=document.getElementById('main');if(a&&m){m.setAttribute('tabindex','-1');m.focus({preventScroll:true})}});
