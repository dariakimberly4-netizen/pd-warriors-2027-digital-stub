const APP_KEY='pdw2027_offline_stub_v1';
const STAFF_KEY='pdw2027_staff';
const DEMO_PASS='PDW2027!';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const sampleAttendees=[
  {id:'PDW-0001',name:'Juan Dela Cruz',type:'PATIENT',linkedPatient:'',checkedIn:false,claims:{}},
  {id:'COM-0001-A',name:'Maria Dela Cruz',type:'COMPANION',linkedPatient:'PDW-0001',checkedIn:false,claims:{}},
  {id:'COM-0001-B',name:'Ana Dela Cruz',type:'COMPANION',linkedPatient:'PDW-0001',checkedIn:false,claims:{}},
  {id:'PDW-0002',name:'Liza Santos',type:'PATIENT',linkedPatient:'',checkedIn:false,claims:{}},
  {id:'COM-0002-A',name:'Mila Santos',type:'COMPANION',linkedPatient:'PDW-0002',checkedIn:false,claims:{}},
  {id:'PDW-0003',name:'Ramon Reyes',type:'PATIENT',linkedPatient:'',checkedIn:false,claims:{}}
];

function newState(){return{version:1,attendees:structuredClone(sampleAttendees),audit:[],raffleWinners:[],updatedAt:new Date().toISOString()}}
let state=loadState();
let current=null;
let staff=sessionStorage.getItem(STAFF_KEY)||'';
let scanStream=null,scanTimer=null;

function loadState(){try{const s=JSON.parse(localStorage.getItem(APP_KEY));return s&&Array.isArray(s.attendees)?s:newState()}catch{return newState()}}
function saveState(){state.updatedAt=new Date().toISOString();localStorage.setItem(APP_KEY,JSON.stringify(state));renderAll()}
function audit(action,attendeeId='',detail=''){state.audit.push({id:crypto.randomUUID?.()||String(Date.now()+Math.random()),action,attendeeId,detail,staff:staff||'UNKNOWN',device:navigator.userAgent.slice(0,80),time:new Date().toISOString()})}
function nowText(iso){return new Date(iso).toLocaleString()}
function cleanCode(v){return String(v||'').trim().toUpperCase().replace(/^PDW2027:/,'')}
function entitlements(a){return a.type==='PATIENT'?['SNACK','LUNCH','RAFFLE']:['SNACK','LUNCH']}
function byId(id){return state.attendees.find(a=>a.id===cleanCode(id))}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}

function showApp(){
  $('#loginView').classList.toggle('hidden',!!staff);
  $('#mainView').classList.toggle('hidden',!staff);
  if(staff){$('#staffBadge').textContent=`Staff: ${staff}`;renderAll()}
}

$('#loginForm').addEventListener('submit',e=>{e.preventDefault();const u=$('#username').value.trim();const p=$('#password').value;if(['Gen','Bot','Kim'].includes(u)&&p===DEMO_PASS){staff=u;sessionStorage.setItem(STAFF_KEY,staff);$('#loginError').textContent='';showApp()}else $('#loginError').textContent='Invalid demo account.'});
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{$('#username').value=b.dataset.demo;$('#password').value=DEMO_PASS;$('#loginForm').requestSubmit()}));
$('#logoutBtn').addEventListener('click',()=>{staff='';sessionStorage.removeItem(STAFF_KEY);current=null;showApp()});

function updateNetwork(){const online=navigator.onLine;$('#networkPill').textContent=online?'● Online — offline copy ready after install':'● Offline mode';$('#networkPill').style.background=online?'#edf4ef':'#f6ead0'}
addEventListener('online',updateNetwork);addEventListener('offline',updateNetwork);updateNetwork();

$$('.tab').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.view;$$('.tab').forEach(x=>x.classList.toggle('active',x===b));$$('.view-panel').forEach(x=>x.classList.add('hidden'));$('#'+v+'Panel').classList.remove('hidden');if(v==='raffle')renderRaffle();if(v==='backup')$('#backupMessage').textContent=''}));

