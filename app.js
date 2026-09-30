const APP_KEY='pdw2027_offline_stub_v1';
const STAFF_KEY='pdw2027_staff';
const DEMO_PASS='PDW2027!';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];


const CURRENT_DRAFT_ROWS=[
  {n:'1',patient:'Dionne Jane Silvestre-Ali',nickname:'Dona',patientCount:1,companionCount:3,companions:'Chelsy Ali - Chelsy - 6\nAntonio Silvestre - Tony 66\nHope Silvestre - Hope - 67',confirmed:'DONA / TONY, HOPE, CHELSY'},
  {n:'2',patient:'Mark Angelo Rapiz',nickname:'Mark',patientCount:1,companionCount:2,companions:"Sarah Jane Rapiz - zhara - 41\nJean' Marko Rapiz - JM - 18",confirmed:'MARK / ZHARA, JM'},
  {n:'3',patient:'Maria corazon ocumen',nickname:'Bobot',patientCount:1,companionCount:4,companions:'Driver kuyan Rowell Tablang\nCaregiver- Daisy\nFriend- annie Preligera\nNeri Vega',confirmed:'BOBOT / ROWELL, DAISY, ANNIE, NERI'},
  {n:'4',patient:'Pauline Regidor',nickname:'Paulette',patientCount:1,companionCount:0,companions:'na'},
  {n:'5',patient:'ANNA MAUREEN PEDRACIO',nickname:'Anne',patientCount:1,companionCount:0,companions:'None'},
  {n:'6',patient:'Jocelyn C.Fiesta',nickname:'Jo',patientCount:1,companionCount:1,companions:'Joy F. Apolinario - Joy - 44'},
  {n:'7',patient:'Gina Robles Bautista',nickname:'Gina',patientCount:1,companionCount:1,companions:'Angelyn Bautista - Angel - 35'},
  {n:'8',patient:'Lourelyne M. Ballester',nickname:'Loury',patientCount:1,companionCount:1,companions:'David Lance Jireh Ballester - 23'},
  {n:'9',patient:'Noel laureano',nickname:'Neil',patientCount:1,companionCount:0,companions:'Wala'},
  {n:'10',patient:'Maria Marasigan',nickname:'Maria',patientCount:1,companionCount:1,companions:'Edgard Marasigan - 62'},
  {n:'11',patient:'Alaine Gonzales',nickname:'Lhain',patientCount:1,companionCount:0,companions:'Laura Quinto - 76 yrs old'},
  {n:'12',patient:'Victoria Villanueva',nickname:'Vicky',patientCount:1,companionCount:2,companions:'Michelle Villanueva - Mitch - 38\nLonilyn Rivero - Lyn - 22'},
  {n:'13',patient:'Erwin O. Bongalos',nickname:'Win',patientCount:1,companionCount:0,companions:'N/A'},
  {n:'15',patient:'Gloria V. Francisco',nickname:'Gloria',patientCount:0,companionCount:2,companions:'Jonathan, R.N 45\nKatrina, R.N. 40'},
  {n:'16',patient:'Gemma Tolentino',nickname:'Gem',patientCount:1,companionCount:2,companions:'Mr. & Mrs. Francisco & Lanie William'},
  {n:'17',patient:'Arsenio Umbal',nickname:'Senyong',patientCount:0,companionCount:1,companions:'Jubeth Umbal- jubeth-43'},
  {n:'18',patient:'nadine segovia',nickname:'nadine',patientCount:1,companionCount:0,companions:'na'},
  {n:'19',patient:'Glenn Janda',nickname:'Glenn',patientCount:1,companionCount:1,companions:'Hailie Amber Janda - 21'},
  {n:'20',patient:'Maria Nancy Lasangre',nickname:'Nancy',patientCount:1,companionCount:1,companions:'Eduardo Lasangre Jr'},
  {n:'21',patient:'Gloria Riveza',nickname:'Rica',patientCount:1,companionCount:1,companions:'Rica Riveza - 31'},
  {n:'22',patient:'Nieves Cabrera',nickname:'Eves',patientCount:0,companionCount:1,companions:'Gen Cabrera 48'},
  {n:'23',patient:'RONALDO M. FABIAN',nickname:'Ronald',patientCount:1,companionCount:1,companions:'Thess 56'},
  {n:'24',patient:'Ma. Lolita C. Baltazar',nickname:'Lolit',patientCount:1,companionCount:2,companions:'Cirilo Baltazar- 65\nNelia Santileses-58'},
  {n:'25',patient:'Edgar Dimailig',nickname:'Ed',patientCount:1,companionCount:0,companions:'NA'},
  {n:'26',patient:'Felicito Evardome',nickname:'Felix',patientCount:1,companionCount:1,companions:'Celia56,Marissa 36'},
  {n:'27',patient:'Kimberly Daria',nickname:'Kaye',patientCount:1,companionCount:2,companions:'Jasmin Daria 70\nAllyssa Pagaragan 17\nMom and dad',confirmed:'KAYE / JASMIN, ALLYSSA'},
  {n:'28',patient:'Emmanuel Elias Tomagos',nickname:'Manny',patientCount:1,companionCount:0,companions:'None'},
  {n:'29',patient:'Webster del crispino',nickname:'Randy',patientCount:0,companionCount:1,companions:'Mercy del crispino 55'},
  {n:'30',patient:'Carina M Espora',nickname:'Carie or Kare',patientCount:1,companionCount:1,companions:'Jambihlds M. Bachini - JB\n29'}
];

