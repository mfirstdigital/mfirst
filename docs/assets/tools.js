(()=>{const $=s=>document.querySelector(s),mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const iv=$('#ivr-screen');
if(iv){const M={root:{say:'Welcome to Demo Company. Press 1 for Sales, 2 for Support, 3 for Billing, or 0 to speak to an agent.',k:{1:'sales',2:'support',3:'billing',0:['Connecting you to the next available agent']}},
 sales:{say:'Sales. Press 1 for new enquiries, 2 for existing customers, or 9 to go back.',k:{1:['Routing you to the Sales team'],2:['Routing you to your account manager'],9:'root'}},
 support:{say:'Support. Press 1 to check a ticket, 2 to report a problem, or 9 to go back.',k:{1:['Your ticket status is on its way by SMS'],2:['Routing you to the Support queue'],9:'root'}},
 billing:{say:'Billing. Press 1 for invoices, 2 for payment issues, or 9 to go back.',k:{1:['Sending your latest invoice by email'],2:['Routing you to the Billing team'],9:'root'}}};
 let cur='root',done=false;const log=[];
 const speak=t=>{const v=$('#ivr-voice');if(v&&v.checked&&'speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-IN';speechSynthesis.speak(u)}};
 const draw=()=>{iv.textContent='';log.slice(-6).forEach(([w,t])=>iv.appendChild(mk('p',w==='ivr'?'text-teal-300 mb-2':'text-white/90 mb-2',(w==='ivr'?'IVR: ':'You pressed ')+t)))};
 const say=t=>{log.push(['ivr',t]);speak(t);draw()},reset=()=>{cur='root';done=false;log.length=0;say(M.root.say)};
 const press=k=>{if(done)return;log.push(['you',k]);const n=M[cur].k[k];if(n===undefined)say("Sorry, that option isn't available. "+M[cur].say);else if(Array.isArray(n)){say(n[0]+'. This is a demo, so the call ends here.');done=true}else{cur=n;say(M[cur].say)}};
 document.querySelectorAll('[data-key]').forEach(b=>b.addEventListener('click',()=>press(b.dataset.key)));$('#ivr-reset').addEventListener('click',reset);reset()}
const pf=$('#plan-finder');
if(pf){const out=$('#pf-out'),run=()=>{const n=+$('#pf-agents').value||0,wa=$('#pf-wa').checked,ai=$('#pf-ai').checked,dl=$('#pf-dial').checked;let p='starter',why='Up to 5 agents with a basic IVR.';
 if(ai||dl||n>25){p='enterprise';why='An AI voice bot, a predictive dialer or more than 25 agents need a custom Enterprise plan.'}else if(wa||n>5){p='professional';why='Up to 25 agents, with WhatsApp Business API and CRM integration.'}
 const N=p[0].toUpperCase()+p.slice(1),a=mk(p==='enterprise'?'a':'button','btn-primary inline-block px-5 py-2.5 rounded-xl font-semibold text-white',p==='enterprise'?'Talk to Sales':'Choose '+N);
 if(p==='enterprise')a.href='/contact';else{a.type='button';a.dataset.plan=p}out.textContent='';out.append(mk('p','font-bold text-dark dark:text-white text-lg','Recommended: '+N),mk('p','text-gray-600 dark:text-gray-300 text-sm mb-3',why),a)};
 pf.addEventListener('input',run);pf.addEventListener('change',run);run()}
const sp=$('#social-proof');
if(sp)fetch('assets/data/testimonials.json').then(r=>r.json()).then(d=>{const T=d.testimonials||[];if(!T.length)return;const s=mk('section','py-16 bg-bgLight dark:bg-dark'),w=mk('div','max-w-6xl mx-auto px-4 sm:px-6'),g=mk('div','grid md:grid-cols-3 gap-6');w.appendChild(mk('h2','text-3xl font-extrabold text-center text-dark dark:text-white mb-8','What Our Clients Say'));
 T.forEach(t=>{const c=mk('figure','bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm');c.append(mk('blockquote','text-gray-700 dark:text-gray-200 mb-4','“'+t.quote+'”'),mk('figcaption','text-sm font-semibold text-dark dark:text-white',t.name+(t.role?', '+t.role:'')+(t.company?' · '+t.company:'')));g.appendChild(c)});w.appendChild(g);s.appendChild(w);sp.appendChild(s)}).catch(()=>{})})();