function selectAttendee(a){
  current=a;
  if(!a.checkedIn){a.checkedIn=true;audit('CHECK_IN',a.id,'Checked in from claim/search screen');saveState()}
  $('#attendeeCard').classList.remove('hidden');
  $('#attendeeName').textContent=a.name;$('#attendeeId').textContent=a.id;$('#attendeeType').textContent=a.type==='PATIENT'?'PATIENT / PD WARRIOR':'COMPANION';
  renderClaimButtons();$('#claimMessage').textContent='';window.scrollTo({top:$('#attendeeCard').offsetTop-10,behavior:'smooth'});
}

function renderClaimButtons(){if(!current)return;const box=$('#claimButtons');box.innerHTML='';['SNACK','LUNCH','RAFFLE'].forEach(kind=>{const allowed=entitlements(current).includes(kind);const c=current.claims[kind];const b=document.createElement('button');b.className='claim-btn '+(!allowed?'blocked':c?'claimed':'');b.disabled=!allowed;b.innerHTML=`<span>${kind==='SNACK'?'🍪':kind==='LUNCH'?'🍱':'🎟'} ${kind}</span><small>${!allowed?'NOT ENTITLED':c?'CLAIMED · '+new Date(c.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'TAP TO CLAIM'}</small>`;if(allowed)b.addEventListener('click',()=>claim(kind));box.appendChild(b)})}

function claim(kind){if(!current)return;if(!entitlements(current).includes(kind)){message('Not entitled to '+kind,true);return}const old=current.claims[kind];if(old){$('#claimMessage').textContent=`⚠ ALREADY CLAIMED — ${nowText(old.time)} by ${old.staff}`;$('#claimMessage').style.color='var(--danger)';return}current.claims[kind]={time:new Date().toISOString(),staff};audit('CLAIM_'+kind,current.id,kind+' claimed');saveState();renderClaimButtons();$('#claimMessage').textContent=`✓ ${kind} CLAIM SUCCESSFUL — ${current.name}`;$('#claimMessage').style.color='var(--ok)'}
function message(t,bad=false){$('#claimMessage').textContent=t;$('#claimMessage').style.color=bad?'var(--danger)':'var(--ok)'}

function search(q){q=q.trim().toLowerCase();if(!q)return[];return state.attendees.filter(a=>a.name.toLowerCase().includes(q)||a.id.toLowerCase().includes(q)).slice(0,8)}
function renderSearchResults(list){const box=$('#searchResults');box.innerHTML='';if(!list.length){box.innerHTML='<p class="muted">No attendee found.</p>';return}list.forEach(a=>{const d=document.createElement('div');d.className='search-hit';d.innerHTML=`<div><strong>${escapeHtml(a.name)}</strong><br><small>${escapeHtml(a.id)} · ${a.type}</small></div><button class="primary">Open</button>`;d.querySelector('button').onclick=()=>selectAttendee(a);box.appendChild(d)})}
$('#quickSearchBtn').onclick=()=>renderSearchResults(search($('#quickSearch').value));$('#quickSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();renderSearchResults(search(e.target.value))}});
$('#manualBtn').onclick=()=>{const code=prompt('Enter attendee code (example PDW-0001):');if(code){const a=byId(code);a?selectAttendee(a):alert('Attendee not found')}};

function renderAttendeeList(){const q=($('#attendeeSearch')?.value||'').toLowerCase();const box=$('#attendeeList');if(!box)return;box.innerHTML='';state.attendees.filter(a=>!q||a.name.toLowerCase().includes(q)||a.id.toLowerCase().includes(q)).forEach(a=>{const d=document.createElement('div');d.className='attendee-row';const claims=Object.keys(a.claims||{}).join(', ')||'No claims';d.innerHTML=`<div><strong>${escapeHtml(a.name)}</strong><small>${a.id} · ${a.type}${a.linkedPatient?' · linked '+a.linkedPatient:''}<br>${a.checkedIn?'✓ Checked in':'Not checked in'} · ${escapeHtml(claims)}</small></div><div class="row-actions"><button class="secondary open">Open</button><button class="secondary pass">QR Pass</button></div>`;d.querySelector('.open').onclick=()=>{$$('.tab')[0].click();selectAttendee(a)};d.querySelector('.pass').onclick=()=>showPass(a);box.appendChild(d)})}
$('#attendeeSearch').addEventListener('input',renderAttendeeList);

function nextId(type,linked){if(type==='PATIENT'){const nums=state.attendees.filter(a=>a.type==='PATIENT').map(a=>parseInt(a.id.match(/\d+/)?.[0]||0));return'PDW-'+String(Math.max(0,...nums)+1).padStart(4,'0')}const base=linked?.match(/PDW-(\d+)/)?.[1]||String(state.attendees.filter(a=>a.type==='COMPANION').length+1).padStart(4,'0');const siblings=state.attendees.filter(a=>a.type==='COMPANION'&&a.id.startsWith('COM-'+base)).length;return'COM-'+base+'-'+String.fromCharCode(65+siblings)}
$('#addAttendeeBtn').onclick=()=>$('#attendeeDialog').showModal();$('#closeAttendeeDialog').onclick=()=>$('#attendeeDialog').close();
$('#attendeeForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#newName').value.trim(),type=$('#newType').value,linked=cleanCode($('#newLinkedPatient').value);if(!name)return;const a={id:nextId(type,linked),name,type,linkedPatient:type==='COMPANION'?linked:'',checkedIn:false,claims:{}};state.attendees.push(a);audit('ADD_ATTENDEE',a.id,a.name);saveState();e.target.reset();$('#attendeeDialog').close();showPass(a)});

