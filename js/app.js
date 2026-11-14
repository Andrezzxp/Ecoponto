// ====== APOIO MENSAL: cole aqui o link de pagamento/assinatura (Mercado Pago, Stripe, Apoia.se...) e/ou a chave Pix ======
const PAY_LINK='',PIX_KEY='',CONTACT_URL='';
// ====== MAPTILER (mapa principal): crie a chave grátis em cloud.maptiler.com/account/keys e cole entre as aspas. Vazia = usa CARTO/OpenStreetMap ======
const MAPTILER_KEY='';
// ====== GOOGLE MAPS (opcional, só se preencher): cole sua chave da API entre as aspas. Vazia = usa o mapa alternativo (CARTO/OpenStreetMap) ======
const MAPS_KEY='';
let GM=null,GMEL=null,GMK=[],GML=null,GMFAIL=0;
window.gm_authFailure=()=>{GMFAIL=1;GM=null;GMEL=null;GML=null;toast('Chave do Google Maps inválida ou sem permissão. Usando o mapa alternativo.');render()};
function loadGM(){if(!GML)GML=new Promise((ok,no)=>{window.gmReady=()=>ok(window.google.maps);const sc=document.createElement('script');sc.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}&callback=gmReady&language=pt-BR&region=BR`;sc.onerror=()=>{GML=null;no()};document.head.appendChild(sc)});return GML}
function gdraw(){if(!GM)return;const g=google.maps,col={review:'#F9A825',ok:'#2E7D32',rej:'#D32F2F'},ic=(c,sc,w)=>({path:g.SymbolPath.CIRCLE,scale:sc,fillColor:c,fillOpacity:1,strokeColor:'#fff',strokeWeight:w});
GMK.forEach(k=>k.setMap(null));GMK=[];
S.reports.filter(r=>r.lat!=null).forEach(r=>{const k=new g.Marker({position:{lat:r.lat,lng:r.lng},map:GM,title:r.addr,icon:ic(col[pcls(r)],9,2)});k.addListener('click',()=>openR(r.id,'v-home'));GMK.push(k)});
if(LOC)GMK.push(new g.Marker({position:{lat:LOC.lat,lng:LOC.lng},map:GM,icon:ic('#1E88E5',8,3),zIndex:9}))}
async function gmInit(m){try{const g=await loadGM();if(!$('#gmap'))return;
if(!GMEL){GMEL=document.createElement('div');GMEL.style.cssText='position:absolute;inset:0';GM=new g.Map(GMEL,{center:{lat:MV.lat,lng:MV.lng},zoom:MV.z,disableDefaultUI:true,gestureHandling:'greedy',clickableIcons:false});
GM.addListener('dragstart',()=>MV.touched=1);GM.addListener('idle',()=>{const c=GM.getCenter();MV.lat=c.lat();MV.lng=c.lng();MV.z=GM.getZoom()})}
else{GM.setCenter({lat:MV.lat,lng:MV.lng});GM.setZoom(MV.z)}
m.prepend(GMEL);const a=$('.mattr');if(a)a.style.display='none';g.event.trigger(GM,'resize');gdraw();
if(!LOC&&!MV.geo&&navigator.geolocation){MV.geo=1;navigator.geolocation.getCurrentPosition(p=>{LOC={lat:p.coords.latitude,lng:p.coords.longitude};if(!MV.touched&&GM){GM.setCenter(LOC);GM.setZoom(15)}gdraw()},()=>{},{timeout:8000})}
}catch(e){GMFAIL=1;GM=null;render()}}
const KEY='ecopontoV1',$=s=>document.querySelector(s);
const CATS=[['🗑️','Lixo acumulado'],['🧱','Entulho'],['🛋️','Móveis descartados'],['🚮','Lixeira cheia'],['🌳','Área verde'],['➕','Outros']];
const ST=['Enviada','Recebida','Em análise','Resolvida'];
const FL=['Todas','Em análise','Resolvidas','Rejeitadas'];
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let LASTR=null,SP={},mem=null,S,D,cur='v-home',BACK='v-list',OPEN=0,LAST=0,F='Todas',delArm=0,tt;
function seed(){return{notif:true,big:false,reports:[],redeems:[],claims:[],sponsors:[],pledges:[]}}
function load(){try{const r=localStorage.getItem(KEY)||localStorage.getItem('cidadeLimpaV3');return r?JSON.parse(r):mem}catch(e){return mem}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(DB?{notif:S.notif,big:S.big}:S))}catch(e){mem=S}}
S=Object.assign(seed(),load()||{});
const blank=()=>({addr:'',cat:null,desc:'',photo:null,x:.5,y:.5,lat:null,lng:null,acc:null});D=blank();
let ME='local',ADMIN=true,NAME='',DB=null;
const mine=r=>r.uid===ME,pid=id=>String(id).slice(-6).padStart(6,'0');
const my=()=>S.reports.filter(mine),claimed=id=>S.claims.some(c=>mine(c)&&c.m===id&&c.day===today());
const dayOf=t=>t?new Date(t).toLocaleDateString('sv-SE'):'',today=()=>dayOf(Date.now()),tdy=()=>my().filter(r=>dayOf(r.t[0])===today());
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),fmtd=t=>new Date(t).toLocaleDateString('pt-BR');
const sup=()=>S.pledges.filter(mine).sort((a,b)=>b.at-a.at)[0],isSup=()=>{const p=sup();return !!p&&p.status==='ativo'&&p.until>Date.now()};
const MS=()=>[
{id:'d0',title:'Abra o app hoje',desc:'Check-in diário',pts:5,p:()=>[1,1]},
{id:'d1',title:'Envie uma denúncia hoje',pts:20,p:()=>[Math.min(tdy().length,1),1]},
{id:'d2',title:'Faça uma denúncia completa',desc:'Com foto, GPS e descrição',pts:15,p:()=>[tdy().some(r=>r.photo&&r.lat!=null&&r.desc)?1:0,1]},
{id:'d3',title:'Envie 3 denúncias hoje',pts:30,p:()=>[Math.min(tdy().length,3),3]},
{id:'d4',title:'Tenha uma denúncia resolvida hoje',desc:'Quando a prefeitura marcar como resolvida',pts:50,p:()=>[my().some(r=>r.stage>=3&&!r.rej&&dayOf(r.t[3])===today())?1:0,1]},
{id:'d5',title:'Convide um amigo',desc:'Compartilhe o app com alguém',pts:10,share:1,p:()=>[0,1]},
...(isSup()?[{id:'d6',title:'Bônus de apoiador 💚',desc:'Obrigado por apoiar o projeto',pts:10,p:()=>[1,1]}]:[])];
const ledger=()=>[...S.reports.filter(r=>mine(r)&&r.stage>=3&&!r.rej).map(r=>({t:'Denúncia validada #'+pid(r.id),v:100,at:r.t[3]||0})),...S.claims.filter(mine).map(c=>({t:'Missão: '+(c.t||'concluída'),v:c.v,at:c.at})),...S.redeems.filter(mine).map(x=>({t:'Resgate: '+x.name+(x.code?' · código '+x.code+(x.used?' (usado)':''):''),v:-x.cost,at:x.at}))].sort((a,b)=>a.at-b.at);
const bal=()=>ledger().reduce((a,l)=>a+l.v,0),num=n=>n.toLocaleString('pt-BR');
const status=r=>r.rej?'Rejeitada':r.stage>=3?'Resolvida':'Em análise';
const pcls=r=>r.rej?'rej':r.stage>=3?'ok':'review';
const fmt=t=>{const d=new Date(t);return d.toLocaleDateString('pt-BR',{day:'numeric',month:'short'})+', '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})};
function ago(t){const h=Math.floor((Date.now()-t)/36e5),d=Math.floor(h/24);return d>=1?`há ${d} dia${d>1?'s':''}`:h>=1?`há ${h} h`:'agora há pouco'}
const thumb=r=>r.photo?`style="background:url(${r.photo}) center/cover"`:'';
const sb0=()=>`<div class="statusbar"><span>${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span><span>●●● 🔋</span></div>`;
const sb=()=>'';
const tb=(t,b,r='<span style="width:30px"></span>')=>`<div class="topbar">${b?`<span class="back" onclick="go('${b}')">←</span>`:''}<span class="title">${t}</span>${r}</div>`;
const steps=n=>`<div class="steps">${[1,2,3,4,5].map(i=>`<div class="seg ${i<=n?'done':''}"></div>`).join('')}</div>`;
const tabs=a=>`<div class="tabbar">${[['v-home','🏠','Início'],['v-list','📋','Denúncias'],['v-points','🏆','Pontos'],['v-profile','👤','Perfil']].map(([id,i,l])=>`<div class="tab ${a===id?'on':''}" onclick="go('${id}')"><span class="dot">${i}</span>${l}</div>`).join('')}</div>`;
function toast(m){const e=$('#toast');e.textContent=m;e.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>e.style.opacity=0,2200)}
function need(ok,msg,next,f){if(!ok){toast(msg);if(f)$(f)&&$(f).focus();return}go(next)}
let STREAM=null,FACING='environment',LOC=null,WATCH=null,WT=null;
function stopCam(){if(STREAM)STREAM.getTracks().forEach(t=>t.stop());STREAM=null}
function stopGps(){if(WATCH!=null)navigator.geolocation.clearWatch(WATCH);WATCH=null;clearTimeout(WT)}
function go(v){stopCam();stopGps();cur=v;delArm=0;render()}
const gmsg=e=>e.code===1?'Permissão de localização negada. Ative o acesso à localização no navegador e toque em “Atualizar localização”.':e.code===3?'Tempo esgotado ao obter o GPS. Vá para um local aberto e tente de novo.':'Não foi possível obter a localização.';
function gpsUI(t,cls){const e=$('#gps');if(e){e.innerHTML=t;e.className='card '+(cls||'')}}
function locate(){stopGps();if(!navigator.geolocation){gpsUI('Este navegador não tem GPS. Digite o endereço.','err');return}
gpsUI('📡 Buscando sua localização exata…');let best=null;
const done=()=>{stopGps();if(best)fix(best,true)};
WATCH=navigator.geolocation.watchPosition(p=>{if(!best||p.coords.accuracy<best.coords.accuracy)best=p;fix(best,false);if(p.coords.accuracy<=15)done()},e=>{stopGps();if(!best)gpsUI('⚠️ '+gmsg(e),'err');else done()},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
WT=setTimeout(done,9000)}
function fix(p,final){D.lat=p.coords.latitude;D.lng=p.coords.longitude;D.acc=Math.round(p.coords.accuracy);LOC={lat:D.lat,lng:D.lng};
gpsUI(`📍 <b>${D.lat.toFixed(6)}, ${D.lng.toFixed(6)}</b><br><span class="helper">Precisão de ±${D.acc} m${final?'':' · refinando…'}</span>`,'ok');
if(final&&!D.addr.trim())rev()}
async function rev(){if(MAPS_KEY&&!GMFAIL){try{const g=await loadGM(),x=await new g.Geocoder().geocode({location:{lat:D.lat,lng:D.lng}}),t=x.results[0]&&x.results[0].formatted_address;if(t&&!D.addr.trim()){D.addr=t;const i=$('#addr');if(i)i.value=t}return}catch(e){}}
if(MAPTILER_KEY){try{const j=await(await fetch(`https://api.maptiler.com/geocoding/${D.lng},${D.lat}.json?key=${encodeURIComponent(MAPTILER_KEY)}&language=pt&limit=1`)).json(),t=j.features&&j.features[0]&&j.features[0].place_name;if(t&&!D.addr.trim()){D.addr=t;const i=$('#addr');if(i)i.value=t;return}}catch(e){}}
try{const c=new AbortController();setTimeout(()=>c.abort(),5000);const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${D.lat}&lon=${D.lng}&accept-language=pt-BR`,{signal:c.signal});const j=await r.json(),a=j.address||{};
const t=[a.road,a.house_number,a.suburb||a.neighbourhood,a.city||a.town].filter(Boolean).join(', ')||j.display_name;if(t&&!D.addr.trim()){D.addr=t;const i=$('#addr');if(i)i.value=t}}catch(e){if($('#addr')&&!D.addr)toast('Digite o endereço ou uma referência do local')}}
async function cam(){stopCam();const v=$('#vid');if(!v)return;
try{if(!navigator.mediaDevices)throw{name:'NoApi'};STREAM=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:FACING},width:{ideal:1280}},audio:false});if(!document.body.contains(v)){stopCam();return}v.srcObject=STREAM;$('#camerr').textContent=''}
catch(e){if(!document.body.contains(v))return;v.style.display='none';$('#pbph').style.display='flex';$('#camerr').textContent=e.name==='NotAllowedError'?'Acesso à câmera negado. Permita a câmera no navegador ou use as opções abaixo.':'Câmera indisponível aqui. Use “Tirar foto pelo celular” ou a galeria.'}}
function flip(){FACING=FACING==='environment'?'user':'environment';cam()}
function snap(){const v=$('#vid');if(!STREAM||!v||!v.videoWidth){$('#cam').click();return}
const k=Math.min(1,640/Math.max(v.videoWidth,v.videoHeight)),c=document.createElement('canvas');c.width=v.videoWidth*k;c.height=v.videoHeight*k;c.getContext('2d').drawImage(v,0,0,c.width,c.height);D.photo=c.toDataURL('image/jpeg',.7);D.at=Date.now();go('v-photo')}

function openR(id,back){OPEN=id;BACK=back;go('v-detail')}
function newReport(){D=blank();go('v-new')}
function render(){$('.screen').classList.toggle('big',!!S.big);const h=V[cur]();$('#app').innerHTML=`<div class="view active" id="${cur}">${h}</div>`;AFTER[cur]&&AFTER[cur]()}

const TS=256,PV=[...(MAPTILER_KEY?[k=>`https://api.maptiler.com/maps/streets-v4/256/${k}.png?key=${encodeURIComponent(MAPTILER_KEY)}`]:[]),k=>`https://${'abc'[k.length%3]}.basemaps.cartocdn.com/rastertiles/voyager/${k}.png`,k=>`https://tile.openstreetmap.org/${k}.png`];let MV={lat:-23.55,lng:-46.63,z:13,touched:0,geo:0},TL={};
const wx=(g,z)=>(g+180)/360*TS*2**z,wy=(a,z)=>{const r=a*Math.PI/180;return(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*TS*2**z};
const ux=(x,z)=>x/(TS*2**z)*360-180,uy=(y,z)=>{const n=Math.PI-2*Math.PI*y/(TS*2**z);return 180/Math.PI*Math.atan(Math.sinh(n))};
function mdraw(){if(GM){gdraw();return}const m=$('#gmap');if(!m)return;const w=m.clientWidth,h=m.clientHeight,z=MV.z,cx=wx(MV.lng,z),cy=wy(MV.lat,z),x0=cx-w/2,y0=cy-h/2,n=2**z,keep={};
for(let tx=Math.floor(x0/TS);tx<=Math.floor((x0+w)/TS);tx++)for(let ty=Math.floor(y0/TS);ty<=Math.floor((y0+h)/TS);ty++){if(ty<0||ty>=n)continue;const k=z+'/'+(((tx%n)+n)%n)+'/'+ty,key=k+'@'+tx;keep[key]=1;let i=TL[key];
if(!i){i=TL[key]=document.createElement('img');i.className='tile';i.draggable=false;i.dataset.p=0;i.onerror=()=>{const p=+i.dataset.p+1;if(p<PV.length){i.dataset.p=p;i.src=PV[p](k)}else{i.remove();const e=$('#mnote');if(e)e.style.display='block'}};i.src=PV[0](k);$('#tiles').appendChild(i)}
i.style.transform=`translate(${Math.round(tx*TS-x0)}px,${Math.round(ty*TS-y0)}px)`}
for(const k in TL)if(!keep[k]){TL[k].remove();delete TL[k]}
let h2='';S.reports.filter(r=>r.lat!=null).forEach(r=>{const px=wx(r.lng,z)-x0,py=wy(r.lat,z)-y0;if(px>-30&&px<w+30&&py>-40&&py<h+30)h2+=`<div class="pin ${pcls(r)}" title="${esc(r.addr)}" style="left:${px-11}px;top:${py-26}px" onpointerdown="event.stopPropagation()" onclick="openR(${r.id},'v-home')"></div>`});
if(LOC)h2+=`<div class="medot" style="left:${wx(LOC.lng,z)-x0-8}px;top:${wy(LOC.lat,z)-y0-8}px"></div>`;$('#mpins').innerHTML=h2}
function mgo(lat,lng,z){MV.lat=lat;MV.lng=lng;if(z)MV.z=z;MV.touched=1;if(GM){GM.setCenter({lat,lng});if(z)GM.setZoom(z)}mdraw()}
function setZ(d){if(GM){GM.setZoom(Math.max(3,Math.min(19,GM.getZoom()+d)));MV.touched=1;return}MV.z=Math.max(3,Math.min(19,MV.z+d));MV.touched=1;mdraw()}
function mfit(){const m=$('#gmap'),P=S.reports.filter(r=>r.lat!=null).map(r=>[r.lat,r.lng]);if(LOC)P.push([LOC.lat,LOC.lng]);if(!P.length)return;
const la=P.map(p=>p[0]),ln=P.map(p=>p[1]),a=Math.min(...la),b=Math.max(...la),c=Math.min(...ln),d=Math.max(...ln);MV.lat=(a+b)/2;MV.lng=(c+d)/2;let z=16;
for(;z>3;z--)if(wx(d,z)-wx(c,z)<m.clientWidth*.7&&wy(a,z)-wy(b,z)<m.clientHeight*.6)break;MV.z=Math.min(z,16)}
function mlocate(){if(!navigator.geolocation){toast('Este navegador não tem GPS');return}toast('Buscando sua localização…');
navigator.geolocation.getCurrentPosition(p=>{LOC={lat:p.coords.latitude,lng:p.coords.longitude};mgo(LOC.lat,LOC.lng,17)},e=>toast(gmsg(e)),{enableHighAccuracy:true,timeout:12000,maximumAge:0})}
async function msearch(){const q=$('#q').value.trim().toLowerCase();if(!q)return;const r=S.reports.find(r=>r.lat!=null&&r.addr.toLowerCase().includes(q));if(r){mgo(r.lat,r.lng,17);return}
if(GM){try{const x=await new google.maps.Geocoder().geocode({address:q,region:'br'}),l=x.results[0].geometry.location;mgo(l.lat(),l.lng(),16)}catch(e){toast('Endereço não encontrado')}return}
if(MAPTILER_KEY){try{const j=await(await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${encodeURIComponent(MAPTILER_KEY)}&language=pt&country=br&limit=1&proximity=${MV.lng},${MV.lat}`)).json(),f=j.features&&j.features[0];if(f){mgo(f.center[1],f.center[0],16);return}toast('Endereço não encontrado');return}catch(e){}}
try{const c=new AbortController();setTimeout(()=>c.abort(),6000);const j=await(await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=pt-BR&q='+encodeURIComponent(q),{signal:c.signal})).json();
if(j[0])mgo(+j[0].lat,+j[0].lon,16);else toast('Endereço não encontrado')}catch(e){toast('Não foi possível buscar este endereço agora')}}
function initMap(){TL={};const m=$('#gmap'),P=new Map();let pd=0;{const a=$('.mattr');if(a&&MAPTILER_KEY)a.textContent='© MapTiler · © OpenStreetMap contributors'};
if(!MV.touched)mfit();if(MAPS_KEY&&!GMFAIL){gmInit(m);return}mdraw();
m.onpointerdown=e=>{P.set(e.pointerId,[e.clientX,e.clientY]);m.setPointerCapture(e.pointerId);if(P.size===2){const[a,b]=[...P.values()];pd=Math.hypot(a[0]-b[0],a[1]-b[1])}};
m.onpointermove=e=>{const o=P.get(e.pointerId);if(!o)return;const dx=e.clientX-o[0],dy=e.clientY-o[1];P.set(e.pointerId,[e.clientX,e.clientY]);
if(P.size===1){const z=MV.z;MV.lng=ux(wx(MV.lng,z)-dx,z);MV.lat=uy(wy(MV.lat,z)-dy,z);MV.touched=1;mdraw()}
else if(P.size===2){const[a,b]=[...P.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d/pd>1.5){setZ(1);pd=d}else if(d/pd<.67){setZ(-1);pd=d}}};
m.onpointerup=m.onpointercancel=e=>{P.delete(e.pointerId);pd=0};
m.onwheel=e=>{e.preventDefault();setZ(e.deltaY<0?1:-1)};m.ondblclick=()=>setZ(1);
if(!LOC&&!MV.geo&&navigator.geolocation){MV.geo=1;navigator.geolocation.getCurrentPosition(p=>{LOC={lat:p.coords.latitude,lng:p.coords.longitude};if(!MV.touched&&$('#gmap')){MV.lat=LOC.lat;MV.lng=LOC.lng;MV.z=15}mdraw()},()=>{},{timeout:8000})}}
function pick(i){const f=i.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,480/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);D.photo=c.toDataURL('image/jpeg',.6);D.at=Date.now();go('v-photo')};im.onerror=()=>toast('Não foi possível ler a imagem');im.src=rd.result};rd.readAsDataURL(f)}
function put(col,o){const a=S[col],i=a.findIndex(x=>x.id===o.id);i<0?a.unshift(o):a[i]=o;save();if(DB)DB.doc(col+'/'+o.id).set(o).catch(()=>toast('Sem permissão para gravar. Peça acesso ao responsável.'))}
function rm(col,id){save();if(DB)DB.doc(col+'/'+id).delete().catch(()=>toast('Sem permissão para excluir'))}
function submit(){const n=Date.now();put('reports',{id:n,uid:ME,by:NAME,addr:D.addr.trim(),cat:D.cat,desc:D.desc.trim(),photo:D.photo,x:D.x,y:D.y,lat:D.lat,lng:D.lng,acc:D.acc,stage:1,rej:false,t:[n,n+1000,null,null]});LAST=n;D=blank();go('v-confirm')}
const find=id=>S.reports.find(r=>r.id===id);
function advance(id){const r=find(id);if(!ADMIN||!r||r.rej||r.stage>=3)return;r.stage++;r.t[r.stage]=Date.now();put('reports',r);toast(r.stage===3?'Denúncia marcada como resolvida':'Status atualizado');go('v-detail')}
function reject(id){const r=find(id);if(!ADMIN||!r||r.stage>=3)return;r.rej=true;r.rejAt=Date.now();put('reports',r);toast('Denúncia rejeitada');go('v-detail')}
function del(id){const r=find(id);if(!r||!(ADMIN||mine(r)))return;if(delArm!==id){delArm=id;toast('Toque de novo para excluir');return}S.reports=S.reports.filter(x=>x.id!==id);rm('reports',id);toast('Denúncia excluída');go('v-list')}
function redeem(id){const p=S.sponsors.find(x=>x.id===id);if(!p)return;if(bal()<p.cost){toast('Pontos insuficientes');return}
const al='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',code=[...crypto.getRandomValues(new Uint8Array(6))].map(n=>al[n%al.length]).join('');
LASTR={id:Date.now(),uid:ME,sid:id,name:p.name+' — '+p.benefit,sname:p.name,benefit:p.benefit,cost:p.cost,code,at:Date.now()};put('redeems',LASTR);go('v-voucher')}
function claim(id,force){const m=MS().find(x=>x.id===id);if(!m||claimed(id))return;const[c,g]=m.p();if(!force&&c<g){toast('Missão ainda não concluída');return}
put('claims',{id:String(ME).replace(/[^\w-]/g,'')+'_'+id+'_'+today(),uid:ME,m:id,t:m.title,day:today(),v:m.pts,at:Date.now()});toast('+'+m.pts+' pontos!');go('v-points')}
async function invite(){const u=/^https?:/.test(location.href)?location.href.split('#')[0]:'',t='Conheça o Ecoponto! Denuncie problemas na sua cidade com foto e localização exata.';
try{if(navigator.share)await navigator.share({title:'Ecoponto',text:t,url:u||undefined});else{await navigator.clipboard.writeText(t+(u?' '+u:''));toast('Texto copiado. Cole para enviar a um amigo')}claim('d5',true)}catch(e){}}
function saveSp(){const n=(SP.name||'').trim(),b=(SP.benefit||'').trim(),c=parseInt(SP.cost,10);if(!ADMIN)return;if(!n||!b||!(c>0)){toast('Preencha nome, benefício e custo em pontos');return}
put('sponsors',{id:Date.now(),name:n,emoji:(SP.emoji||'').trim()||'🏪',desc:(SP.desc||'').trim(),benefit:b,cost:c});SP={};toast('Patrocinador adicionado');go('v-rewards')}
function delSp(id){if(!ADMIN)return;if(delArm!==id){delArm=id;toast('Toque de novo para excluir');return}S.sponsors=S.sponsors.filter(p=>p.id!==id);rm('sponsors',id);delArm=0;toast('Patrocinador removido');go('v-rewards')}
function tog(k){S[k]=!S[k];save();go('v-profile')}
const AFTER={'v-home':initMap,'v-loc':()=>{if(D.lat==null)locate();else fix({coords:{latitude:D.lat,longitude:D.lng,accuracy:D.acc}},true)},'v-photo':()=>{if(!D.photo)cam()}};

const V={
'v-home':()=>`<div class="mapfull" id="gmap"><div id="tiles"></div><div id="mpins"></div>
<div class="msearch"><span>🔎</span><input id="q" type="text" placeholder="Procurar um endereço" onkeydown="if(event.key==='Enter')msearch()" onpointerdown="event.stopPropagation()"><span class="iconbtn" onclick="go('v-profile')" onpointerdown="event.stopPropagation()">👤</span></div>
<div class="mctl" onpointerdown="event.stopPropagation()"><div class="iconbtn" onclick="setZ(1)">＋</div><div class="iconbtn" onclick="setZ(-1)">－</div><div class="iconbtn" onclick="mlocate()">🎯</div></div>
<div id="mnote">Não foi possível carregar as ruas (sem internet ou bloqueado neste ambiente). Baixe o arquivo e abra no navegador. Os pins continuam nas posições reais.</div><div class="mattr">© OpenStreetMap · © CARTO</div>
<div class="fab" onpointerdown="event.stopPropagation()" onclick="newReport()">+ Nova denúncia</div></div>${tabs('v-home')}`,
'v-new':()=>`${sb()}${tb('O que você encontrou?','v-home')}<div class="content"><p style="font-size:13px;color:var(--ink-soft);line-height:1.5;">Uma denúncia leva cerca de um minuto. Você pode revisar tudo antes de enviar.</p><div class="stack" style="margin-top:22px;"><button class="btn-primary" onclick="go('v-loc')">Começar denúncia</button><button class="btn-secondary" onclick="go('v-home')">Cancelar</button></div></div>`,
'v-loc':()=>`${sb()}${tb('Onde está o problema?','v-new')}${steps(1)}
<div class="content"><p class="helper" style="margin:4px 0 10px;line-height:1.5">Fique perto do local e permita o acesso à localização para registrar o ponto exato.</p>
<div class="card" id="gps">📡 Buscando sua localização exata…</div>
<div class="stack" style="margin:10px 0 0"><button class="btn-ghost" onclick="locate()">📍 Atualizar localização</button>${D.lat!=null?`<a class="btn-ghost" style="text-decoration:none" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${D.lat},${D.lng}">🗺️ Conferir no mapa</a>`:''}</div>
<div class="field-label">Endereço ou referência</div><input id="addr" type="text" placeholder="Rua, número, bairro ou ponto de referência" value="${esc(D.addr)}" oninput="D.addr=this.value">
<div class="stack"><button class="btn-primary" onclick="need(D.addr.trim(),'Informe o endereço ou uma referência','v-photo','#addr')">Usar esta localização</button></div></div>`,
'v-photo':()=>`${sb()}${tb('Mostre o local','v-loc')}${steps(2)}<div class="content"><input id="file" type="file" accept="image/*" hidden onchange="pick(this)"><input id="cam" type="file" accept="image/*" capture="environment" hidden onchange="pick(this)">
<div class="photobox" style="position:relative;overflow:hidden;${D.photo?`background:url(${D.photo}) center/cover;border-style:solid`:'padding:0'}">${D.photo?'':`<video id="vid" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover"></video><div id="pbph" style="display:none;flex-direction:column;align-items:center;gap:8px;padding:16px;text-align:center">📷<span>Câmera não disponível</span></div>`}</div>
<div class="helper" id="camerr" style="color:var(--error);min-height:16px"></div>
${D.photo?`<div class="stack"><button class="btn-primary" onclick="go('v-type')">Usar esta foto</button><button class="btn-ghost" onclick="D.photo=null;go('v-photo')">Refazer foto</button></div>`:`<div class="shutter" onclick="snap()"></div>
<div class="stack" style="margin-top:16px;"><button class="btn-ghost" onclick="flip()">🔄 Trocar câmera</button><button class="btn-ghost" onclick="$('#cam').click()">📷 Tirar foto pelo celular</button><button class="btn-ghost" onclick="$('#file').click()">🖼️ Escolher da galeria</button></div>`}</div>`,
'v-type':()=>`${sb()}${tb('O que é isso?','v-photo')}${steps(3)}<div class="content"><div class="catgrid">${CATS.map((c,i)=>`<div class="cat ${D.cat===i?'sel':''}" onclick="D.cat=${i};go('v-type')"><span class="ic">${c[0]}</span>${c[1]}</div>`).join('')}</div><button class="btn-primary" onclick="need(D.cat!==null,'Escolha um tipo','v-desc')">Continuar</button></div>`,
'v-desc':()=>`${sb()}${tb('Quer contar mais?','v-type')}${steps(4)}<div class="content"><div class="field-label">Descrição (opcional)</div>
<textarea rows="4" maxlength="140" placeholder="Ex.: Lixo acumulado há alguns dias na esquina..." oninput="D.desc=this.value;$('#cc').textContent=this.value.length+'/140 caracteres'">${esc(D.desc)}</textarea><div class="helper" id="cc">${D.desc.length}/140 caracteres</div>
<div class="stack" style="margin-top:20px;"><button class="btn-primary" onclick="go('v-review')">Continuar</button><button class="btn-ghost" onclick="D.desc='';go('v-review')">Pular esta etapa</button></div></div>`,
'v-review':()=>{const row=(ic,l,v,to,last)=>`<div class="review-row" ${last?'style="border-bottom:none"':''}>${ic}<div><div class="rlabel">${l}</div><div class="rval">${v}</div></div><div class="edit" onclick="go('${to}')">Editar</div></div>`;
return `${sb()}${tb('Confira sua denúncia','v-desc')}<div class="content">${row(`<div class="thumb" ${thumb(D)}></div>`,'Foto',D.photo?'1 imagem anexada':'Sem foto','v-photo')}${row('<div style="font-size:20px;">📍</div>','Local',esc(D.addr)+(D.lat!=null?`<div class="helper" style="margin:2px 0 0">${D.lat.toFixed(5)}, ${D.lng.toFixed(5)} · ±${D.acc} m</div>`:'<div class="helper" style="margin:2px 0 0">Sem coordenadas (endereço informado)</div>'),'v-loc')}${row('<div style="font-size:20px;">'+(CATS[D.cat]||CATS[5])[0]+'</div>','Tipo',(CATS[D.cat]||CATS[5])[1],'v-type')}${row('<div style="font-size:20px;">📝</div>','Descrição',D.desc.trim()?esc(D.desc):'—','v-desc',1)}<div class="stack"><button class="btn-primary" onclick="submit()">Enviar denúncia</button></div></div>`},
'v-confirm':()=>`${sb()}<div class="confirm-wrap"><div class="confirm-badge">✓</div><div style="font-size:17px;font-weight:800;">Denúncia enviada!</div><p style="font-size:13px;color:var(--ink-soft);margin:6px 0 0;">Obrigado por ajudar a manter a cidade limpa.</p><div class="protocol">Protocolo #${pid(LAST)}</div><div><span class="status-pill">Status: Em análise</span></div><div class="stack" style="width:100%;margin-top:26px;"><button class="btn-primary" onclick="openR(${LAST},'v-list')">Ver denúncia</button><button class="btn-secondary" onclick="go('v-home')">Voltar ao início</button></div></div>`,
'v-list':()=>{const L=S.reports.filter(r=>(ADMIN||mine(r))&&(F==='Todas'||status(r)===F.replace('Resolvidas','Resolvida').replace('Rejeitadas','Rejeitada')));
return `${sb()}${tb(ADMIN?'Todas as denúncias':'Minhas denúncias',null,`<span class="iconbtn" onclick="newReport()">+</span>`)}<div class="content"><div class="filterbar">${FL.map(f=>`<div class="filterchip ${F===f?'active':''}" onclick="F='${f}';go('v-list')">${f}</div>`).join('')}</div>
${L.map(r=>`<div class="report-item" onclick="openR(${r.id},'v-list')"><div class="thumb" ${thumb(r)}></div><div style="flex:1;"><div class="addr">${esc(r.addr)}</div><div class="meta">${CATS[r.cat][1]} · ${ago(r.t[0])}</div></div><span class="pill ${pcls(r)}">${status(r)}</span></div>`).join('')||'<p class="helper" style="text-align:center;margin-top:30px">Nenhuma denúncia aqui ainda.</p>'}</div>${tabs('v-list')}`},
'v-detail':()=>{const r=S.reports.find(r=>r.id===OPEN);if(!r)return V['v-list']();
const tl=ST.map((n,i)=>{const rj=i===3&&r.rej,t=rj?r.rejAt:r.t[i];return `<div class="tstep ${t?'done':''} ${rj?'rej':''}"><div class="dot"></div><div><div class="tt">${rj?'Rejeitada':n}</div><div class="td">${t?fmt(t):'aguardando'}</div></div></div>`}).join('');
return `${sb()}${tb('Detalhes',BACK)}<div class="content"><div class="photobox" style="height:170px;${r.photo?`background:url(${r.photo}) center/cover;border-style:solid`:''}">${r.photo?'':'📷'}</div>
<div class="field-label">Protocolo</div><div class="protocol" style="margin:0;">#${pid(r.id)}</div><div class="field-label">Endereço</div><div>${esc(r.addr)}</div>${r.lat!=null?`<div class="helper" style="margin:4px 0 0">${r.lat.toFixed(6)}, ${r.lng.toFixed(6)} · ±${r.acc} m · <a target="_blank" rel="noopener" style="color:var(--secondary);font-weight:700" href="https://www.google.com/maps?q=${r.lat},${r.lng}">ver no mapa</a></div>`:''}<div class="field-label">Tipo</div><div>${CATS[r.cat][0]} ${CATS[r.cat][1]}</div>
${r.desc?`<div class="field-label">Descrição</div><div style="font-size:13.5px">${esc(r.desc)}</div>`:''}<div class="field-label">Acompanhamento</div><div class="timeline">${tl}</div>
<div class="stack">${ADMIN&&!r.rej&&r.stage<3?`<button class="btn-primary" onclick="advance(${r.id})">Avançar para “${ST[r.stage+1]}”</button><button class="btn-ghost" onclick="reject(${r.id})">Rejeitar denúncia</button>`:''}${ADMIN||mine(r)?`<button class="btn-secondary" style="color:var(--error);border-color:var(--error)" onclick="del(${r.id})">Excluir denúncia</button>`:''}</div>`},
'v-login':()=>`${sb()}${tb('','v-home')}<div class="login-hero"><div class="mark">🌱</div><h2>Acompanhe suas denúncias</h2><p>Entre para ver status, pontos e recompensas.</p></div><div class="content"><div class="field-label">E-mail</div><input id="em" type="text" inputmode="email" placeholder="voce@exemplo.com" onkeydown="if(event.key==='Enter')login()"><div class="stack" style="margin-top:18px;"><button class="btn-primary" onclick="login()">Criar conta</button><button class="btn-secondary" onclick="login()">Já tenho conta</button><button class="btn-ghost" onclick="go('v-home')">Continuar sem cadastro</button></div></div>`,

'v-profile':()=>{const row=(l,r,f,last)=>`<div class="profile-row" ${last?'style="border-bottom:none"':''} onclick="${f}"><span>${l}</span><span class="chev">${r}</span></div>`,n=NAME||'Cidadão';
return `${sb()}${tb('Perfil')}<div class="content"><div class="avatar">${esc(n.slice(0,2).toUpperCase())}</div><div style="text-align:center;font-weight:700;font-size:14.5px;">${esc(n)}${isSup()?' 💚':''}</div><div style="text-align:center;font-size:12px;color:var(--ink-soft);margin-bottom:8px;">${ADMIN?'Administrador':'Cidadão'} · ${S.reports.filter(mine).length} denúncia(s) enviada(s)</div>
${row('Minhas denúncias','›',"go('v-list')")}${row('Pontos e recompensas','›',"go('v-points')")}${row(isSup()?'💚 Apoiador ativo':'💚 Seja apoiador','›',"go('v-support')")}${row('Área do patrocinador','›',"openPartner()")}${row('Notificações',S.notif?'Ativadas':'Desativadas',"tog('notif')")}${row('Acessibilidade · texto maior',S.big?'Ligado':'Desligado',"tog('big')",1)}</div>${tabs('v-profile')}`}
};
const mrow=m=>{const[c,g]=m.p(),cl=claimed(m.id),rdy=!cl&&!m.share&&c>=g;
return `<div class="ms ${cl?'done':''}"><div class="chk">${cl?'✓':''}</div><div style="flex:1;min-width:0"><div class="mt">${m.title}</div>${m.desc?`<div class="md">${m.desc}</div>`:''}${g>1&&!cl?`<div class="bar"><i style="width:${c/g*100}%"></i></div><div class="md">${c}/${g}</div>`:''}</div>${cl?`<span class="mp">+${m.pts} ✓</span>`:m.share?`<button class="mb" onclick="invite()">Compartilhar +${m.pts}</button>`:rdy?`<button class="mb" onclick="claim('${m.id}')">Receber +${m.pts}</button>`:`<span class="mp off">+${m.pts}</span>`}</div>`};
const inp=(l,k,ph,extra='')=>`<div class="field-label">${l}</div><input type="text" ${extra} placeholder="${ph}" value="${esc(SP[k]||'')}" oninput="SP.${k}=this.value">`;
Object.assign(V,{
'v-points':()=>{const b=bal(),M=MS(),dn=M.filter(m=>claimed(m.id)).length,L=ledger().reverse(),hl=Math.ceil((new Date().setHours(24,0,0,0)-Date.now())/36e5);return `${sb()}${tb('Pontos')}<div class="content"><div class="balance-card"><div class="lbl">Saldo</div><div class="val">${num(b)} pontos</div><div class="sub">${b>=1000?'Guardião do Bairro':b>=500?'Vigilante':'Iniciante'}</div></div>
<div class="field-label">Missões de hoje · ${dn} de ${M.length} concluídas</div><div class="md" style="margin-bottom:2px">Renovam todo dia à meia-noite (em ${hl} h)</div>${M.map(mrow).join('')}<div class="card" style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;gap:10px" onclick="go('v-support')"><span>💚 <b>${isSup()?'Você é apoiador':'Seja apoiador'}</b><br><span class="md">${isSup()?'Obrigado por manter o projeto!':'A partir de R$ 5,00 por mês + bônus diário'}</span></span><span class="edit">Ver</span></div>
<div class="field-label">Patrocinadores</div>${S.sponsors.length?`<div class="spstrip">${S.sponsors.map(p=>`<div class="spchip" onclick="go('v-rewards')">${esc(p.emoji||'🏪')} ${esc(p.name)}</div>`).join('')}</div>`:`<div class="md">${ADMIN?'Nenhum patrocinador cadastrado ainda.':'Em breve novos parceiros.'}</div>`}
<button class="btn-secondary" style="margin-top:10px;" onclick="go('v-rewards')">Ver patrocinadores e recompensas</button>
<div class="field-label">Histórico</div>${L.map((l,i,a)=>`<div class="ledger-row" ${i===a.length-1?'style="border-bottom:none"':''}><span>${esc(l.t)}</span><span class="plus" ${l.v<0?'style="color:var(--error)"':''}>${l.v>0?'+':''}${l.v}</span></div>`).join('')||'<div class="md">Nenhuma movimentação ainda.</div>'}</div>${tabs('v-points')}`},
'v-rewards':()=>{const b=bal();return `${sb()}${tb('Patrocinadores','v-points',ADMIN?`<span class="iconbtn" onclick="SP={};go('v-sponsor-new')">+</span>`:undefined)}<div class="content"><div class="helper" style="margin:0 0 10px">Seu saldo: <b>${num(b)} pontos</b>. Troque pontos por benefícios dos parceiros da cidade.</div>
${S.sponsors.map(p=>`<div class="sp"><div class="top"><div class="lg">${esc(p.emoji||'🏪')}</div><div style="flex:1;min-width:0"><div class="rt">${esc(p.name)}</div>${p.desc?`<div class="md">${esc(p.desc)}</div>`:''}</div>${ADMIN?`<span class="edit" onclick="delSp(${p.id})">Excluir</span>`:''}</div><div class="ben"><span>🎁 ${esc(p.benefit)}<br><b>${num(p.cost)} pontos</b></span><button style="${b<p.cost?'opacity:.5':''}" onclick="redeem(${p.id})">Resgatar</button></div></div>`).join('')||`<p class="helper" style="text-align:center;margin-top:30px">${ADMIN?'Nenhum patrocinador cadastrado. Toque em + para adicionar.':'Em breve teremos benefícios de patrocinadores por aqui.'}</p>`}<button class="btn-ghost" style="margin-top:10px" onclick="openPartner()">🏪 Sou patrocinador · Área do parceiro</button></div>`},
'v-sponsor-new':()=>`${sb()}${tb('Novo patrocinador','v-rewards')}<div class="content">${inp('Nome','name','Ex.: Padaria Central')}${inp('Ícone (emoji)','emoji','🏪','maxlength="4"')}${inp('Descrição (opcional)','desc','Ex.: Pães e cafés no centro')}${inp('Benefício oferecido','benefit','Ex.: 10% de desconto na compra')}${inp('Custo em pontos','cost','Ex.: 500','inputmode="numeric"')}<div class="stack"><button class="btn-primary" onclick="saveSp()">Salvar patrocinador</button></div></div>`,
'v-voucher':()=>`${sb()}<div class="confirm-wrap"><div class="confirm-badge">🎁</div><div style="font-size:17px;font-weight:800;">Recompensa resgatada!</div><p style="font-size:13px;color:var(--ink-soft);margin:6px 0 0;">${esc(LASTR.sname)} — ${esc(LASTR.benefit)}</p><div class="protocol" style="letter-spacing:3px;font-size:22px;">${LASTR.code}</div><p class="helper">Apresente este código ao patrocinador. Ele também fica no seu histórico de pontos.</p><div class="stack" style="width:100%;margin-top:22px;"><button class="btn-primary" onclick="go('v-points')">Voltar aos pontos</button></div></div>`
});
let AMT=10,PC='',PRR=null;
const amtL=()=>'Apoiar por '+brl(AMT>0?AMT:0)+'/mês';
function pledge(){const a=Math.round(AMT*100)/100;if(!(a>=5)){toast('O valor mínimo do apoio é R$ 5,00');return}if(a>10000){toast('Valor máximo: R$ 10.000,00');return}
put('pledges',{id:Date.now(),uid:ME,by:NAME,amount:a,status:'pendente',at:Date.now()});if(PAY_LINK)window.open(PAY_LINK,'_blank','noopener');
toast(PAY_LINK||PIX_KEY?'Conclua o pagamento para ativar seu apoio':'Apoio registrado. A administração enviará as instruções de pagamento');go('v-support')}
function endPledge(id){const p=S.pledges.find(x=>x.id===id);if(!p||!(mine(p)||ADMIN))return;p.status='cancelado';put('pledges',p);toast('Apoio cancelado. Se a cobrança for recorrente, cancele também no provedor de pagamento');go('v-support')}
function payOk(id,ok){if(!ADMIN)return;const p=S.pledges.find(x=>x.id===id);if(!p)return;
if(ok){S.pledges.filter(y=>y.uid===p.uid&&y.id!==p.id&&y.status==='ativo').forEach(y=>{y.status='encerrado';put('pledges',y)});p.status='ativo';p.paidAt=Date.now();p.until=Date.now()+30*864e5}else p.status='recusado';
put('pledges',p);toast(ok?'Pagamento confirmado':'Apoio recusado');go('v-support')}
function copyPix(){try{navigator.clipboard.writeText(PIX_KEY).then(()=>toast('Chave Pix copiada'),()=>toast('Copie a chave manualmente'))}catch(e){toast('Copie a chave manualmente')}}
function openPartner(){PC='';PRR=null;go('v-partner')}
function lookup(){PC=($('#pc').value||'').trim().toUpperCase();if(PC.length<6){toast('Digite o código de 6 caracteres');return}PRR=S.redeems.find(x=>x.code===PC)||'none';go('v-partner')}
function useCode(){const r=PRR;if(!r||r==='none'||r.used)return;r.used=true;r.usedAt=Date.now();put('redeems',r);toast('Baixa registrada');go('v-partner')}
Object.assign(V,{
'v-support':()=>{const p=sup(),act=isSup(),pend=p&&p.status==='pendente';let body;
const pay=`${PAY_LINK?`<button class="btn-primary" onclick="window.open(PAY_LINK,'_blank','noopener')">Ir para o pagamento</button>`:''}${PIX_KEY?`<div class="field-label">Chave Pix</div><div class="card" style="word-break:break-all">${esc(PIX_KEY)}</div><button class="btn-ghost" style="margin-top:8px" onclick="copyPix()">Copiar chave Pix</button>`:''}${!PAY_LINK&&!PIX_KEY?'<div class="md">O pagamento ainda não foi configurado neste app. A administração entrará em contato.</div>':''}`;
if(act)body=`<div class="card">💚 <b>Apoiador ativo</b><br><span class="md">${brl(p.amount)}/mês · válido até ${fmtd(p.until)}</span></div><div class="stack" style="margin-top:12px"><button class="btn-primary" onclick="AMT=${p.amount};pledge()">Renovar apoio</button><button class="btn-secondary" onclick="endPledge(${p.id})">Cancelar apoio</button></div>`;
else if(pend)body=`<div class="card">⏳ <b>Aguardando confirmação</b><br><span class="md">Apoio de ${brl(p.amount)}/mês registrado em ${fmtd(p.at)}. Quando o pagamento for confirmado, o selo de apoiador é ativado.</span></div><div class="stack" style="margin-top:12px">${pay}<button class="btn-secondary" onclick="endPledge(${p.id})">Cancelar apoio</button></div>`;
else body=`<div class="field-label">Escolha o valor mensal</div><div class="filterbar">${[5,10,20,50].map(v=>`<div class="filterchip ${AMT===v?'active':''}" onclick="AMT=${v};go('v-support')">R$ ${v}</div>`).join('')}</div>
<input type="text" inputmode="decimal" placeholder="Outro valor (mínimo R$ 5,00)" value="${[5,10,20,50].includes(AMT)?'':AMT}" oninput="AMT=parseFloat(this.value.replace(',','.'))||0;$('#pb').textContent=amtL()" style="margin-top:8px">
<div class="field-label">O que você ganha</div><div class="md" style="line-height:1.7;font-size:12.5px">💚 Selo de apoiador no seu perfil<br>⭐ Missão bônus diária de +10 pontos<br>🌱 Ajuda a manter a Ecoponto no ar</div>
<div class="stack" style="margin-top:14px"><button id="pb" class="btn-primary" onclick="pledge()">${amtL()}</button></div><p class="md" style="margin-top:8px">O pagamento é feito no provedor escolhido pela administração. O app não guarda dados de cartão.</p>`;
let adm='';if(ADMIN){const pn=S.pledges.filter(x=>x.status==='pendente').sort((a,b)=>a.at-b.at),ac=S.pledges.filter(x=>x.status==='ativo'&&x.until>Date.now());
adm=`<div class="field-label">Painel da administração</div><div class="card"><b>${ac.length}</b> apoiador(es) ativo(s) · <b>${brl(ac.reduce((a,x)=>a+x.amount,0))}</b>/mês</div>${pn.map(x=>`<div class="ledger-row" style="align-items:center;gap:8px"><span>${esc(x.by||'Cidadão')} · ${brl(x.amount)}<br><span class="md">${fmtd(x.at)} · pendente</span></span><span style="white-space:nowrap"><span class="edit" onclick="payOk(${x.id},true)">Confirmar</span> · <span class="edit" onclick="payOk(${x.id},false)" style="color:var(--error)">Recusar</span></span></div>`).join('')||'<div class="md" style="margin-top:8px">Nenhum pagamento pendente.</div>'}`}
return `${sb()}${tb('Seja apoiador','v-points')}<div class="content"><div class="balance-card"><div class="lbl">Apoio mensal</div><div class="val">💚 A partir de R$ 5</div><div class="sub">Sua contribuição mantém o projeto funcionando</div></div>${body}${adm}</div>`},
'v-partner':()=>{const r=PRR;let res='';
if(r==='none')res='<div class="card" style="border-color:var(--error);color:var(--error)">Código não encontrado.</div>';
else if(r)res=`<div class="sp"><div class="rt">${esc(r.sname||'')}</div><div class="md">🎁 ${esc(r.benefit||'')}</div><div class="md">Resgatado em ${fmtd(r.at)}</div><div style="margin-top:8px;font-weight:800;color:${r.used?'var(--ink-soft)':'var(--primary)'}">${r.used?'Já utilizado em '+fmtd(r.usedAt):'✓ Código válido'}</div>${r.used?'':'<button class="btn-primary" style="margin-top:10px" onclick="useCode()">Dar baixa (marcar como usado)</button>'}</div>`;
const st=S.sponsors.map(p=>{const rs=S.redeems.filter(x=>x.sid===p.id);return `<div class="ledger-row"><span>${esc(p.emoji||'🏪')} ${esc(p.name)}</span><span>${rs.length} resgates · ${rs.filter(x=>x.used).length} usados</span></div>`}).join('');
return `${sb()}${tb('Área do patrocinador','v-rewards')}<div class="content"><p class="helper" style="margin:0 0 8px;line-height:1.5">Confira o código apresentado pelo cliente e dê baixa para que não seja usado duas vezes.</p><div class="field-label">Código do cliente</div>
<input id="pc" type="text" maxlength="6" placeholder="Ex.: A1B2C3" style="text-transform:uppercase;letter-spacing:3px" value="${esc(PC)}" oninput="PC=this.value.toUpperCase()" onkeydown="if(event.key==='Enter')lookup()"><div class="stack" style="margin:12px 0"><button class="btn-primary" onclick="lookup()">Consultar código</button></div>${res}
${ADMIN?`<div class="field-label">Resumo por patrocinador</div>${st||'<div class="md">Nenhum patrocinador cadastrado.</div>'}`:''}${CONTACT_URL?'<button class="btn-ghost" style="margin-top:14px" onclick="window.open(CONTACT_URL,\'_blank\',\'noopener\')">Quero ser patrocinador</button>':'<div class="md" style="margin-top:14px">Quer ser patrocinador? Fale com a administração da Ecoponto.</div>'}</div>`}
});
render();
(async()=>{try{const[u,d]=await Promise.all([claude.use('user'),claude.use('db')]);
if(u){ME=(await u.id())||ME;NAME=(await u.me()).name||'';ADMIN=await u.canEdit()}
if(d){DB=d;S.reports=[];S.redeems=[];S.claims=[];S.sponsors=[];S.pledges=[];const live=()=>['v-home','v-list','v-detail','v-points','v-rewards','v-support','v-profile'].includes(cur)&&render();
d.collection('reports').onSnapshot(q=>{S.reports=q.docs.map(x=>x.data()).sort((a,b)=>b.id-a.id);live()},()=>toast('Sem acesso aos dados compartilhados'));
d.collection('redeems').onSnapshot(q=>{S.redeems=q.docs.map(x=>x.data());live()},()=>{});d.collection('claims').onSnapshot(q=>{S.claims=q.docs.map(x=>x.data());live()},()=>{});d.collection('pledges').onSnapshot(q=>{S.pledges=q.docs.map(x=>x.data());live()},()=>{});d.collection('sponsors').onSnapshot(q=>{S.sponsors=q.docs.map(x=>x.data()).sort((a,b)=>a.id-b.id);live()},()=>{})}
render()}catch(e){}})();
