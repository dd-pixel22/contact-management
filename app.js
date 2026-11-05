/* ===== Data store: Binary Search Tree keyed by contact ID ===== */
class Node{constructor(c){Object.assign(this,c);this.left=null;this.right=null}}
const T={root:null,
 ins(r,n){if(!r)return n;if(n.id<r.id)r.left=this.ins(r.left,n);else r.right=this.ins(r.right,n);return r},
 find(id){let c=this.root;while(c&&c.id!==id)c=id<c.id?c.left:c.right;return c},
 minN(n){while(n.left)n=n.left;return n},
 del(r,id){if(!r)return null;
  if(id<r.id)r.left=this.del(r.left,id);else if(id>r.id)r.right=this.del(r.right,id);
  else{if(!r.left)return r.right;if(!r.right)return r.left;
   const s=this.minN(r.right),L=r.left,R=r.right;Object.assign(r,s);r.left=L;r.right=R;r.right=this.del(R,s.id)}
  return r},
 list(n=this.root,o=[]){if(n){this.list(n.left,o);o.push(n);this.list(n.right,o)}return o},
 pre(n=this.root,o=[]){if(n){const{left,right,...c}=n;o.push(c);this.pre(n.left,o);this.pre(n.right,o)}return o}};

/* ===== Constants & helpers ===== */
const ZONES={Northside:[300,30,700,170],Westside:[50,150,300,450],Downtown:[400,200,600,380],Eastside:[700,150,950,450],Harbor:[300,400,700,520]};
const DEPTS=['Sales','Support','Billing','Technical'],STS=['Available','On Call','Offline'];
const COL={Available:'#22d3a6','On Call':'#f59e0b',Offline:'#64748b'};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rnd=(a,b)=>Math.round(a+Math.random()*(b-a));
const spot=a=>{const z=ZONES[a]||ZONES.Downtown;return{x:rnd(z[0]+30,z[2]-30),y:rnd(z[1]+45,z[3]-25)}};
const zoneOf=(x,y)=>Object.keys(ZONES).find(k=>{const z=ZONES[k];return x>=z[0]&&x<=z[2]&&y>=z[1]&&y<=z[3]})||'Outskirts';
const cls=s=>s.replace(' ','').toLowerCase();
const opts=(el,arr,first)=>{$(el).innerHTML=(first!==undefined?`<option value="">${first}</option>`:'')+arr.map(a=>`<option>${a}</option>`).join('')};
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const rd=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const K='contacthub.v2',KC='contacthub.calls',KA='contacthub.active';
const SEED=[[101,'Alice Morgan','9876543210','Sales','Available','Downtown'],[102,'Bob Carter','9123456780','Support','On Call','Northside'],[103,'Carol Singh','9988776655','Billing','Available','Eastside'],[104,'David Lee','9012345678','Technical','Offline','Westside'],[105,'Eva Rossi','9345678901','Support','Available','Harbor'],[106,'Frank Wu','9456789012','Sales','Available','Eastside'],[107,'Grace Kim','9567890123','Technical','On Call','Downtown'],[108,'Hari Rao','9678901234','Billing','Available','Westside']];
const save=()=>wr(K,T.pre());
function load(){let d=rd(K,null);if(!d)d=SEED.map(a=>({id:a[0],name:a[1],phone:a[2],dept:a[3],status:a[4],...spot(a[5])}));
 d.forEach(c=>T.root=T.ins(T.root,new Node(c)))}

/* ===== Calls ===== */
let refresh=()=>{},tm;
const calls=()=>rd(KC,[]),active=()=>rd(KA,null);
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2400)}
function startCall(id){const c=T.find(id);if(!c)return;
 if(active())return toast('Finish the current call first.');
 if(c.status==='Offline')return toast(c.name+' is offline.');
 c.status='On Call';save();wr(KA,{id,start:Date.now()});bar();refresh()}
function endCall(){const a=active();if(!a)return;const c=T.find(a.id),d=Math.round((Date.now()-a.start)/1000);
 if(c){c.status='Available';save();wr(KC,[{id:c.id,name:c.name,phone:c.phone,dept:c.dept,dur:d,at:Date.now()},...calls()].slice(0,40))}
 localStorage.removeItem(KA);bar();refresh();toast('Call ended · '+fmt(d))}