function showPass(a){current=a;$('#passType').textContent=a.type==='PATIENT'?'PATIENT / PD WARRIOR':'COMPANION';$('#passName').textContent=a.name;$('#passId').textContent=a.id;$('#passEntitlements').innerHTML=entitlements(a).map(x=>`<span>✓ ${x}</span>`).join('');const q=$('#qrBox');q.innerHTML='';new QRCode(q,{text:'PDW2027:'+a.id,width:280,height:280,colorDark:'#111111',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});$('#passDialog').showModal()}
$('#showPassBtn').onclick=()=>current&&showPass(current);$('#closePassBtn').onclick=()=>$('#passDialog').close();
$('#downloadPassBtn').onclick=()=>{const canvas=$('#qrBox canvas');const img=$('#qrBox img');let src=canvas?.toDataURL('image/png')||img?.src;if(!src){alert('QR image is still preparing. Try again.');return}const a=document.createElement('a');a.href=src;a.download=(current?.id||'attendee')+'-QR.png';a.click()};

function renderStats(){const checked=state.attendees.filter(a=>a.checkedIn).length;const count=k=>state.attendees.filter(a=>a.claims?.[k]).length;$('#statPresent').textContent=checked;$('#statSnack').textContent=count('SNACK');$('#statLunch').textContent=count('LUNCH');$('#statRaffle').textContent=count('RAFFLE')}
function eligibleRaffle(){return state.attendees.filter(a=>a.type==='PATIENT'&&a.checkedIn)}
function renderRaffle(){const pool=eligibleRaffle();$('#raffleEligibleCount').textContent=pool.length;const box=$('#rafflePool');box.innerHTML='';pool.forEach(a=>{const d=document.createElement('div');d.className='attendee-row';d.innerHTML=`<div><strong>${escapeHtml(a.name)}</strong><small>${a.id}</small></div>`;box.appendChild(d)})}
$('#drawRaffleBtn').onclick=()=>{const pool=eligibleRaffle().filter(a=>!state.raffleWinners.some(w=>w.attendeeId===a.id));if(!pool.length){alert('No eligible unchecked winner available.');return}const a=pool[Math.floor(Math.random()*pool.length)];state.raffleWinners.push({attendeeId:a.id,name:a.name,time:new Date().toISOString(),staff});audit('RAFFLE_WINNER',a.id,a.name);saveState();const w=$('#raffleWinner');w.classList.remove('hidden');w.innerHTML=`<span>🎉 WINNER</span><strong>${escapeHtml(a.name)}</strong><small>${a.id}</small>`};