function normName(v){return String(v||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function countVal(v){const m=String(v??'').match(/\d+/);return m?Number(m[0]):0}
function cleanCompanionName(v){
  let s=String(v||'').trim().replace(/\s+/g,' ');
  s=s.replace(/^(driver\s+kuya[n]?\s*|driver\s*[-:]?\s*|caregiver\s*[-:]?\s*|friend\s*[-:]?\s*)/i,'');
  if(/\s+-\s+/.test(s))s=s.split(/\s+-\s+/)[0].trim();
  s=s.replace(/\s*[-–]?\s*\d+\s*(?:yrs?\.?|years?\s*old|yo|y\/o)?\s*$/i,'').trim();
  return s;
}
function companionNamesForRow(r){
  const count=countVal(r.companionCount);
  const raw=String(r.companions||'').trim();
  const empty=/^(none|na|n\/a|wala|0|-)?$/i.test(raw);
  let review=false;
  if(count===0)return {names:[],review:!empty&&!!raw};
  let chunks=empty?[]:raw.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  chunks=chunks.filter(x=>!/^(mom and dad|none|na|n\/a|wala)$/i.test(x));
  if(chunks.length===1&&chunks[0].includes(',')&&!/mr\.\s*&\s*mrs\./i.test(chunks[0])){
    const parts=chunks[0].split(',').map(x=>x.trim()).filter(Boolean);
    if(parts.length>1){chunks=parts;review=true}
  }
  let names=chunks.map(cleanCompanionName).filter(Boolean);
  if(names.length!==count)review=true;
  if(names.length>count)names=names.slice(0,count);
  while(names.length<count)names.push('Companion '+(names.length+1)+' of '+String(r.patient||'Registrant').trim());
  return {names,review};
}
function draftRowsToAttendees(rows){
  const out=[];
  rows.forEach((r,i)=>{
    const base=String(parseInt(r.n,10)||i+1).padStart(4,'0');
    const familyKey='F:'+normName(r.patient);
    const patientCount=countVal(r.patientCount);
    const comp=companionNamesForRow(r);
    if(patientCount>0){
      out.push({
        id:'PDW-'+base,name:String(r.patient||'').trim(),nickname:String(r.nickname||'').trim(),
        type:'PATIENT',linkedPatient:'',checkedIn:false,claims:{},
        source:'DRAFT_MASTERLIST',sourceKey:'P:'+normName(r.patient),familyKey,
        draftStatus:'ACTIVE',needsReview:comp.review
      });
    }
    comp.names.forEach((name,j)=>{
      out.push({
        id:'COM-'+base+'-'+String.fromCharCode(65+j),name,type:'COMPANION',
        linkedPatient:patientCount>0?'PDW-'+base:'',checkedIn:false,claims:{},
        source:'DRAFT_MASTERLIST',sourceKey:'C:'+normName(r.patient)+':'+normName(name),
        familyKey,draftStatus:'ACTIVE',needsReview:comp.review
      });
    });
  });
  return out;
}
const sampleAttendees=draftRowsToAttendees(CURRENT_DRAFT_ROWS);

function newState(){return{version:2,attendees:structuredClone(sampleAttendees),audit:[],raffleWinners:[],masterlist:{status:'DRAFT',source:'Built-in Sheet1 snapshot',importedAt:null},updatedAt:new Date().toISOString()}}
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
function isMasterlistFinalized(){return state?.masterlist?.status==='FINAL'}
function qrReleaseAllowed(){return isMasterlistFinalized()}
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

$$('.tab').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.view;$$('.tab').forEach(x=>x.classList.toggle('active',x===b));$$('.view-panel').forEach(x=>x.classList.add('hidden'));$('#'+v+'Panel').classList.remove('hidden');if(v==='raffle')renderRaffle();if(v==='masterlist')renderMasterlist();if(v==='backup')$('#backupMessage').textContent=''}));

