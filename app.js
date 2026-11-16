const $=id=>document.getElementById(id),pg=document.body.dataset.page,orb=$('orb');
if(orb&&!matchMedia('(prefers-reduced-motion:reduce)').matches)addEventListener('pointermove',e=>{orb.style.transform=`translate(${(e.clientX/innerWidth-.5)*30}px,${(e.clientY/innerHeight-.5)*30}px)`});
/* public pages: sticky nav border + reveal on scroll */
const nb=$('navbar');if(nb)addEventListener('scroll',()=>nb.classList.toggle('stuck',scrollY>10),{passive:true});
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.rv-in').forEach(el=>io.observe(el))}else document.querySelectorAll('.rv-in').forEach(el=>el.classList.add('show'));
if(pg){
/* SAMPLE DATA for design preview: [id,salt,initial,manual,final,passes,recovery%,date] */
const B=[["SALT-001","Sea salt A",128,131,9,2,92.4,"2026-10-12"],["SALT-002","Sea salt B",214,209,14,3,90.1,"2026-10-13"],["SALT-003","Table salt A",61,63,4,1,94,"2026-10-14"],["SALT-004","Table salt B",86,84,7,2,93.2,"2026-10-15"],["SALT-005","Rock salt A",173,180,31,3,89.5,"2026-10-16"],["SALT-006","Sea salt C",142,138,11,2,91.8,"2026-10-19"],["SALT-007","Table salt C",48,48,3,1,94.6,"2026-10-20"],["SALT-008","Sea salt D",196,201,13,3,90.7,"2026-10-21"]];
let U=[];try{U=JSON.parse(localStorage.getItem('ss')||'[]')}catch(e){}
const LIM=15,avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0,eff=b=>(b[2]-b[4])/b[2]*100,
stb=s=>s=='ok'?'<span class="pill ok">Passed</span>':s=='rv'?'<span class="pill rv">Manual review</span>':'<span class="pill pg">Pending</span>',
pill=b=>b[4]==null?stb('pg'):stb(b[4]<=LIM?'ok':'rv'),
esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
hist=b=>{const h=[b[2]];for(let k=1;k<=b[5];k++)h.push(Math.round(b[2]*Math.pow(b[4]/b[2],k/b[5])));return h},
ic=d=>`<svg viewBox="0 0 24 24"><path d="${d}"/></svg>`,
I={dashboard:"M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z",samples:"M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3",detection:"M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3",filtration:"M3 4h18l-7 9v6l-4 2v-8z",reports:"M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6",validation:"M5 12l4 4L19 6",how:"M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4",feat:"M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"};
const NAV=[["dashboard","Dashboard"],["samples","Sample Management"],["detection","Image Detection"],["filtration","Filtration Monitoring"],["reports","Results and Reports"],["validation","Validation"]];
$('side').innerHTML='<a class="logo" href="index.html" style="padding:0 14px 20px">Salt<b>Scan</b></a>'+NAV.map(n=>`<a class="${n[0]==pg?'on':''}" href="${n[0]}.html">${ic(I[n[0]])}${n[1]}</a>`).join('')+`<div class="sep"></div><a href="how-it-works.html">${ic(I.how)}How it works</a><a href="features.html">${ic(I.feat)}Features</a><p class="tag">Mock data for design preview. Not experimental results.</p>`;
document.querySelector('.app').insertAdjacentHTML('afterbegin','<nav class="mnav">'+NAV.map(n=>`<a class="${n[0]==pg?'on':''}" href="${n[0]}.html">${n[1]}</a>`).join('')+'<a href="index.html">Website</a></nav>');
const toast=m=>{const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)};
const dl=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'text/csv'}));a.download=name;a.click()};
const head=(t,s)=>`<div class="top"><div><h1>${t}</h1><p class="sub" style="margin:4px 0 0">${s}</p></div><span class="pill ok">Acceptance criterion: ≤ ${LIM} particles left</span></div>`;
const kpi=(c,l,v,sub,i)=>`<div class="kpi ${c}"><span class="ki">${ic(i)}</span><small>${l}</small>${v}${sub?`<span class="up">${sub}</span>`:''}</div>`;
const cnt=()=>document.querySelectorAll('[data-n]').forEach(el=>{const to=+el.dataset.n,d=+(el.dataset.d||0),s=el.dataset.s||'',t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/1100);el.textContent=(to*(1-Math.pow(1-p,3))).toFixed(d)+s;if(p<1)requestAnimationFrame(f)})(t0)});
/* charts */
const grid=(m,w)=>[0,.5,1].map(f=>`<line x1="50" x2="560" y1="${200-f*170}" y2="${200-f*170}" stroke="rgba(255,255,255,.08)"/><text class="axis" x="8" y="${204-f*170}">${Math.round(m*f)}${w||''}</text>`).join('');
function bars(L,A,Z,lim){const m=Math.max(...A,...(Z||[]),lim||0)*1.1,y=v=>200-v/m*170,g=510/L.length,w=Math.min(26,g/(Z?2.6:1.6));
return`<svg viewBox="0 0 600 240">${grid(m)}${lim?`<line x1="50" x2="560" y1="${y(lim)}" y2="${y(lim)}" stroke="#FFC46B" stroke-dasharray="6 5"/><text class="axis" x="440" y="${y(lim)-6}" style="fill:#FFC46B">criterion ${lim}</text>`:''}${L.map((l,i)=>{const x=56+i*g;return`<rect x="${x}" y="${y(A[i])}" width="${w}" height="${200-y(A[i])}" rx="4" fill="#3FE3D0"/>${Z?`<rect x="${x+w+3}" y="${y(Z[i])}" width="${w}" height="${200-y(Z[i])}" rx="4" fill="#FFC46B"/>`:''}<text class="axis" x="${x}" y="222">${l}</text>`}).join('')}</svg>`}
function line(P){const X=i=>50+i*170,Y=v=>200-v*1.8,pt=P.map((v,i)=>[X(i),Y(v)]),d='M'+pt.map(p=>p.join(',')).join(' L');
return`<svg viewBox="0 0 600 240"><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3FE3D0" stop-opacity=".4"/><stop offset="1" stop-color="#3FE3D0" stop-opacity="0"/></linearGradient></defs>${grid(100,'%')}<path d="${d} L${X(P.length-1)},200 L50,200Z" fill="url(#g)"/><path class="draw" pathLength="1" d="${d}" fill="none" stroke="#3FE3D0" stroke-width="3.5" stroke-linecap="round"/>${pt.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#020F17" stroke="#3FE3D0" stroke-width="3"/><text class="axis" x="${p[0]-14}" y="222">${i?'Pass '+i:'Start'}</text><text x="${p[0]-14}" y="${p[1]-12}" fill="#E9F6F8" font-size="12">${P[i]}%</text>`).join('')}</svg>`}
function donut(T){let o=0;return`<svg viewBox="0 0 120 120" style="max-width:200px;margin:auto"><circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="16"/>${T.map(t=>{const l=t[1]*2.513,s=`<circle cx="60" cy="60" r="40" fill="none" stroke="${t[2]}" stroke-width="16" stroke-dasharray="${l-2} 251.3" stroke-dashoffset="${-o}" transform="rotate(-90 60 60)"/>`;o+=l;return s}).join('')}</svg><div class="lg" style="justify-content:center">${T.map(t=>`<span><i style="background:${t[2]}"></i>${t[0]} ${t[1]}%</span>`).join('')}</div>`}
/* manual (x) vs automated (y) scatter with y=x reference line */
function scatter(P){const m=Math.max(1,...P.flat())*1.1,X=v=>50+v/m*510,Y=v=>230-v/m*210;
return`<svg viewBox="0 0 600 270">${[0,.5,1].map(f=>`<line x1="50" x2="560" y1="${230-f*210}" y2="${230-f*210}" stroke="rgba(255,255,255,.08)"/><text class="axis" x="8" y="${234-f*210}">${Math.round(m*f)}</text><text class="axis" x="${50+f*510-8}" y="250">${Math.round(m*f)}</text>`).join('')}<line x1="${X(0)}" y1="${Y(0)}" x2="${X(m)}" y2="${Y(m)}" stroke="#FFC46B" stroke-dasharray="6 5"/><text class="axis" x="470" y="${Y(m)+14}" style="fill:#FFC46B">perfect agreement</text>${P.map(p=>`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="6" fill="#3FE3D0" fill-opacity=".85" stroke="#020F17" stroke-width="2"/>`).join('')}<text class="axis" x="260" y="266">Manual count</text><text class="axis" x="8" y="12">Automated</text></svg>`}
/* % error per sample, with tolerance band */
function errChart(E,L,tol){const m=Math.max(tol*1.5,...E.map(Math.abs),1)*1.15,y=v=>120-v/m*95,g=510/E.length,w=Math.min(30,g*.6);
return`<svg viewBox="0 0 600 250"><line x1="50" x2="560" y1="120" y2="120" stroke="rgba(255,255,255,.25)"/><text class="axis" x="8" y="124">0%</text>${[tol,-tol].map(t=>`<line x1="50" x2="560" y1="${y(t)}" y2="${y(t)}" stroke="#FFC46B" stroke-dasharray="6 5"/><text class="axis" x="8" y="${y(t)+4}" style="fill:#FFC46B">${t>0?'+':'−'}${tol}%</text>`).join('')}${E.map((v,i)=>{const x=56+i*g,top=Math.min(y(v),120),h=Math.abs(y(v)-120);return`<rect x="${x}" y="${top}" width="${w}" height="${Math.max(h,1)}" rx="3" fill="${Math.abs(v)<=tol?'#3FE3D0':'#FFC46B'}"/><text class="axis" x="${x}" y="240">${L[i]}</text>`}).join('')}</svg>`}
const R={};
/* ===== DASHBOARD ===== */
R.dashboard=()=>{const ps=B.filter(b=>b[4]<=LIM).length,pr=Math.round(ps/B.length*100),ae=avg(B.map(eff)),
ep=[0,1,2,3].map(k=>Math.round(avg(B.map(b=>{const h=hist(b);return(b[2]-h[Math.min(k,b[5])])/b[2]*100})))),
att=B.map((b,i)=>[b,i]).filter(x=>x[0][4]>LIM),rec=B.map((b,i)=>[b,i]).slice(-4).reverse();
return head('Dashboard','Summary of tests, detections and filtration status.')+`<div class="grid">
${kpi('s3','Samples tested',`<b data-n="${B.length+U.length}">0</b>`,U.length?U.length+' registered, pending':'All with results',I.samples)}
${kpi('s3','Particles detected',`<b data-n="${B.reduce((s,b)=>s+b[2],0)}">0</b>`,'avg '+Math.round(avg(B.map(b=>b[2])))+' per sample',I.detection)}
${kpi('s3','Avg removal efficiency',`<b data-n="${ae.toFixed(1)}" data-d="1" data-s="%">0</b>`,'across '+B.length+' batches',I.filtration)}
${kpi('s3','Batch pass rate',`<b data-n="${pr}" data-s="%">0</b>`,ps+' of '+B.length+' at ≤ '+LIM+' particles',I.validation)}
<div class="card s12"><div class="banner"><span class="live"></span><div class="grow"><b>Filtration in progress</b> · SALT-009 · pass 2 of 3<div class="bar"><i style="width:66%"></i></div></div><a class="btn o" href="filtration.html">Open monitoring</a></div></div>
<div class="card s8"><h3>Average removal efficiency by pass</h3>${line(ep)}</div><div class="card s4"><h3>Particle types</h3>${donut([["Fibers",46,"#3B7BFF"],["Fragments",38,"#FFC46B"],["Beads",16,"#3FE3D0"]])}</div>
<div class="card s8"><h3>Recent sample tests</h3>${rec.map(x=>`<div class="rl"><span><b>${x[0][0]}</b> · ${x[0][1]}</span><span>${x[0][5]} pass${x[0][5]>1?'es':''} · ${pill(x[0])} <a class="lnk" href="reports.html?s=${x[1]}">View</a></span></div>`).join('')}</div>
<div class="card s4"><h3>Needs attention</h3>${att.length?att.map(x=>`<div class="rl"><span><b>${x[0][0]}</b> · ${x[0][4]} left after ${x[0][5]} passes</span><a class="lnk" href="reports.html?s=${x[1]}">Review</a></div>`).join(''):'<p class="empty">All batches are within the criterion.</p>'}<p class="note">Batches above ${LIM} particles after 3 passes are flagged for manual review.</p></div></div>`};
/* ===== SAMPLES ===== */
R.samples=()=>head('Sample Management','Register salt samples before testing.')+`<div class="card" style="margin-bottom:16px"><h3>New sample</h3><form id="fm" class="form"><label>Sample ID<input name="id" required placeholder="SALT-009"></label><label>Brand / type<input name="t" required placeholder="Sea salt E"></label><label>Weight (g)<input name="w" type="number" step="0.01" required></label><label>Date tested<input name="d" type="date" required></label><label>Initial count (optional)<input name="c" type="number"></label><label>&nbsp;<button class="btn" style="width:100%">Register sample</button></label></form></div>
<div class="card"><div class="row" style="justify-content:space-between;margin-bottom:14px"><div class="chips" id="chips"></div><div class="row"><input class="search" id="q" placeholder="Search ID or type" aria-label="Search samples"><button class="btn o" id="ex">Export CSV</button></div></div><div class="tw"><table><thead><tr><th>ID</th><th>Brand / type</th><th>Weight (g)</th><th>Date</th><th>Initial</th><th>Final</th><th>Passes</th><th>Status</th><th></th></tr></thead><tbody id="tb"></tbody></table></div></div>`;
/* ===== DETECTION ===== */
R.detection=()=>head('Image-Based Detection','Upload an image of the residue or filtrate and count suspected particles.')+`<div class="grid"><div class="card s12"><div class="row"><label class="btn o" style="cursor:pointer">Upload image<input type="file" id="f" accept="image/*" hidden></label><button class="btn" id="demo">Use demo image</button><label class="fl" style="min-width:200px">Darkness threshold: <output id="tv">130</output><input type="range" id="th" min="60" max="200" value="130"></label><label class="fl" style="min-width:200px">Minimum size: <output id="mv">10</output> px<input type="range" id="ms" min="4" max="120" value="10"></label></div></div>
<div class="card s6"><h3>Original</h3><canvas id="ca" width="480" height="320"></canvas></div>
<div class="card s6"><h3>Processed <span class="note" style="margin:0 0 0 8px;font-weight:400">scroll to zoom, drag to pan</span></h3><div class="vpbar"><button class="btn o" id="zi">+</button><button class="btn o" id="zo">−</button><button class="btn o" id="zr">Reset view</button><span id="zl">100%</span></div><div class="vp" id="vp"><canvas id="cb" width="480" height="320"></canvas></div></div>
<div class="kpi s3"><small>Suspected particles</small><b id="n">–</b></div><div class="kpi s3"><small>Fibers</small><b id="c1" style="color:#3B7BFF">–</b></div><div class="kpi s3"><small>Fragments</small><b id="c2" style="color:var(--go)">–</b></div><div class="kpi s3"><small>Beads</small><b id="c3" style="color:var(--aq)">–</b></div>
<div class="card s12"><div class="row" style="justify-content:space-between;margin-bottom:12px"><h3 style="margin:0">Detected particles</h3><button class="btn o" id="ex">Export CSV</button></div><div class="tw scroll"><table><thead><tr><th>#</th><th>Type</th><th>Area (px)</th><th>Size (px)</th></tr></thead><tbody id="pt"></tbody></table></div><p class="note">Click a row to highlight and zoom to that particle.</p></div></div>
<p class="note">Simple thresholding counts dark objects. It cannot tell microplastics from debris or bubbles, so the final method still needs validation against manual microscope counts.</p>`;
/* ===== FILTRATION ===== */
R.filtration=()=>head('Filtration Monitoring','Track each pass and the next action.')+`<div class="grid"><div class="card s12"><div class="row"><label class="fl" style="width:170px">Initial particle count<input type="number" id="n0" min="1" value="120" style="margin-top:6px"></label><div class="row" style="margin-top:20px"><button class="btn" id="go">Record filtration pass</button><button class="btn o" id="auto">Auto-run all passes</button><button class="btn o" id="rs">Reset</button></div></div><div class="bar"><i id="pb" style="width:0"></i></div><p class="note" id="pl"></p></div>
<div class="card s4"><h3>Process stages</h3><div class="pipe" id="pipe"></div></div><div class="card s8"><h3>Particles remaining after each pass</h3><div id="fc"></div></div>
<div class="kpi s3"><small>Current pass</small><b id="k1">0 / 3</b></div><div class="kpi s3"><small>Remaining particles</small><b id="k2">120</b></div><div class="kpi s3"><small>Removal efficiency</small><b id="k3">0%</b></div><div class="kpi s3"><small>Next action</small><b id="k4" class="big" style="font-size:1.05rem">Run first pass</b></div>
<div class="card s12"><h3>Pass log</h3><div class="log" id="lg"></div><p class="note">Each pass removes a random 55–75% in this preview.</p></div></div>`;
/* ===== REPORTS ===== */
R.reports=()=>head('Results and Reports','Before-and-after comparison and filtration history.')+`<div class="row" style="margin-bottom:16px"><select id="sel" style="max-width:260px">${B.map((b,i)=>`<option value="${i}">${b[0]} · ${b[1]}</option>`).join('')}</select><button class="btn" id="pdf">Download PDF</button><button class="btn o" id="csv">Download CSV</button></div><div id="rp"></div>`;
/* ===== VALIDATION ===== */
R.validation=()=>head('Validation','Automated counts compared with manual microscope counts. Edit the numbers to use your real data.')+`<div class="grid"><div class="card s12"><div class="row"><label class="fl" style="min-width:260px">Accepted difference: ±<output id="tl">10</output>%<input type="range" id="tol" min="1" max="25" value="10"></label><button class="btn o" id="vr">Reset to sample data</button><span class="note" style="margin:0">Changes are saved in this browser only.</span></div></div>
<div class="kpi s3"><small>Mean absolute error</small><b id="v1">–</b><span class="up">particles per sample</span></div><div class="kpi s3"><small>Mean % error</small><b id="v2">–</b></div><div class="kpi s3"><small>Correlation (r)</small><b id="v3">–</b></div><div class="kpi s3"><small>Within tolerance</small><b id="v4">–</b></div>
<div class="card s6"><h3>Manual vs automated count</h3><div id="sc"></div></div><div class="card s6"><h3>Error per sample</h3><div id="eb"></div><div class="lg"><span><i style="background:var(--aq)"></i>Within tolerance</span><span><i style="background:var(--go)"></i>Outside</span></div></div>
<div class="card s12"><h3>Per-sample comparison</h3><div class="tw"><table><thead><tr><th>ID</th><th>Type</th><th>Manual count</th><th>Automated count</th><th>Difference</th><th>Error</th></tr></thead><tbody id="vt"></tbody></table></div></div></div>
<p class="note">Points close to the dashed line mean the automated count agrees with the manual count.</p>`;
$('main').innerHTML=R[pg]();
const J={dashboard:cnt,
samples(){let flt='all';
const rows=()=>[...B.map((b,i)=>({id:b[0],t:b[1],w:'–',d:b[7],ini:b[2],fin:b[4],ps:b[5],st:b[4]<=LIM?'ok':'rv',i})),...U.map((u,j)=>({id:u[0],t:u[1],w:u[2],d:u[3],ini:u[4]||'–',fin:'–',ps:'–',st:'pg',u:j}))],
draw=()=>{const all=rows(),q=$('q').value.toLowerCase(),C=s=>all.filter(r=>s=='all'||r.st==s).length;
$('chips').innerHTML=[['all','All'],['ok','Passed'],['rv','Manual review'],['pg','Pending']].map(c=>`<button class="fchip ${flt==c[0]?'on':''}" data-f="${c[0]}">${c[1]}<b>${C(c[0])}</b></button>`).join('');
const v=all.filter(r=>(flt=='all'||r.st==flt)&&(r.id+' '+r.t).toLowerCase().includes(q));
$('tb').innerHTML=v.length?v.map(r=>`<tr><td><b>${esc(r.id)}</b></td><td>${esc(r.t)}</td><td>${esc(r.w)}</td><td>${esc(r.d)}</td><td>${esc(r.ini)}</td><td>${r.fin}</td><td>${r.ps}</td><td>${stb(r.st)}</td><td>${r.u!=null?`<button class="x" data-del="${r.u}" title="Remove sample" aria-label="Remove sample">✕</button>`:`<a class="lnk" href="reports.html?s=${r.i}">Report</a>`}</td></tr>`).join(''):'<tr><td colspan="9" class="empty">No samples match.</td></tr>'};
draw();$('q').oninput=draw;
$('chips').onclick=e=>{const b=e.target.closest('[data-f]');if(b){flt=b.dataset.f;draw()}};
$('tb').onclick=e=>{const b=e.target.closest('[data-del]');if(!b)return;U.splice(+b.dataset.del,1);try{localStorage.setItem('ss',JSON.stringify(U))}catch(x){}draw();toast('Sample removed')};
$('ex').onclick=()=>dl('saltscan-samples.csv','id,type,weight_g,date,initial,final,passes,status\n'+rows().map(r=>[r.id,r.t,r.w,r.d,r.ini,r.fin,r.ps,{ok:'Passed',rv:'Manual review',pg:'Pending'}[r.st]].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'));
$('fm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),id=String(f.get('id')).trim();if(rows().some(r=>r.id.toLowerCase()==id.toLowerCase())){toast('That sample ID already exists');return}U.push([id,f.get('t'),f.get('w'),f.get('d'),f.get('c')]);try{localStorage.setItem('ss',JSON.stringify(U))}catch(x){}e.target.reset();draw();toast('Sample registered')}},
detection(){let img,P=[],sel=-1,base=null,W=480,H=320,view={s:1,x:0,y:0};
const NAMES=['Fiber','Fragment','Bead'],COL=['#3B7BFF','#FFC46B','#ffffff'],vp=$('vp');
const apply=()=>{$('cb').style.transform=`translate(${view.x}px,${view.y}px) scale(${view.s})`;$('zl').textContent=Math.round(view.s*100)+'%'},
zoom=(f,mx,my)=>{const ns=Math.min(8,Math.max(1,view.s*f)),k=ns/view.s;view.x=mx-(mx-view.x)*k;view.y=my-(my-view.y)*k;view.s=ns;if(ns==1){view.x=0;view.y=0}apply()},
paint=()=>{if(!base)return;const y=$('cb').getContext('2d');y.putImageData(base,0,0);y.lineWidth=2;P.forEach(q=>{y.strokeStyle=COL[q.k];y.strokeRect(q.x-3,q.y-3,q.w+6,q.h+6)});if(sel>=0){const q=P[sel];y.strokeStyle='#FF6B6B';y.lineWidth=4;y.strokeRect(q.x-6,q.y-6,q.w+12,q.h+12)}},
table=()=>{$('pt').innerHTML=P.length?P.map((q,i)=>`<tr data-i="${i}" class="${i==sel?'sel':''}"><td>${i+1}</td><td><span class="sw" style="background:${COL[q.k]}"></span>${NAMES[q.k]}</td><td>${q.ar}</td><td>${q.w}×${q.h}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">No particles detected. Try a higher threshold or smaller minimum size.</td></tr>'},
analyze=()=>{if(!img)return;const t=+$('th').value,ms=+$('ms').value;W=480;H=Math.round(W*img.height/img.width);const a=$('ca'),b=$('cb');a.width=b.width=W;a.height=b.height=H;const x=a.getContext('2d');x.drawImage(img,0,0,W,H);const d=x.getImageData(0,0,W,H).data,N=W*H,m=new Uint8Array(N);
for(let i=0;i<N;i++)m[i]=d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11<t?1:0;
const y=b.getContext('2d'),o=y.createImageData(W,H),seen=new Uint8Array(N),C=[0,0,0];P=[];
for(let i=0;i<N;i++){if(m[i]){o.data.set([63,227,208,130],i*4)}else o.data.set([8,32,45,255],i*4)}
for(let i=0;i<N;i++){if(!m[i]||seen[i])continue;const s=[i];let ar=0,x0=W,x1=0,y0=H,y1=0;seen[i]=1;
while(s.length){const p=s.pop(),px=p%W,py=(p/W)|0;ar++;x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py);for(const q of[p-1,p+1,p-W,p+W])if(q>=0&&q<N&&!seen[q]&&m[q]&&Math.abs(q%W-px)<2){seen[q]=1;s.push(q)}}
if(ar<ms)continue;const w=x1-x0+1,h=y1-y0+1,asp=Math.max(w,h)/Math.min(w,h),k=asp>3?0:asp<1.4&&ar/(w*h)>.65?2:1;C[k]++;P.push({x:x0,y:y0,w,h,k,ar})}
base=o;sel=-1;paint();table();$('n').textContent=P.length;[1,2,3].forEach(k=>$('c'+k).textContent=C[k-1])};
$('th').oninput=()=>{$('tv').textContent=$('th').value;analyze()};
$('ms').oninput=()=>{$('mv').textContent=$('ms').value;analyze()};
$('f').onchange=e=>{if(!e.target.files[0])return;const i=new Image;i.onload=()=>{img=i;view={s:1,x:0,y:0};apply();analyze()};i.src=URL.createObjectURL(e.target.files[0])};
$('demo').onclick=()=>{const c=document.createElement('canvas');c.width=480;c.height=320;const x=c.getContext('2d');x.fillStyle='#f1f1ec';x.fillRect(0,0,480,320);
for(let i=0;i<34;i++){const px=20+Math.random()*420,py=20+Math.random()*270,r=Math.random();x.fillStyle=x.strokeStyle=['#1d3f9c','#9c1d3f','#222'][i%3];
if(r<.35){x.lineWidth=2.5;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+15,py+20,px+40+Math.random()*20,py+Math.random()*30);x.stroke()}else if(r<.7){x.beginPath();x.arc(px,py,4+Math.random()*4,0,7);x.fill()}else{x.beginPath();x.moveTo(px,py);x.lineTo(px+12,py+3);x.lineTo(px+6,py+13);x.fill()}}
img=c;view={s:1,x:0,y:0};apply();analyze()};
$('pt').onclick=e=>{const tr=e.target.closest('[data-i]');if(!tr)return;sel=+tr.dataset.i;const q=P[sel],k=vp.clientWidth/W;view.s=Math.max(view.s,3);view.x=vp.clientWidth/2-(q.x+q.w/2)*k*view.s;view.y=vp.clientHeight/2-(q.y+q.h/2)*k*view.s;apply();paint();table()};
vp.addEventListener('wheel',e=>{e.preventDefault();const r=vp.getBoundingClientRect();zoom(e.deltaY<0?1.15:1/1.15,e.clientX-r.left,e.clientY-r.top)},{passive:false});
let drag=null;vp.onpointerdown=e=>{drag={x:e.clientX-view.x,y:e.clientY-view.y};vp.setPointerCapture(e.pointerId)};
vp.onpointermove=e=>{if(!drag||view.s==1)return;view.x=e.clientX-drag.x;view.y=e.clientY-drag.y;apply()};
vp.onpointerup=()=>{drag=null};
$('zi').onclick=()=>zoom(1.4,vp.clientWidth/2,vp.clientHeight/2);$('zo').onclick=()=>zoom(1/1.4,vp.clientWidth/2,vp.clientHeight/2);$('zr').onclick=()=>{view={s:1,x:0,y:0};apply()};
$('ex').onclick=()=>dl('saltscan-particles.csv','id,type,area_px,width_px,height_px,x,y\n'+P.map((q,i)=>[i+1,NAMES[q.k],q.ar,q.w,q.h,q.x,q.y].join(',')).join('\n'));
$('demo').click()},
filtration(){const S=["Sample Preparation","Dissolution","Filtration Pass","Automated Detection","Efficiency Check","Repeat or Manual Review","Recovery and Report"],MAXP=3;let c,st,msg,done,tok=0,log,N,timer;
const draw=()=>{const n=c.length-1,r=c[n];$('pipe').innerHTML=S.map((s,i)=>`<div class="${i==st?'on':''}">${s}</div>`).join('');$('fc').innerHTML=bars(c.map((v,i)=>i?'Pass '+i:'Start'),c,null,LIM);
$('k1').textContent=n+' / '+MAXP;$('k2').textContent=r;$('k3').textContent=((N-r)/N*100).toFixed(1)+'%';$('k4').textContent=msg;
$('go').disabled=done;$('auto').disabled=done;$('pb').style.width=(done&&r<=LIM?100:n/MAXP*100)+'%';
$('pl').textContent=done?(r<=LIM?'Batch passed after '+n+' pass'+(n>1?'es':'')+'.':'Batch flagged for manual review after '+n+' passes.'):'Pass '+n+' of '+MAXP+' recorded.';
$('lg').innerHTML=log.length?log.slice().reverse().join(''):'<p class="empty">No passes recorded yet.</p>'},
reset=()=>{clearInterval(timer);tok++;N=Math.max(1,Math.round(+$('n0').value)||120);c=[N];st=2;msg='Run first pass';done=false;log=[];draw()},
step=()=>{if(done)return false;const prev=c[c.length-1],r=Math.round(prev*(1-(.55+Math.random()*.2)));c.push(r);const n=c.length-1;let act;
if(r<=LIM){st=6;msg='Recover salt, report';done=true;act='Passed, recover salt'}
else if(n<MAXP){st=5;msg='Repeat filtration';act='Over limit, repeat';const t=tok;setTimeout(()=>{if(t==tok&&!done){st=2;draw()}},1200)}
else{st=5;msg='Flag for manual review';done=true;act='Flagged for manual review'}
log.push(`<div><span><b>Pass ${n}</b> · ${prev} → ${r}</span><span>${((prev-r)/prev*100).toFixed(1)}% removed · ${act}</span></div>`);draw();return !done};
$('go').onclick=step;$('auto').onclick=()=>{clearInterval(timer);if(step())timer=setInterval(()=>{if(!step())clearInterval(timer)},1400)};
$('rs').onclick=reset;$('n0').onchange=reset;reset()},
reports(){const qs=new URLSearchParams(location.search);if(qs.has('s')&&B[+qs.get('s')])$('sel').value=qs.get('s');
const draw=()=>{const b=B[+$('sel').value],e=eff(b),h=hist(b),ok=b[4]<=LIM;
$('rp').innerHTML=`<div class="printonly"><h2>SaltScan compliance report</h2><p>${b[0]} · ${b[1]} · tested ${b[7]} · generated ${new Date().toLocaleDateString()}</p></div><div class="grid"><div class="kpi s3"><small>Initial count</small><b>${b[2]}</b></div><div class="kpi s3"><small>Final count</small><b>${b[4]}</b></div><div class="kpi s3"><small>Removal efficiency</small><b>${e.toFixed(1)}%</b></div><div class="kpi s3"><small>Salt recovery</small><b>${b[6]}%</b></div>
<div class="card s8"><h3>Before and after, all samples</h3>${bars(B.map(x=>x[0].slice(5)),B.map(x=>x[2]),B.map(x=>x[4]))}<div class="lg"><span><i style="background:var(--aq)"></i>Before</span><span><i style="background:var(--go)"></i>After final pass</span></div></div>
<div class="card s4"><h3>Final disposition</h3><p class="big">${ok?'Passed':'Manual review'}</p><p class="note" style="margin-bottom:14px">${ok?'Within the criterion after '+b[5]+' pass(es). Salt recovered by recrystallization.':'Still above the criterion after 3 passes. Flagged for reviewer decision.'}</p><div class="kv"><span>Sample</span>${b[0]}</div><div class="kv"><span>Type</span>${b[1]}</div><div class="kv"><span>Date tested</span>${b[7]}</div><div class="kv"><span>Passes used</span>${b[5]} of 3</div></div>
<div class="card s6"><h3>Removal efficiency by pass · ${b[0]}</h3>${line(h.map(v=>Math.round((b[2]-v)/b[2]*100)))}</div>
<div class="card s6"><h3>Filtration history · ${b[0]}</h3><table><thead><tr><th>Stage</th><th>Particles</th><th>Efficiency</th></tr></thead><tbody>${h.map((v,i)=>`<tr><td>${i?'Pass '+i:'Before filtration'}</td><td>${v}</td><td>${((b[2]-v)/b[2]*100).toFixed(1)}%</td></tr>`).join('')}</tbody></table></div></div>`};
$('sel').onchange=draw;draw();$('pdf').onclick=()=>print();
$('csv').onclick=()=>{dl('saltscan-report.csv','id,type,date,initial,final,passes,efficiency,recovery\n'+B.map(b=>[b[0],b[1],b[7],b[2],b[4],b[5],eff(b).toFixed(1),b[6]].join(',')).join('\n'));toast('CSV downloaded')}},
validation(){let O={};try{O=JSON.parse(localStorage.getItem('ssv')||'{}')}catch(e){}
const D=()=>B.map(b=>{const o=O[b[0]]||[];return{id:b[0],t:b[1],a:o[0]!=null?o[0]:b[2],m:o[1]!=null?o[1]:b[3]}}),
save=()=>{try{localStorage.setItem('ssv',JSON.stringify(O))}catch(e){}},
calc=()=>{const d=D(),tol=+$('tol').value,E=d.map(x=>x.m?(x.a-x.m)/x.m*100:0),mae=avg(d.map(x=>Math.abs(x.a-x.m))),mape=avg(E.map(Math.abs)),mx=avg(d.map(x=>x.m)),my=avg(d.map(x=>x.a)),
sx=Math.sqrt(d.reduce((s,x)=>s+(x.m-mx)**2,0)),sy=Math.sqrt(d.reduce((s,x)=>s+(x.a-my)**2,0)),r=sx&&sy?d.reduce((s,x)=>s+(x.m-mx)*(x.a-my),0)/(sx*sy):NaN,inn=E.filter(e=>Math.abs(e)<=tol).length;
$('tl').textContent=tol;$('v1').textContent=mae.toFixed(1);$('v2').textContent=mape.toFixed(1)+'%';$('v3').textContent=isNaN(r)?'–':r.toFixed(3);$('v4').textContent=inn+' / '+d.length;
$('sc').innerHTML=scatter(d.map(x=>[x.m,x.a]));$('eb').innerHTML=errChart(E,d.map(x=>x.id.slice(5)),tol);
d.forEach((x,i)=>{const e=E[i];$('d-'+x.id).textContent=(x.a-x.m>0?'+':'')+(x.a-x.m);$('e-'+x.id).innerHTML=`<span class="pill ${Math.abs(e)<=tol?'ok':'pg'}">${e>0?'+':''}${e.toFixed(1)}%</span>`})},
build=()=>{$('vt').innerHTML=D().map(x=>`<tr><td><b>${x.id}</b></td><td>${x.t}</td><td><input class="mini" type="number" min="0" data-id="${x.id}" data-k="1" value="${x.m}" aria-label="Manual count ${x.id}"></td><td><input class="mini" type="number" min="0" data-id="${x.id}" data-k="0" value="${x.a}" aria-label="Automated count ${x.id}"></td><td id="d-${x.id}"></td><td id="e-${x.id}"></td></tr>`).join('');calc()};
$('vt').oninput=e=>{const i=e.target.closest('input');if(!i||i.value==='')return;const id=i.dataset.id;O[id]=O[id]||[];O[id][+i.dataset.k]=Math.max(0,+i.value);const b=B.find(x=>x[0]==id);if(O[id][0]==null)O[id][0]=b[2];if(O[id][1]==null)O[id][1]=b[3];save();calc()};
$('tol').oninput=calc;$('vr').onclick=()=>{O={};save();build();toast('Reset to sample data')};build()}};
J[pg]();
}