function bar(){const el=$('#callbar'),a=active();clearInterval(tm);
 const c=a&&T.find(a.id);if(!c){if(a)localStorage.removeItem(KA);el.hidden=true;return}
 el.hidden=false;$('#cb-n').textContent='📞 '+c.name+' · '+c.phone;
 const t=()=>$('#cb-t').textContent=fmt(Math.round((Date.now()-a.start)/1000));t();tm=setInterval(t,1000)}

/* ===== Layout ===== */
const NAV=[['index.html','index','📊','Dashboard'],['contacts.html','contacts','📇','Contacts'],['map.html','map','📍','Live Map']];
function shell(){const p=document.body.dataset.page;
 const side=document.createElement('aside');side.className='side panel';
 side.innerHTML='<div class="logo"><i>🎧</i>ContactHub</div><nav>'+NAV.map(n=>`<a href="${n[0]}" class="${n[1]===p?'on':''}"><span>${n[2]}</span>${n[3]}</a>`).join('')+'</nav><div class="shift">Shift 09:00 – 18:00<br>Desk 12 · Online</div>';
 document.body.prepend(side);
 const h=document.createElement('header');h.className='top';
 h.innerHTML=`<div><h1>${document.body.dataset.title}</h1><p>${document.body.dataset.sub}</p></div><div class="user"><span id="clock"></span><b>SV</b></div>`;
 $('.content').prepend(h);
 document.body.insertAdjacentHTML('beforeend','<div id="callbar" hidden><span id="cb-n"></span><b id="cb-t">00:00</b><button onclick="endCall()">End call</button></div><div id="toast"></div>');
 const ck=()=>{const d=new Date();$('#clock').innerHTML=d.toLocaleDateString([], {weekday:'short',day:'numeric',month:'short'})+'<br>'+d.toLocaleTimeString()};ck();setInterval(ck,1000)}

/* ===== Map drawing ===== */
const ROADS=['M0 120 L1000 160','M0 470 L1000 430','M250 0 L330 560','M680 0 L620 560','M0 300 Q500 240 1000 320','M120 0 Q500 280 880 560'];
function drawMap(svg,o={}){
 svg.setAttribute('viewBox','0 0 1000 560');
 let s='<defs><filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
 Object.entries(ZONES).forEach(([n,z])=>s+=`<rect class="zone" x="${z[0]}" y="${z[1]}" width="${z[2]-z[0]}" height="${z[3]-z[1]}" rx="20"/><text class="zl" x="${(z[0]+z[2])/2}" y="${z[1]+24}">${n}</text>`);
 ROADS.forEach(d=>s+=`<path class="road" d="${d}"/>`);
 if(o.pick){const P=o.pick;(o.near||[]).forEach(n=>s+=`<line class="route" x1="${P.x}" y1="${P.y}" x2="${n.c.x}" y2="${n.c.y}"/>`);
  s+=`<g transform="translate(${P.x},${P.y})"><circle class="you" r="9"/><circle class="youp" r="9"/></g>`}
 (o.list||T.list()).forEach(c=>{const col=COL[c.status];
  s+=`<g class="pin${o.sel===c.id?' sel':''}" data-id="${c.id}" transform="translate(${c.x},${c.y})">${c.status==='On Call'?`<circle class="pulse" r="12" fill="${col}"/>`:''}<circle r="11" fill="${col}" filter="url(#gl)"/><text class="pi" y="4">${esc(c.name[0].toUpperCase())}</text><text class="pn" y="28">${esc(c.name.split(' ')[0])}</text></g>`});
 svg.innerHTML=s}
const legend=()=>{const l=T.list();return STS.map(s=>`<span><i style="background:${COL[s]}"></i>${s} ${l.filter(c=>c.status===s).length}</span>`).join('')};