function selectAttendee(a){
  if(a?.draftStatus==='REMOVED'||a?.inactive){alert('This attendee is inactive in the current draft masterlist.');return}
  current=a;
  if(!a.checkedIn){a.checkedIn=true;audit('CHECK_IN',a.id,'Checked in from claim/search screen');saveState()}
  $('#attendeeCard').classList.remove('hidden');
  $('#attendeeName').textContent=a.name;$('#attendeeId').textContent=a.id;$('#attendeeType').textContent=a.type==='PATIENT'?'PATIENT / PD WARRIOR':'COMPANION';
  renderClaimButtons();$('#claimMessage').textContent='';window.scrollTo({top:$('#attendeeCard').offsetTop-10,behavior:'smooth'});
}

function renderClaimButtons(){if(!current)return;const box=$('#claimButtons');box.innerHTML='';['SNACK','LUNCH','RAFFLE'].forEach(kind=>{const allowed=entitlements(current).includes(kind);const c=current.claims[kind];const b=document.createElement('button');b.className='claim-btn '+(!allowed?'blocked':c?'claimed':'');b.disabled=!allowed;b.innerHTML=`<span>${kind==='SNACK'?'🍪':kind==='LUNCH'?'🍱':'🎟'} ${kind}</span><small>${!allowed?'NOT ENTITLED':c?'CLAIMED · '+new Date(c.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'TAP TO CLAIM'}</small>`;if(allowed)b.addEventListener('click',()=>claim(kind));box.appendChild(b)})}

function claim(kind){if(!current)return;if(!entitlements(current).includes(kind)){message('Not entitled to '+kind,true);return}const old=current.claims[kind];if(old){$('#claimMessage').textContent=`⚠ ALREADY CLAIMED — ${nowText(old.time)} by ${old.staff}`;$('#claimMessage').style.color='var(--danger)';return}current.claims[kind]={time:new Date().toISOString(),staff};audit('CLAIM_'+kind,current.id,kind+' claimed');saveState();renderClaimButtons();$('#claimMessage').textContent=`✓ ${kind} CLAIM SUCCESSFUL — ${current.name}`;$('#claimMessage').style.color='var(--ok)'}
function message(t,bad=false){$('#claimMessage').textContent=t;$('#claimMessage').style.color=bad?'var(--danger)':'var(--ok)'}

