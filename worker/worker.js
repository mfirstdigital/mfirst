const PLANS={starter:99900,professional:249900}; // paise
const MEM=new Map(),SEEN=new Set();
const cors=(env,req)=>{const o=req.headers.get('Origin')||'';return{'Access-Control-Allow-Origin':(env.ALLOWED_ORIGINS||'').split(',').includes(o)?o:'','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type',Vary:'Origin','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}};
const json=(d,s,h)=>new Response(JSON.stringify(d),{status:s||200,headers:{'Content-Type':'application/json',...h}});
const mob=p=>{const m=/^(?:91|0)?([6-9]\d{9})$/.exec(String(p==null?'':p).replace(/[\s\-()+]/g,''));return m?'91'+m[1]:null};
const esc=s=>String(s==null?'':s).replace(/[<>&"'`]/g,'').slice(0,2000);
const mailOk=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e||''))&&String(e).length<255;
const eq=(a,b)=>{a=String(a||'');b=String(b||'');if(a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0};
const hmac=async(k,s)=>{const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(k),{name:'HMAC',hash:'SHA-256'},false,['sign']);return[...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('')};
async function hit(env,key,max,win){const now=Date.now();let v=env.STATE?JSON.parse(await env.STATE.get(key)||'[]'):(MEM.get(key)||[]);v=v.filter(t=>now-t<win*1000);if(v.length>=max)return false;v.push(now);
 if(env.STATE)await env.STATE.put(key,JSON.stringify(v),{expirationTtl:Math.max(60,win)});else{MEM.set(key,v);if(MEM.size>5000)MEM.clear()}return true}
async function seen(env,key){if(env.STATE){if(await env.STATE.get(key))return true;await env.STATE.put(key,'1',{expirationTtl:604800});return false}if(SEEN.has(key))return true;SEEN.add(key);if(SEEN.size>5000)SEEN.clear();return false}
async function human(env,b,ip){if(!env.TURNSTILE_SECRET)return true;if(!b.cf)return false;try{const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:String(b.cf),remoteip:ip})});return(await r.json()).success===true}catch{return false}}
const sms=(env,path,method)=>fetch('https://control.msg91.com/api/v5/'+path,{method,headers:{authkey:env.MSG91_AUTHKEY,'Content-Type':'application/json'},body:method==='POST'?'{}':undefined});
const mail=(env,subject,html,reply,to)=>fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.MAIL_FROM,to:[to||env.MAIL_TO],reply_to:reply,subject,html})});
const crm=async(env,type,data)=>{if(!env.CRM_WEBHOOK_URL)return;try{await fetch(env.CRM_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,...data,at:new Date().toISOString()})})}catch{}};
const rows=d=>Object.keys(d).map(k=>`<p><b>${k}:</b> ${d[k]}</p>`).join('');
export default{async fetch(req,env){
 const h=cors(env,req);if(req.method==='OPTIONS')return new Response(null,{status:204,headers:h});
 if(req.method!=='POST')return json({error:'Not found'},404,h);
 const p=new URL(req.url).pathname,ip=req.headers.get('CF-Connecting-IP')||'unknown';
 const BAD=(m,s)=>json({error:m},s||400,h),LIM=()=>BAD('Too many attempts. Please wait a minute and try again, or call us on +91 97118 89449.',429);
 try{
  if(p==='/api/razorpay-webhook'){
   if(!env.RAZORPAY_WEBHOOK_SECRET)return BAD('Webhook not configured',503);
   const raw=await req.text();if(!eq(await hmac(env.RAZORPAY_WEBHOOK_SECRET,raw),req.headers.get('X-Razorpay-Signature')))return BAD('Bad signature');
   let ev;try{ev=JSON.parse(raw)}catch{return BAD('Bad request')}
   if(ev.event==='payment.captured'){const x=ev.payload.payment.entity;if(await seen(env,'pay:'+x.id))return json({ok:true},200,h);
    const d={plan:esc(x.notes&&x.notes.plan),amount:'INR '+x.amount/100,email:esc(x.email),contact:esc(x.contact),payment_id:esc(x.id)};
    await mail(env,'Payment received: '+d.plan,rows(d),x.email);
    if(mailOk(x.email))await mail(env,'Your payment to mFirst Digital Media Solutions',`<p>Thank you. We received ${d.amount} for the ${d.plan} plan.</p><p>Payment ID: ${d.payment_id}</p>${env.GSTIN?'<p>GSTIN: '+esc(env.GSTIN)+'</p>':''}<p>Your GST tax invoice will be sent separately by our accounts team. Questions? Call +91 97118 89449.</p>`,env.MAIL_TO,x.email);
    await crm(env,'payment',d)}
   return json({ok:true},200,h)}
  let b;try{b=await req.json()}catch{return BAD('Bad request')}if(!b||typeof b!=='object')return BAD('Bad request');
  if(p==='/api/send-otp'){const m=mob(b.phone);if(!m)return BAD('Enter a valid Indian mobile number');if(!await human(env,b,ip))return BAD('Please complete the security check and try again');
   if(!await hit(env,'otp:c:'+m,1,45)||!await hit(env,'otp:p:'+m,5,3600)||!await hit(env,'otp:i:'+ip,10,3600))return LIM();
   const r=await sms(env,`otp?template_id=${env.MSG91_TEMPLATE_ID}&mobile=${m}`,'POST');return r.ok?json({ok:true},200,h):BAD('Could not send OTP',502)}
  if(p==='/api/submit'){const m=mob(b.phone);if(!m||!esc(b.name)||!mailOk(b.email))return BAD('Please check your details');
   if(!await hit(env,'sub:i:'+ip,20,3600)||!await hit(env,'otp:v:'+m,10,3600))return LIM();
   const v=await(await sms(env,`otp/verify?mobile=${m}&otp=${encodeURIComponent(String(b.otp||'').slice(0,8))}`,'GET')).json().catch(()=>({}));if(v.type!=='success')return BAD('Incorrect or expired OTP');
   const d={name:esc(b.name),email:esc(b.email),phone:m,company:esc(b.company),service:esc(b.service),message:esc(b.message)};const r=await mail(env,'New lead: '+d.name,rows(d),d.email);await crm(env,'lead',d);
   return r.ok?json({ok:true},200,h):BAD('Could not send message',502)}
  if(p==='/api/careers'){if(b.website)return json({ok:true},200,h);if(!esc(b.name)||!mailOk(b.email))return BAD('Please check your details');if(!await human(env,b,ip))return BAD('Please complete the security check and try again');if(!await hit(env,'car:i:'+ip,10,3600))return LIM();
   const d={name:esc(b.name),email:esc(b.email),phone:esc(b.phone),area:esc(b.area),link:esc(b.link),message:esc(b.message)};const r=await mail(env,'Career application: '+d.name,rows(d),d.email);return r.ok?json({ok:true},200,h):BAD('Could not send',502)}
  if(p==='/api/subscribe'){if(!mailOk(b.email))return BAD('Invalid email');if(!await human(env,b,ip))return BAD('Please complete the security check and try again');if(!await hit(env,'sub2:i:'+ip,10,3600))return LIM();await mail(env,'Newsletter signup',`<p>${esc(b.email)}</p>`,esc(b.email));await crm(env,'newsletter',{email:esc(b.email)});return json({ok:true},200,h)}
  if(p==='/api/callback'){const m=mob(b.phone);if(!m)return BAD('Enter a valid Indian mobile number');if(!await human(env,b,ip))return BAD('Please complete the security check and try again');if(!await hit(env,'cb:p:'+m,3,3600)||!await hit(env,'cb:i:'+ip,10,3600))return LIM();
   const d={phone:m,page:esc(b.page)};const r=await mail(env,'Call-back request: +'+m,rows(d));await crm(env,'callback',d);return r.ok?json({ok:true},200,h):BAD('Could not send',502)}
  if(p==='/api/create-order'){if(typeof b.plan!=='string'||!Object.prototype.hasOwnProperty.call(PLANS,b.plan))return BAD('Invalid plan');
   const r=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:'Basic '+btoa(env.RAZORPAY_KEY_ID+':'+env.RAZORPAY_KEY_SECRET),'Content-Type':'application/json'},body:JSON.stringify({amount:PLANS[b.plan],currency:'INR',receipt:'mf_'+Date.now(),notes:{plan:b.plan}})});
   const o=await r.json().catch(()=>({}));return r.ok?json({id:o.id,amount:o.amount,key:env.RAZORPAY_KEY_ID},200,h):BAD('Order failed',502)}
  if(p==='/api/verify-payment'){if(typeof b.razorpay_order_id!=='string'||typeof b.razorpay_payment_id!=='string')return BAD('Invalid payment');
   return eq(await hmac(env.RAZORPAY_KEY_SECRET,b.razorpay_order_id+'|'+b.razorpay_payment_id),b.razorpay_signature)?json({ok:true},200,h):BAD('Signature mismatch')}
 }catch(e){return BAD('Server error',500)}
 return BAD('Not found',404)}};