/* ===== Dashboard ===== */
function dash(){
 const l=T.list(),tot=l.length||1,n=s=>l.filter(c=>c.status===s).length,cs=calls(),ds=new Date().toDateString(),set=(i,v)=>$(i).textContent=v;
 set('#s-total',l.length);set('#s-av',n('Available'));set('#s-on',n('On Call'));
 set('#s-calls',cs.filter(c=>new Date(c.at).toDateString()===ds).length);
 set('#s-aht',cs.length?fmt(Math.round(cs.reduce((a,c)=>a+c.dur,0)/cs.length)):'--:--');
 const a=n('Available')/tot*100,b=a+n('On Call')/tot*100;
 $('#ring').style.background=`conic-gradient(${COL.Available} 0 ${a}%,${COL['On Call']} ${a}% ${b}%,${COL.Offline} ${b}% 100%)`;
 set('#ring-v',Math.round(a)+'%');$('#legend').innerHTML=legend();
 $('#dial').innerHTML=l.filter(c=>c.status==='Available').map(c=>`<li><i style="background:${COL.Available}"></i><span><b>${esc(c.name)}</b> <small>${c.dept}</small></span><button class="mini" data-id="${c.id}">📞</button></li>`).join('')||'<li>No one is available right now.</li>';
 $('#dial').onclick=e=>{const b=e.target.closest('button');if(b)startCall(+b.dataset.id)};
 $('#feed').innerHTML=cs.slice(0,5).map(c=>`<li>${esc(c.name)} · ${c.dept} · <b>${fmt(c.dur)}</b><small>${new Date(c.at).toLocaleTimeString()}</small></li>`).join('')||'<li>No calls yet. Press 📞 next to a contact to start one.</li>';
 $('#depts').innerHTML=DEPTS.map(d=>{const k=l.filter(c=>c.dept===d).length;return`<div><span>${d}</span><em style="--w:${Math.max(25,k/tot*100)}%">${k} contact${k===1?'':'s'}</em></div>`}).join('');
 drawMap($('#map'));$('#map').onclick=()=>location.href='map.html';refresh=dash}

/* ===== Contacts page ===== */
function contactsPage(){
 const msg=(m,c)=>{const r=$('#msg');r.textContent=m;r.className='result '+(c||'')};
 opts('#a-dept',DEPTS);opts('#a-status',STS);opts('#a-area',Object.keys(ZONES),'Keep current / Downtown');opts('#f-d',DEPTS,'All departments');
 const get=()=>({id:parseInt($('#a-id').value),name:$('#a-name').value.trim(),phone:$('#a-phone').value.trim(),dept:$('#a-dept').value,status:$('#a-status').value,area:$('#a-area').value});
 const bad=c=>!(c.id>0)||!c.name||!/^\+?\d[\d\s-]{6,16}$/.test(c.phone);
 const BADMSG='Enter a positive ID, a name, and a phone number with 7 to 15 digits.';
 const clear=()=>{['#a-id','#a-name','#a-phone'].forEach(s=>$(s).value='');$('#a-area').value=''};
 function edit(c){$('#a-id').value=c.id;$('#a-name').value=c.name;$('#a-phone').value=c.phone;$('#a-dept').value=c.dept;$('#a-status').value=c.status;
  const z=zoneOf(c.x,c.y);$('#a-area').value=ZONES[z]?z:'';msg('Editing contact '+c.id+'. Change the details, then click Update existing.');window.scrollTo({top:0,behavior:'smooth'})}
 function table(){const t=$('#f-q').value.trim().toLowerCase(),d=$('#f-d').value;
  const l=T.list().filter(c=>(!t||c.name.toLowerCase().includes(t)||String(c.id)===t||c.phone.includes(t))&&(!d||c.dept===d));
  $('#tbody').innerHTML=l.length?l.map(c=>`<tr><td>${c.id}</td><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${c.dept}</td><td>${zoneOf(c.x,c.y)}</td><td><span class="pill ${cls(c.status)}">${c.status}</span></td><td class="act"><button class="mini" data-a="call" data-id="${c.id}" title="Call">📞</button><button class="mini" data-a="edit" data-id="${c.id}" title="Edit">✏️</button><button class="mini" data-a="del" data-id="${c.id}" title="Delete">🗑️</button></td></tr>`).join(''):`<tr><td colspan="7">${T.list().length?'Contact not found.':'No contacts yet. Add your first contact above.'}</td></tr>`}
 $('#btn-add').onclick=()=>{const c=get();if(bad(c))return msg(BADMSG,'bad');
  if(T.find(c.id))return msg('Contact ID '+c.id+' already exists. Use a unique ID, or use Update existing.','bad');
  T.root=T.ins(T.root,new Node({id:c.id,name:c.name,phone:c.phone,dept:c.dept,status:c.status,...spot(c.area||'Downtown')}));
  save();msg('Contact '+c.id+' ('+c.name+') added.','ok');clear();table()};
 $('#btn-upd').onclick=()=>{const c=get();if(bad(c))return msg(BADMSG,'bad');
  const f=T.find(c.id);if(!f)return msg('Contact not found. Use Add contact to create it.','bad');
  if(c.area&&zoneOf(f.x,f.y)!==c.area)Object.assign(f,spot(c.area));
  Object.assign(f,{name:c.name,phone:c.phone,dept:c.dept,status:c.status});save();msg('Contact '+c.id+' updated.','ok');clear();table()};
 $('#btn-clr').onclick=()=>{clear();msg('Form cleared.')};
 $('#btn-reset').onclick=()=>{if(confirm('Reset all contacts and call history to the demo data?')){[K,KC,KA].forEach(k=>localStorage.removeItem(k));location.reload()}};
 $('#f-q').oninput=table;$('#f-d').onchange=table;
 $('#tbody').onclick=e=>{const b=e.target.closest('button');if(!b)return;const id=+b.dataset.id,c=T.find(id);
  if(b.dataset.a==='call')startCall(id);
  if(b.dataset.a==='edit')edit(c);
  if(b.dataset.a==='del'){const a=active();if(a&&a.id===id)return toast('End the call first.');
   if(confirm('Delete '+c.name+'?')){T.root=T.del(T.root,id);save();msg('Contact '+id+' deleted.','ok');table()}}};
 const e=+new URLSearchParams(location.search).get('edit');if(e&&T.find(e))edit(T.find(e));
 refresh=table;table()}