function search(q){q=q.trim().toLowerCase();if(!q)return[];return state.attendees.filter(a=>a.draftStatus!=='REMOVED'&&!a.inactive&&(a.name.toLowerCase().includes(q)||a.id.toLowerCase().includes(q))).slice(0,8)}
function renderSearchResults(list){const box=$('#searchResults');box.innerHTML='';if(!list.length){box.innerHTML='<p class="muted">No attendee found.</p>';return}list.forEach(a=>{const d=document.createElement('div');d.className='search-hit';d.innerHTML=`<div><strong>${escapeHtml(a.name)}</strong><br><small>${escapeHtml(a.id)} · ${a.type}</small></div><button class="primary">Open</button>`;d.querySelector('button').onclick=()=>selectAttendee(a);box.appendChild(d)})}
$('#quickSearchBtn').onclick=()=>renderSearchResults(search($('#quickSearch').value));$('#quickSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();renderSearchResults(search(e.target.value))}});
$('#manualBtn').onclick=()=>{const code=prompt('Enter attendee code (example PDW-0001):');if(code){const a=byId(code);a?selectAttendee(a):alert('Attendee not found')}};

function renderAttendeeList(){const q=($('#attendeeSearch')?.value||'').toLowerCase();const box=$('#attendeeList');if(!box)return;box.innerHTML='';state.attendees.filter(a=>!q||a.name.toLowerCase().includes(q)||a.id.toLowerCase().includes(q)).forEach(a=>{const d=document.createElement('div');d.className='attendee-row';const claims=Object.keys(a.claims||{}).join(', ')||'No claims';d.innerHTML=`<div><strong>${escapeHtml(a.name)}</strong><small>${a.id} · ${a.type}${a.linkedPatient?' · linked '+a.linkedPatient:''}<br>${a.checkedIn?'✓ Checked in':'Not checked in'} · ${escapeHtml(claims)}</small></div><div class="row-actions"><button class="secondary open">Open</button><button class="secondary pass">QR Pass</button></div>`;d.querySelector('.open').onclick=()=>{$$('.tab')[0].click();selectAttendee(a)};d.querySelector('.pass').onclick=()=>showPass(a);box.appendChild(d)})}
$('#attendeeSearch').addEventListener('input',renderAttendeeList);

function nextId(type,linked){if(type==='PATIENT'){const nums=state.attendees.filter(a=>a.type==='PATIENT').map(a=>parseInt(a.id.match(/\d+/)?.[0]||0));return'PDW-'+String(Math.max(0,...nums)+1).padStart(4,'0')}const base=linked?.match(/PDW-(\d+)/)?.[1]||String(state.attendees.filter(a=>a.type==='COMPANION').length+1).padStart(4,'0');const siblings=state.attendees.filter(a=>a.type==='COMPANION'&&a.id.startsWith('COM-'+base)).length;return'COM-'+base+'-'+String.fromCharCode(65+siblings)}
$('#addAttendeeBtn').onclick=()=>$('#attendeeDialog').showModal();$('#closeAttendeeDialog').onclick=()=>$('#attendeeDialog').close();
$('#attendeeForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#newName').value.trim(),type=$('#newType').value,linked=cleanCode($('#newLinkedPatient').value);if(!name)return;const a={id:nextId(type,linked),name,type,linkedPatient:type==='COMPANION'?linked:'',checkedIn:false,claims:{}};state.attendees.push(a);audit('ADD_ATTENDEE',a.id,a.name);saveState();e.target.reset();$('#attendeeDialog').close();showPass(a)});



