/* Forms, OTP, payments -> Cloudflare Worker. No inline handlers (strict CSP). */
(()=>{const C=window.MFIRST||{},$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LIVE=C.API_LIVE===true,WA='https://wa.me/919711889449?text=';
const FRIENDLY="We couldn't reach our server. Please try again, or call or WhatsApp us on +91 97118 89449.",W={};
const tok=n=>C.TURNSTILE_SITEKEY&&window.turnstile&&W[n]!=null?turnstile.getResponse(W[n])||'':'';
const rst=n=>{if(window.turnstile&&W[n]!=null)try{turnstile.reset(W[n])}catch(e){}};
if(LIVE&&C.TURNSTILE_SITEKEY&&$('[data-turnstile]')){const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.async=true;s.onload=()=>$$('[data-turnstile]').forEach(el=>{el.classList.remove('hidden');W[el.closest('form').dataset.form]=turnstile.render(el,{sitekey:C.TURNSTILE_SITEKEY,appearance:'interaction-only'})});document.head.appendChild(s)}
async function post(p,b,n){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),15000);
 try{const r=await fetch(C.API+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(n?{...b,cf:tok(n)}:b),signal:ac.signal});const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(d.error||'Request failed. Please try again.'),{api:1});return d}
 catch(e){if(e.api)throw e;throw new Error(FRIENDLY)}finally{clearTimeout(t);if(n)rst(n)}}
async function busy(btn,fn){if(!btn||btn.disabled)return;const o=btn.innerHTML;btn.disabled=true;btn.setAttribute('aria-busy','true');btn.textContent='Please wait…';try{return await fn()}finally{btn.disabled=false;btn.removeAttribute('aria-busy');btn.innerHTML=o}}
const val=id=>(document.getElementById(id)||{}).value||'',btnOf=f=>f.querySelector('[type=submit]');
let lead=null;
window.startOTPTimer=()=>{clearInterval(window._ot);let t=30;const b=$('#resend-btn');if(!b)return;b.disabled=true;b.innerHTML='Resend in <span id="otp-timer">'+t+'</span>s';window._ot=setInterval(()=>{t--;const s=$('#otp-timer');if(s)s.textContent=t;if(t<=0){clearInterval(window._ot);b.disabled=false;b.textContent='Resend OTP'}},1000)};
let wired=false;
window.showOTPModal=phone=>{const ds=$$('.otp-digit');$('#otp-phone-display').textContent=phone;ds.forEach(d=>d.value='');
 if(!wired){wired=true;ds.forEach((d,i)=>{d.addEventListener('input',()=>{d.value=d.value.replace(/\D/g,'');if(d.value&&ds[i+1])ds[i+1].focus()});d.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!d.value&&ds[i-1])ds[i-1].focus()});d.addEventListener('paste',e=>{const t=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6);if(t){e.preventDefault();ds.forEach((x,k)=>x.value=t[k]||'');ds[Math.min(t.length,5)].focus()}})})}
 $('#otp-modal').classList.add('active');startOTPTimer()};
const forms={
 async contact(e){e.preventDefault();lead={name:val('cf-name'),email:val('cf-email'),phone:val('cf-phone'),company:val('cf-company'),service:val('cf-service'),message:val('cf-message')};
  await busy(btnOf(e.target),async()=>{try{await post('/api/send-otp',{phone:lead.phone},'contact');showOTPModal(lead.phone)}catch(x){showToast(x.message)}})},
 async newsletter(e){const f=e.target;await busy(btnOf(f),async()=>{try{await post('/api/subscribe',{email:val('newsletter-email')},'newsletter');f.reset();showToast('Subscribed! Thank you.')}catch(x){showToast(x.message)}})},
 async career(e){const f=e.target;await busy(btnOf(f),async()=>{try{await post('/api/careers',Object.fromEntries(new FormData(f)),'career');f.reset();showToast('Application sent. Thank you!')}catch(x){showToast(x.message)}})},
 async callback(e){const f=e.target;await busy(btnOf(f),async()=>{try{await post('/api/callback',{phone:f.elements.phone.value,page:location.pathname},'callback');f.reset();showToast('Thank you! We will call you back shortly.')}catch(x){showToast(x.message)}})}};
/* Launch mode (API_LIVE false): no backend yet, so forms hand over to WhatsApp */
const go=t=>{window.open(WA+encodeURIComponent(t),'_blank','noopener');showToast('Opening WhatsApp so we can reply quickly…')};
const offline={
 contact(e){e.preventDefault();go('Hello mFirst, I am '+val('cf-name')+(val('cf-company')?' from '+val('cf-company'):'')+'. I am interested in '+(val('cf-service')||'your services')+'. Phone: '+val('cf-phone')+'. Email: '+val('cf-email')+'. '+val('cf-message'))},
 career(e){const d=Object.fromEntries(new FormData(e.target));go('Hello mFirst, I would like to apply ('+(d.area||'any role')+'). Name: '+d.name+'. Email: '+d.email+'. Phone: '+(d.phone||'')+'. Profile: '+(d.link||'')+'. '+(d.message||''))},
 callback(e){go('Hello mFirst, please call me back on '+e.target.elements.phone.value)}};
async function verify(btn){const otp=$$('.otp-digit').map(d=>d.value).join('');if(otp.length<4)return showToast('Please enter the OTP we sent you.');
 await busy(btn,async()=>{try{await post('/api/submit',{...lead,otp});closeOTPModal();$('#contact-form').reset();showToast('Thank you! We will contact you shortly.')}catch(x){showToast(x.message)}})}
async function resend(){const b=$('#resend-btn');if(!b||b.disabled||!lead)return;b.disabled=true;try{await post('/api/send-otp',{phone:lead.phone},'contact');showToast('OTP resent')}catch(x){showToast(x.message)}startOTPTimer()}
const rz=()=>new Promise((ok,no)=>{if(window.Razorpay)return ok();const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});
async function pay(plan){try{const o=await post('/api/create-order',{plan});await rz();new Razorpay({key:o.key,amount:o.amount,currency:'INR',order_id:o.id,name:'mFirst Digital Media Solutions',theme:{color:'#0B5FFF'},handler:async r=>{try{await post('/api/verify-payment',r);showToast('Payment successful! A receipt will be emailed to you.')}catch(x){showToast('Payment received but verification failed. Please contact us with your payment ID.')}}}).open()}catch(x){showToast(x.message||FRIENDLY)}}
document.addEventListener('click',e=>{const a=e.target.closest('[data-action],[data-plan],#resend-btn');if(!a)return;
 if(a.id==='resend-btn')return resend();const k=a.dataset.action;
 if(k==='top')scrollTo({top:0,behavior:'smooth'});else if(k==='verify-otp')verify(a);else if(k==='close-otp')closeOTPModal();else if(a.dataset.plan)LIVE?pay(a.dataset.plan):go('Hello mFirst, I am interested in the '+a.dataset.plan+' plan.')});
document.addEventListener('submit',e=>{const k=e.target.dataset&&e.target.dataset.form;const T=LIVE?forms:offline;if(k&&T[k]){e.preventDefault();T[k](e)}});
if(!LIVE){$$('[data-needs-api]').forEach(e=>e.remove());$$('#contact-form,[data-form=career],[data-form=callback]').forEach(f=>{const p=document.createElement('p');p.className='text-xs text-gray-500 mt-3 text-center';p.textContent='Submitting opens WhatsApp so we can reply quickly.';f.insertAdjacentElement('afterend',p)})}
})();
