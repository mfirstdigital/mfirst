/* Analytics only load after the visitor accepts, and only if IDs are set in config.js */
(()=>{const C=window.MFIRST||{};if(!C.GA4_ID&&!C.CLARITY_ID)return;const K='mf_consent';let v=null;try{v=localStorage.getItem(K)}catch(e){}
const load=()=>{if(C.GA4_ID){const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+C.GA4_ID;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',C.GA4_ID,{anonymize_ip:true})}
 if(C.CLARITY_ID){const t=document.createElement('script');t.async=true;t.src='https://www.clarity.ms/tag/'+C.CLARITY_ID;document.head.appendChild(t)}};
if(v==='yes')return load();if(v==='no')return;
const b=document.createElement('div');b.setAttribute('role','dialog');b.setAttribute('aria-label','Cookie consent');b.className='fixed inset-x-3 z-[1100] max-w-xl mx-auto bg-dark text-white rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row gap-3 items-center';b.style.bottom='calc(88px + env(safe-area-inset-bottom,0px))';
const p=document.createElement('p');p.className='text-sm flex-1';p.textContent='We use analytics cookies to improve this site, only if you accept.';
const mkb=(t,c,y)=>{const x=document.createElement('button');x.type='button';x.className=c;x.textContent=t;x.addEventListener('click',()=>{try{localStorage.setItem(K,y?'yes':'no')}catch(e){}b.remove();if(y)load()});return x};
b.append(p,mkb('Decline','px-4 py-2 rounded-xl border border-white/40 text-sm',false),mkb('Accept','px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold',true));document.body.appendChild(b)})();