function qrDataUrlFor(attendee,size=320){
  return new Promise((resolve,reject)=>{
    try{
      const host=document.createElement('div');
      host.style.position='fixed';host.style.left='-99999px';host.style.top='-99999px';
      document.body.appendChild(host);
      new QRCode(host,{text:'PDW2027:'+attendee.id,width:size,height:size,colorDark:'#111111',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});
      setTimeout(()=>{
        try{
          const canvas=host.querySelector('canvas');
          const img=host.querySelector('img');
          const src=canvas?.toDataURL('image/png')||img?.src;
          host.remove();
          if(!src)throw Error('QR image was not generated.');
          resolve(src);
        }catch(e){host.remove();reject(e)}
      },80);
    }catch(e){reject(e)}
  });
}
async function dataUrlToFile(dataUrl,filename){
  const res=await fetch(dataUrl);
  const blob=await res.blob();
  return new File([blob],filename,{type:'image/png'});
}
function safeFilename(v){return String(v||'attendee').trim().replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').slice(0,80)}
async function saveQrPng(attendee){
  const src=await qrDataUrlFor(attendee);
  const a=document.createElement('a');
  a.href=src;
  a.download=safeFilename(attendee.id+' - '+attendee.name)+' - QR.png';
  document.body.appendChild(a);a.click();a.remove();
}

function showPass(a){current=a;const allowed=qrReleaseAllowed();$('#sharePassBtn').disabled=!allowed;$('#downloadPassBtn').disabled=!allowed;$('#sharePassBtn').textContent=allowed?'↗ SHARE QR':'🔒 SHARE QR';$('#downloadPassBtn').textContent=allowed?'⬇ SAVE QR AS PNG':'🔒 SAVE QR AS PNG';refreshNewFeatureHighlights();$('#passActionMessage').textContent=allowed?'':'QR release is locked while the masterlist is DRAFT.';$('#passType').textContent=a.type==='PATIENT'?'PATIENT / PD WARRIOR':'COMPANION';$('#passName').textContent=a.name;$('#passId').textContent=a.id;$('#passEntitlements').innerHTML=entitlements(a).map(x=>`<span>✓ ${x}</span>`).join('');const q=$('#qrBox');q.innerHTML='';new QRCode(q,{text:'PDW2027:'+a.id,width:280,height:280,colorDark:'#111111',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});$('#passDialog').showModal()}
$('#showPassBtn').onclick=()=>current&&showPass(current);$('#closePassBtn').onclick=()=>$('#passDialog').close();
$('#downloadPassBtn').onclick=async()=>{
  if(!current)return;
  if(!qrReleaseAllowed()){const msg=$('#passActionMessage');msg.textContent='QR release is locked until the masterlist is FINAL.';return}
  const msg=$('#passActionMessage');
  try{
    msg.textContent='Preparing QR image…';
    await saveQrPng(current);
    msg.textContent='✓ QR saved as PNG.';
  }catch(err){
    msg.textContent='Could not save QR: '+err.message;
  }
};
$('#sharePassBtn').onclick=async()=>{
  if(!current)return;
  if(!qrReleaseAllowed()){const msg=$('#passActionMessage');msg.textContent='QR sharing is locked until the masterlist is FINAL.';return}
  const msg=$('#passActionMessage');
  try{
    msg.textContent='Preparing QR to share…';
    const src=await qrDataUrlFor(current);
    const file=await dataUrlToFile(src,safeFilename(current.id+' - '+current.name)+' - QR.png');
    const shareData={
      title:'GET TOGETHER 2027 — QR Pass',
      text:current.name+' — '+current.id+'\nPlease save this QR pass and show it at the event.',
      files:[file]
    };
    if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
      await navigator.share(shareData);
      msg.textContent='✓ Share sheet opened.';
    }else{
      await saveQrPng(current);
      msg.textContent='Sharing is not supported on this browser, so the QR was downloaded instead.';
    }
  }catch(err){
    if(err?.name==='AbortError')msg.textContent='Share cancelled.';
    else msg.textContent='Could not share QR: '+err.message;
  }
};

function renderStats(){const checked=state.attendees.filter(a=>a.checkedIn).length;const count=k=>state.attendees.filter(a=>a.claims?.[k]).length;$('#statPresent').textContent=checked;$('#statSnack').textContent=count('SNACK');$('#statLunch').textContent=count('LUNCH');$('#statRaffle').textContent=count('RAFFLE')}
function eligibleRaffle(){return state.attendees.filter(a=>a.type==='PATIENT'&&a.checkedIn&&a.draftStatus!=='REMOVED'&&!a.inactive)}
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