/* ===== Live map page ===== */
function mapPage(){
 const svg=$('#map'),q=$('#m-q'),ds=$('#m-d'),st=$('#m-s');let sel=null,pick=null,near=[],reloc=false;
 opts('#m-d',DEPTS,'All departments');opts('#m-s',STS,'All statuses');
 const vis=()=>{const t=q.value.trim().toLowerCase();return T.list().filter(c=>(!t||c.name.toLowerCase().includes(t)||String(c.id).includes(t))&&(!ds.value||c.dept===ds.value)&&(!st.value||c.status===st.value))};
 function render(){const l=vis();drawMap(svg,{list:l,sel,pick,near});
  $('#legend').innerHTML=legend();$('#m-count').textContent=l.length+' of '+T.list().length+' contacts shown. Click an empty spot to find the nearest available agents.';
  $('#m-list').innerHTML=l.map(c=>`<li data-id="${c.id}" class="${c.id===sel?'on':''}"><i style="background:${COL[c.status]}"></i><b>${esc(c.name)}</b><small>${zoneOf(c.x,c.y)}</small></li>`).join('')||'<li>Contact not found.</li>';
  const c=sel&&T.find(sel);
  $('#m-sel').innerHTML=c?`<h3>${esc(c.name)}</h3><p class="mut">ID ${c.id} · ${esc(c.phone)}<br>${c.dept} · ${zoneOf(c.x,c.y)}</p><span class="pill ${cls(c.status)}">${c.status}</span><div class="row wrap" style="margin-top:12px"><button class="btn" id="b-call">Call</button><a class="btn ghost" href="contacts.html?edit=${c.id}">Edit</a><button class="btn ghost" id="b-move">${reloc?'Click the map…':'Relocate'}</button></div>`:'<h3>No contact selected</h3><p class="mut">Click a pin or a name in the list.</p>';
  if(c){$('#b-call').onclick=()=>startCall(c.id);$('#b-move').onclick=()=>{reloc=!reloc;render()}}
  $('#m-near').innerHTML=near.length?near.map(n=>`<li data-id="${n.c.id}"><i style="background:${COL[n.c.status]}"></i><b>${esc(n.c.name)}</b><small>${n.km.toFixed(1)} km · ${Math.max(1,Math.round(n.km/30*60))} min</small></li>`).join(''):'<li>No search yet. Click an empty spot on the map.</li>'}
 svg.onclick=e=>{const g=e.target.closest('.pin');if(g){sel=+g.dataset.id;reloc=false;render();return}
  const r=svg.getBoundingClientRect(),x=Math.round((e.clientX-r.left)/r.width*1000),y=Math.round((e.clientY-r.top)/r.height*560);
  if(reloc&&sel){const c=T.find(sel);c.x=x;c.y=y;save();reloc=false;toast('Location updated');render();return}
  pick={x,y};near=T.list().filter(c=>c.status==='Available').map(c=>({c,km:Math.hypot(c.x-x,c.y-y)*.025})).sort((a,b)=>a.km-b.km).slice(0,3);render()};
 const pickLi=e=>{const li=e.target.closest('li[data-id]');if(li){sel=+li.dataset.id;reloc=false;render()}};
 $('#m-list').onclick=pickLi;$('#m-near').onclick=pickLi;
 q.oninput=render;ds.onchange=render;st.onchange=render;refresh=render;render()}

/* ===== Boot ===== */
load();shell();bar();
const P={index:dash,contacts:contactsPage,map:mapPage}[document.body.dataset.page];P&&P();