function downloadText(name,text,type='application/json'){const b=new Blob([text],{type});const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
$('#exportJsonBtn').onclick=()=>{audit('EXPORT_BACKUP','','Manual backup');saveState();downloadText('PDW2027-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(state,null,2));$('#backupMessage').textContent='✓ Backup exported.'};
$('#exportCsvBtn').onclick=()=>{const rows=[['Attendee ID','Name','Type','Checked In','Snack','Lunch','Raffle']];state.attendees.forEach(a=>rows.push([a.id,a.name,a.type,a.checkedIn?'YES':'NO',a.claims.SNACK?.time||'',a.claims.LUNCH?.time||'',a.claims.RAFFLE?.time||'']));const csv=rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');downloadText('PDW2027-claims.csv',csv,'text/csv');};
$('#importJsonInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const incoming=JSON.parse(await f.text());if(!Array.isArray(incoming.attendees))throw Error('Invalid backup');mergeState(incoming);audit('IMPORT_MERGE','','Merged '+f.name);saveState();$('#backupMessage').textContent='✓ Backup merged successfully.'}catch(err){$('#backupMessage').textContent='Import failed: '+err.message}finally{e.target.value=''}});
function mergeState(incoming){const map=new Map(state.attendees.map(a=>[a.id,a]));for(const b of incoming.attendees){const a=map.get(b.id);if(!a){state.attendees.push(b);map.set(b.id,b);continue}a.checkedIn=a.checkedIn||b.checkedIn;a.claims=a.claims||{};for(const k of ['SNACK','LUNCH','RAFFLE']){if(!a.claims[k]&&b.claims?.[k])a.claims[k]=b.claims[k];else if(a.claims[k]&&b.claims?.[k]&&new Date(b.claims[k].time)<new Date(a.claims[k].time))a.claims[k]=b.claims[k]}}
 const seen=new Set(state.audit.map(x=>x.id));for(const l of incoming.audit||[])if(!seen.has(l.id)){state.audit.push(l);seen.add(l.id)};const win=new Set(state.raffleWinners.map(w=>w.attendeeId));for(const w of incoming.raffleWinners||[])if(!win.has(w.attendeeId)){state.raffleWinners.push(w);win.add(w.attendeeId)}}
$('#resetDemoBtn').onclick=()=>{if(confirm('Reset all local data back to the demo masterlist?')){state=newState();current=null;saveState();$('#attendeeCard').classList.add('hidden');$('#backupMessage').textContent='Demo data restored.'}};

async function startScanner(){
  const dlg=$('#scanDialog'),video=$('#scannerVideo'),status=$('#scannerStatus');
  if(!('BarcodeDetector' in window)){status.textContent='This browser does not support camera QR detection. Use Enter Code or name search.';dlg.showModal();return}
  try{const formats=await BarcodeDetector.getSupportedFormats();if(!formats.includes('qr_code'))throw Error('QR detection unavailable');scanStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});video.srcObject=scanStream;await video.play();dlg.showModal();const detector=new BarcodeDetector({formats:['qr_code']});status.textContent='Point the camera at the attendee QR.';const tick=async()=>{if(!scanStream)return;try{const codes=await detector.detect(video);if(codes.length){const id=cleanCode(codes[0].rawValue);const a=byId(id);stopScanner();dlg.close();a?selectAttendee(a):alert('QR recognized, but attendee '+id+' is not in this device masterlist.')}}catch{}scanTimer=requestAnimationFrame(tick)};tick()}catch(err){status.textContent='Camera unavailable: '+err.message;dlg.showModal()}}
function stopScanner(){if(scanTimer)cancelAnimationFrame(scanTimer);scanTimer=null;if(scanStream){scanStream.getTracks().forEach(t=>t.stop());scanStream=null}$('#scannerVideo').srcObject=null}
$('#scanBtn').onclick=startScanner;$('#stopScanBtn').onclick=stopScanner;$('#scanDialog').addEventListener('close',stopScanner);

function renderAll(){renderStats();renderAttendeeList();renderRaffle();if(current){const refreshed=byId(current.id);if(refreshed){current=refreshed;renderClaimButtons()}}}

if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
showApp();renderAll();


function fitLoginToScreen(){
  const shell=document.querySelector('.login-shell');
  const view=document.querySelector('#loginView');
  if(!shell||!view||window.innerWidth>800) return;
  shell.style.setProperty('--fit-scale','1');
  requestAnimationFrame(()=>{
    const available=window.innerHeight-4;
    const needed=shell.scrollHeight;
    let scale=Math.min(1,available/needed);
    scale=Math.max(.72,scale);
    shell.style.setProperty('--fit-scale',String(scale));
  });
}
window.addEventListener('resize',fitLoginToScreen);
window.addEventListener('orientationchange',()=>setTimeout(fitLoginToScreen,120));
window.addEventListener('load',fitLoginToScreen);
setTimeout(fitLoginToScreen,60);