function renderAll(){renderStats();renderAttendeeList();renderRaffle();renderMasterlist();if(current){const refreshed=byId(current.id);if(refreshed){current=refreshed;renderClaimButtons()}}}

if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js?v=10',{updateViaCache:'none'}).catch(()=>{}));

const LEGACY_DEMO_IDS=new Set(['PDW-0001','COM-0001-A','COM-0001-B','PDW-0002','COM-0002-A','PDW-0003']);
const LEGACY_DEMO_NAMES=new Set(['juan dela cruz','maria dela cruz','ana dela cruz','liza santos','mila santos','ramon reyes']);

function nextFreeId(preferred,type,used){
  if(preferred&&!used.has(preferred)){used.add(preferred);return preferred}
  if(type==='PATIENT'){
    let n=1;while(used.has('PDW-'+String(n).padStart(4,'0')))n++;
    const id='PDW-'+String(n).padStart(4,'0');used.add(id);return id;
  }
  let n=1;
  while(used.has('COM-X'+String(n).padStart(4,'0')))n++;
  const id='COM-X'+String(n).padStart(4,'0');used.add(id);return id;
}
function samePersonKey(a){return a.type+'|'+normName(a.name)}
function summarizeDraft(list){
  const active=list.filter(a=>a.draftStatus!=='REMOVED'&&!a.inactive);
  return {
    patients:active.filter(a=>a.type==='PATIENT').length,
    companions:active.filter(a=>a.type==='COMPANION').length,
    total:active.length,
    review:active.filter(a=>a.needsReview).length
  };
}
function renderMasterlist(){
  const draft=sampleAttendees;
  const qrBtn=$('#downloadAllQrBtn');if(qrBtn){const final=isMasterlistFinalized();qrBtn.disabled=!final;qrBtn.textContent=final?'⬇ DOWNLOAD ALL QR PASSES':'🔒 DOWNLOAD ALL QR PASSES';refreshNewFeatureHighlights()}
  const s=summarizeDraft(draft);
  $('#draftPatients').textContent=s.patients;
  $('#draftCompanions').textContent=s.companions;
  $('#draftTotal').textContent=s.total;
  $('#draftReview').textContent=s.review;
  const q=($('#masterlistSearch')?.value||'').trim().toLowerCase();
  const box=$('#masterlistPreview');if(!box)return;
  box.innerHTML='';
  draft.filter(a=>!q||a.name.toLowerCase().includes(q)||a.id.toLowerCase().includes(q)).forEach(a=>{
    const d=document.createElement('div');d.className='attendee-row masterlist-row';
    d.innerHTML='<div><strong>'+escapeHtml(a.name)+'</strong><small>'+escapeHtml(a.id)+' · '+(a.type==='PATIENT'?'PATIENT / PD WARRIOR':'COMPANION')+(a.needsReview?' · ⚠ Needs review':'')+'</small></div><span class="draft-mini">DRAFT</span>';
    box.appendChild(d);
  });
}
$('#masterlistSearch')?.addEventListener('input',renderMasterlist);

function applyDraftAttendees(incoming,label='Updated draft'){
  const generated=structuredClone(incoming);
  const old=state.attendees||[];
  const oldBySource=new Map(old.filter(a=>a.sourceKey).map(a=>[a.sourceKey,a]));
  const oldByName=new Map(old.filter(a=>a.draftStatus!=='REMOVED').map(a=>[samePersonKey(a),a]));
  const used=new Set();
  const matchedOld=new Set();

  generated.forEach(g=>{
    const match=oldBySource.get(g.sourceKey)||oldByName.get(samePersonKey(g));
    if(match){
      matchedOld.add(match);
      g.id=match.id;
      g.checkedIn=!!match.checkedIn;
      g.claims=match.claims||{};
      if(match.qrReleased)g.qrReleased=match.qrReleased;
    }
    g.id=nextFreeId(g.id,g.type,used);
    g.draftStatus='ACTIVE';g.inactive=false;
  });

  const patientByFamily=new Map(generated.filter(a=>a.type==='PATIENT').map(a=>[a.familyKey,a.id]));
  generated.forEach(a=>{if(a.type==='COMPANION')a.linkedPatient=patientByFamily.get(a.familyKey)||''});

  const removed=old.filter(a=>a.source==='DRAFT_MASTERLIST'&&!matchedOld.has(a)&&!generated.some(g=>g.sourceKey===a.sourceKey))
    .map(a=>({...a,draftStatus:'REMOVED',inactive:true}));

  const manual=old.filter(a=>{
    if(a.source==='DRAFT_MASTERLIST')return false;
    if(LEGACY_DEMO_IDS.has(a.id)&&LEGACY_DEMO_NAMES.has(normName(a.name)))return false;
    return true;
  }).map(a=>{
    if(used.has(a.id))a={...a,id:nextFreeId('',a.type,used)};
    else used.add(a.id);
    return a;
  });

  state.attendees=[...generated,...removed,...manual];
  state.masterlist={status:'DRAFT',source:label,importedAt:new Date().toISOString(),activeCount:generated.length,removedCount:removed.length};
  audit('MASTERLIST_IMPORT','',label+' · '+generated.length+' active · '+removed.length+' removed');
  saveState();
  const s=summarizeDraft(generated);
  $('#masterlistMessage').textContent='✓ Draft applied: '+s.patients+' patients + '+s.companions+' companions = '+s.total+' active attendees. Existing matches kept their QR IDs.';
  $('#masterlistMessage').style.color='var(--ok)';
}
$('#applyDraftBtn')?.addEventListener('click',()=>{
  const s=summarizeDraft(sampleAttendees);
  if(confirm('Apply the current DRAFT masterlist?\\n\\n'+s.patients+' patients + '+s.companions+' companions = '+s.total+' attendees.\\n\\nThis is still editable later.'))applyDraftAttendees(sampleAttendees,'Current Google Sheet Sheet1 snapshot');
});

function parseCsv(text){
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){
      if(ch==='"'&&text[i+1]==='"'){cell+='"';i++}
      else if(ch==='"')quoted=false;
      else cell+=ch;
    }else{
      if(ch==='"')quoted=true;
      else if(ch===','){row.push(cell);cell=''}
      else if(ch==='\n'){row.push(cell);rows.push(row);row=[];cell=''}
      else if(ch!=='\r')cell+=ch;
    }
  }
  row.push(cell);if(row.some(x=>String(x).trim()))rows.push(row);
  return rows;
}
function csvToDraftRows(matrix){
  if(!matrix.length)return[];
  const header=matrix[0].map(x=>String(x||'').trim());
  const rawForm=header.some(x=>x.toUpperCase().includes("PATIENT'S FULL NAME"));
  if(rawForm){
    const idx=(needle)=>header.findIndex(h=>h.toLowerCase().includes(needle.toLowerCase()));
    const p=idx("patient's full name"),nick=idx('nickname'),who=idx('who will be participating'),cnt=idx('# of companions'),names=idx('name/s of companion');
    return matrix.slice(1).filter(r=>String(r[p]||'').trim()).map((r,i)=>({
      n:String(i+1),patient:r[p],nickname:nick>=0?r[nick]:'',patientCount:/\bpatient\b/i.test(String(r[who]||''))?1:0,
      companionCount:cnt>=0?countVal(r[cnt]):0,companions:names>=0?r[names]:''
    }));
  }
  return matrix.slice(1).filter(r=>String(r[1]||'').trim()).map((r,i)=>({
    n:String(r[0]||i+1),patient:r[1],nickname:r[2]||'',companions:r[6]||'',
    patientCount:countVal(r[7]),companionCount:countVal(r[8]),confirmed:r[11]||''
  }));
}


$('#downloadAllQrBtn')?.addEventListener('click',async()=>{
  const btn=$('#downloadAllQrBtn'),msg=$('#masterlistMessage');
  if(!qrReleaseAllowed()){msg.textContent='🔒 QR pass release is locked while the masterlist is DRAFT. Finalize the masterlist first.';msg.style.color='var(--danger)';return}
  const active=state.attendees.filter(a=>a.draftStatus!=='REMOVED'&&!a.inactive);
  if(!active.length){msg.textContent='No active attendees to download.';return}
  const ok=confirm('Download '+active.length+' QR passes?\\n\\nYour browser may ask permission to allow multiple downloads.');
  if(!ok)return;
  btn.disabled=true;
  const oldText=btn.textContent;
  let done=0,failed=0;
  try{
    for(let i=0;i<active.length;i++){
      const a=active[i];
      btn.textContent='DOWNLOADING '+(i+1)+' / '+active.length;
      try{
        await saveQrPng(a);
        done++;
      }catch{failed++}
      await new Promise(r=>setTimeout(r,180));
    }
    msg.textContent='✓ Downloaded '+done+' QR pass'+(done===1?'':'es')+(failed?' · '+failed+' failed':'')+'. If your phone blocked some files, allow multiple downloads and try again.';
    msg.style.color=failed?'var(--danger)':'var(--ok)';
  }finally{
    btn.disabled=false;
    btn.textContent=oldText;
  }
});

$('#masterlistCsvInput')?.addEventListener('change',async e=>{
  const f=e.target.files?.[0];if(!f)return;
  try{
    const rows=csvToDraftRows(parseCsv(await f.text()));
    if(!rows.length)throw Error('No masterlist rows found.');
    const attendees=draftRowsToAttendees(rows),s=summarizeDraft(attendees);
    const review=attendees.filter(a=>a.needsReview).length;
    const ok=confirm('Updated DRAFT found:\\n\\n'+s.patients+' patients\\n'+s.companions+' companions\\n'+s.total+' total\\n'+review+' records need review\\n\\nApply this updated draft?');
    if(ok)applyDraftAttendees(attendees,'Imported CSV: '+f.name);
    else{$('#masterlistMessage').textContent='Import cancelled. No attendee data was changed.';$('#masterlistMessage').style.color='var(--muted)'}
  }catch(err){
    $('#masterlistMessage').textContent='CSV import failed: '+err.message;
    $('#masterlistMessage').style.color='var(--danger)';
  }finally{e.target.value=''}
});



const NEW_FEATURE_SEEN_KEY='pdw2027_seen_features_v1';

function getSeenFeatures(){
  try{
    const v=JSON.parse(localStorage.getItem(NEW_FEATURE_SEEN_KEY)||'[]');
    return Array.isArray(v)?v:[];
  }catch{return[]}
}
function markFeatureSeen(key){
  if(!key)return;
  const seen=new Set(getSeenFeatures());
  seen.add(key);
  localStorage.setItem(NEW_FEATURE_SEEN_KEY,JSON.stringify([...seen]));
}
function refreshNewFeatureHighlights(){
  const seen=new Set(getSeenFeatures());
  document.querySelectorAll('[data-new-feature]').forEach(el=>{
    const key=el.dataset.newFeature;
    const isSeen=seen.has(key);
    const usable=!el.disabled && el.getAttribute('aria-disabled')!=='true';
    el.classList.toggle('new-feature-highlight',usable&&!isSeen);
  });
}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-new-feature]');
  if(!el || el.disabled || el.getAttribute('aria-disabled')==='true')return;
  markFeatureSeen(el.dataset.newFeature);
  el.classList.remove('new-feature-highlight');
});

showApp();renderAll();
refreshNewFeatureHighlights();


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
