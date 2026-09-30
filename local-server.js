'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = Number(process.env.PDW_PORT || 8787);
const DATA_DIR = path.join(ROOT, 'local-data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const STATE_FILE = path.join(DATA_DIR, 'pdw2027-shared-state.json');
const MAX_BODY = 8 * 1024 * 1024;
const VALID_STAFF = new Set(['Gen','Bot','Kim','Registration','QR','Snack','Lunch','Raffle']);

fs.mkdirSync(BACKUP_DIR, { recursive: true });

let revision = 0;
let sharedState = null;
let lastBackupAt = 0;

function clone(v){ return v == null ? v : JSON.parse(JSON.stringify(v)); }
function iso(){ return new Date().toISOString(); }
function validState(v){ return !!v && Array.isArray(v.attendees); }
function cleanId(v){ return String(v || '').trim().toUpperCase().replace(/^PDW2027:/,''); }
function active(a){ return a && a.draftStatus !== 'REMOVED' && !a.inactive; }
function entitled(a, kind){
  if(!a) return false;
  if(a.type === 'PATIENT') return ['SNACK','LUNCH','RAFFLE'].includes(kind);
  return ['SNACK','LUNCH'].includes(kind);
}
function audit(action, attendeeId='', detail='', staff='UNKNOWN'){
  if(!sharedState) return;
  sharedState.audit = Array.isArray(sharedState.audit) ? sharedState.audit : [];
  sharedState.audit.push({
    id: crypto.randomUUID(),
    action,
    attendeeId,
    detail,
    staff: VALID_STAFF.has(staff) ? staff : 'UNKNOWN',
    device: 'LOCAL_SERVER',
    time: iso()
  });
}
function sanitizeClaims(a){
  a.claims = a.claims && typeof a.claims === 'object' ? a.claims : {};
  if(a.type !== 'PATIENT') delete a.claims.RAFFLE;
  return a;
}
function sanitizeState(v){
  const s = clone(v);
  if(!validState(s)) throw new Error('Invalid state');
  s.version = Number(s.version || 2);
  s.attendees = s.attendees.filter(a=>a && a.id && a.name).map(a=>sanitizeClaims(a));
  s.audit = Array.isArray(s.audit) ? s.audit : [];
  s.raffleWinners = Array.isArray(s.raffleWinners) ? s.raffleWinners : [];
  s.masterlist = s.masterlist && typeof s.masterlist === 'object' ? s.masterlist : {status:'DRAFT'};
  s.updatedAt = iso();
  return s;
}
function newestTime(obj){
  if(!obj) return 0;
  const vals=[obj._updatedAt,obj.updatedAt,obj.finalizedAt,obj.reopenedAt,obj.importedAt].filter(Boolean);
  return Math.max(0,...vals.map(v=>Date.parse(v)||0));
}
function mergeStates(base, incoming){
  if(!validState(base)) return sanitizeState(incoming);
  if(!validState(incoming)) return sanitizeState(base);

  const out = clone(base);
  out.audit = Array.isArray(out.audit) ? out.audit : [];
  out.raffleWinners = Array.isArray(out.raffleWinners) ? out.raffleWinners : [];
  const map = new Map(out.attendees.map(a=>[a.id,a]));

  for(const raw of incoming.attendees){
    if(!raw || !raw.id) continue;
    const b = sanitizeClaims(clone(raw));
    const a = map.get(b.id);
    if(!a){
      out.attendees.push(b);
      map.set(b.id,b);
      continue;
    }

    a.checkedIn = !!(a.checkedIn || b.checkedIn);
    a.claims = a.claims || {};
    for(const kind of ['SNACK','LUNCH','RAFFLE']){
      if(!a.claims[kind] && b.claims && b.claims[kind] && entitled(a,kind)){
        a.claims[kind] = clone(b.claims[kind]);
      }
    }

    const aEdit = Date.parse(a.recordUpdatedAt || 0) || 0;
    const bEdit = Date.parse(b.recordUpdatedAt || 0) || 0;
    if(bEdit > aEdit){
      const fields=['name','type','linkedPatient','source','sourceKey','familyKey','registrantName','draftStatus','inactive','needsReview','recordUpdatedAt','qrReleased'];
      for(const f of fields) if(Object.prototype.hasOwnProperty.call(b,f)) a[f]=clone(b[f]);
      sanitizeClaims(a);
    }
  }

  const seenAudit = new Set(out.audit.map(x=>x.id));
  for(const row of incoming.audit || []){
    if(row && row.id && !seenAudit.has(row.id)){
      out.audit.push(clone(row));
      seenAudit.add(row.id);
    }
  }

  const seenWinner = new Set(out.raffleWinners.map(w=>w.attendeeId+'|'+w.time));
  for(const w of incoming.raffleWinners || []){
    const key=(w?.attendeeId||'')+'|'+(w?.time||'');
    if(w?.attendeeId && !seenWinner.has(key)){
      const person=map.get(w.attendeeId);
      if(person?.type==='PATIENT'){
        out.raffleWinners.push(clone(w));
        seenWinner.add(key);
      }
    }
  }

  if(newestTime(incoming.masterlist) > newestTime(out.masterlist)){
    out.masterlist = clone(incoming.masterlist);
  }

  out.updatedAt = iso();
  return out;
}

function loadStore(){
  try{
    const data=JSON.parse(fs.readFileSync(STATE_FILE,'utf8'));
    if(validState(data.state)){
      sharedState=sanitizeState(data.state);
      revision=Number(data.revision||1);
    }else if(validState(data)){
      sharedState=sanitizeState(data);
      revision=1;
    }
  }catch{}
}
function persist(){
  if(!sharedState) return;
  sharedState.updatedAt = iso();
  revision++;
  const payload=JSON.stringify({revision,state:sharedState},null,2);
  const temp=STATE_FILE+'.tmp';
  fs.writeFileSync(temp,payload,'utf8');
  fs.renameSync(temp,STATE_FILE);

  const now=Date.now();
  if(now-lastBackupAt >= 60000){
    lastBackupAt=now;
    const stamp=new Date().toISOString().replace(/[:.]/g,'-');
    fs.writeFileSync(path.join(BACKUP_DIR,'pdw2027-'+stamp+'.json'),payload,'utf8');
    try{
      const files=fs.readdirSync(BACKUP_DIR).filter(x=>x.endsWith('.json')).sort();
      while(files.length>60){
        const f=files.shift();
        fs.unlinkSync(path.join(BACKUP_DIR,f));
      }
    }catch{}
  }
}
loadStore();

function findAttendee(id){ return sharedState?.attendees?.find(a=>a.id===cleanId(id)); }
function nextAttendeeId(type, linkedPatient=''){
  const list=sharedState?.attendees || [];
  if(type==='PATIENT'){
    let max=0;
    for(const a of list){
      const m=String(a.id||'').match(/^PDW-(\d+)$/);
      if(m) max=Math.max(max,Number(m[1]));
    }
    return 'PDW-'+String(max+1).padStart(4,'0');
  }
  const base=String(linkedPatient||'').match(/^PDW-(\d+)$/)?.[1];
  if(base){
    const used=new Set(list.map(a=>a.id));
    for(let i=0;i<26;i++){
      const id='COM-'+base+'-'+String.fromCharCode(65+i);
      if(!used.has(id)) return id;
    }
  }
  let n=1, id;
  const used=new Set(list.map(a=>a.id));
  do{id='COM-X'+String(n++).padStart(4,'0')}while(used.has(id));
  return id;
}

function action(body){
  if(!sharedState) return {ok:false,code:'NO_STATE',message:'Shared database has not been initialized.'};
  const staff=VALID_STAFF.has(body.staff) ? body.staff : 'UNKNOWN';
  const name=String(body.action||'').toUpperCase();

  if(name==='CHECK_IN'){
    const a=findAttendee(body.attendeeId);
    if(!a || !active(a)) return {ok:false,code:'NOT_FOUND',message:'Attendee not found.'};
    if(!a.checkedIn){
      a.checkedIn=true;
      audit('CHECK_IN',a.id,'Checked in through shared local server',staff);
      persist();
    }
    return {ok:true,state:sharedState,revision,attendeeId:a.id};
  }

  if(name==='CLAIM'){
    const a=findAttendee(body.attendeeId);
    const kind=String(body.kind||'').toUpperCase();
    if(!a || !active(a)) return {ok:false,code:'NOT_FOUND',message:'Attendee not found.'};
    if(!['SNACK','LUNCH','RAFFLE'].includes(kind)) return {ok:false,code:'BAD_CLAIM',message:'Invalid claim type.'};
    if(!entitled(a,kind)) return {ok:false,code:'NOT_ENTITLED',message:'This attendee is not entitled to '+kind+'.',state:sharedState,revision};
    a.claims=a.claims||{};
    if(a.claims[kind]){
      return {ok:false,code:'ALREADY_CLAIMED',message:'Already claimed.',claim:a.claims[kind],state:sharedState,revision};
    }
    a.claims[kind]={time:iso(),staff};
    audit('CLAIM_'+kind,a.id,kind+' claimed through shared local server',staff);
    persist();
    return {ok:true,state:sharedState,revision,attendeeId:a.id,claim:a.claims[kind]};
  }

  if(name==='ADD_ATTENDEE'){
    const p=body.attendee||{};
    const type=p.type==='COMPANION'?'COMPANION':'PATIENT';
    const attendee={
      id:nextAttendeeId(type,cleanId(p.linkedPatient)),
      name:String(p.name||'').trim(),
      type,
      linkedPatient:type==='COMPANION'?cleanId(p.linkedPatient):'',
      checkedIn:false,
      claims:{},
      source:'WALK_IN',
      draftStatus:'ACTIVE',
      inactive:false,
      recordUpdatedAt:iso()
    };
    if(!attendee.name) return {ok:false,code:'BAD_NAME',message:'Name is required.'};
    sharedState.attendees.push(attendee);
    audit('ADD_ATTENDEE',attendee.id,attendee.name,staff);
    persist();
    return {ok:true,state:sharedState,revision,attendeeId:attendee.id};
  }

  if(name==='EDIT_ATTENDEE'){
    const a=findAttendee(body.attendeeId);
    if(!a || !active(a)) return {ok:false,code:'NOT_FOUND',message:'Attendee not found.'};
    const p=body.patch||{};
    if(String(p.name||'').trim()) a.name=String(p.name).trim();
    if(p.type==='PATIENT'||p.type==='COMPANION') a.type=p.type;
    a.linkedPatient=a.type==='COMPANION'?cleanId(p.linkedPatient):'';
    a.recordUpdatedAt=iso();
    sanitizeClaims(a);
    audit('EDIT_ATTENDEE',a.id,'Attendee record edited through shared local server',staff);
    persist();
    return {ok:true,state:sharedState,revision,attendeeId:a.id};
  }

  if(name==='RAFFLE_DRAW'){
    const won=new Set((sharedState.raffleWinners||[]).map(w=>w.attendeeId));
    const pool=sharedState.attendees.filter(a=>active(a)&&a.type==='PATIENT'&&a.checkedIn&&!won.has(a.id));
    if(!pool.length) return {ok:false,code:'NO_ELIGIBLE',message:'No eligible unchecked winner available.',state:sharedState,revision};
    const winner=pool[crypto.randomInt(pool.length)];
    const row={attendeeId:winner.id,name:winner.name,time:iso(),staff};
    sharedState.raffleWinners.push(row);
    audit('RAFFLE_WINNER',winner.id,winner.name,staff);
    persist();
    return {ok:true,state:sharedState,revision,winner:row};
  }

  return {ok:false,code:'UNKNOWN_ACTION',message:'Unknown server action.'};
}

function sendJson(res,status,obj){
  const body=JSON.stringify(obj);
  res.writeHead(status,{
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Headers':'Content-Type'
  });
  res.end(body);
}
function readJson(req){
  return new Promise((resolve,reject)=>{
    let size=0, chunks=[];
    req.on('data',chunk=>{
      size+=chunk.length;
      if(size>MAX_BODY){reject(new Error('Request too large'));req.destroy();return}
      chunks.push(chunk);
    });
    req.on('end',()=>{
      try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'))}
      catch(e){reject(e)}
    });
    req.on('error',reject);
  });
}
const MIME={
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.ico':'image/x-icon','.webmanifest':'application/manifest+json'
};
function serveStatic(req,res,urlPath){
  let rel=decodeURIComponent(urlPath.split('?')[0]);
  if(rel==='/'||rel==='') rel='/index.html';
  const target=path.resolve(ROOT,'.'+rel);
  if(!target.startsWith(ROOT)||target.startsWith(DATA_DIR)||target.includes(path.sep+'.git'+path.sep)){
    res.writeHead(403);res.end('Forbidden');return;
  }
  fs.stat(target,(err,st)=>{
    if(err||!st.isFile()){res.writeHead(404);res.end('Not found');return}
    res.writeHead(200,{
      'Content-Type':MIME[path.extname(target).toLowerCase()]||'application/octet-stream',
      'Cache-Control':'no-cache'
    });
    fs.createReadStream(target).pipe(res);
  });
}

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  try{
    if(req.method==='OPTIONS'){
      res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});
      res.end();return;
    }
    if(url.pathname==='/api/health'&&req.method==='GET'){
      sendJson(res,200,{ok:true,mode:'PDW2027_LOCAL_SERVER',revision,hasState:!!sharedState,time:iso()});return;
    }
    if(url.pathname==='/api/state'&&req.method==='GET'){
      sendJson(res,200,{ok:true,empty:!sharedState,revision,state:sharedState});return;
    }
    if(url.pathname==='/api/bootstrap'&&req.method==='POST'){
      const body=await readJson(req);
      if(!sharedState){
        sharedState=sanitizeState(body.state);
        audit('SERVER_BOOTSTRAP','','Shared database initialized',body.staff);
        persist();
      }
      sendJson(res,200,{ok:true,revision,state:sharedState});return;
    }
    if(url.pathname==='/api/sync'&&req.method==='POST'){
      const body=await readJson(req);
      if(!sharedState) sharedState=sanitizeState(body.state);
      else sharedState=mergeStates(sharedState,body.state);
      audit('SERVER_SYNC','',String(body.reason||'Client sync'),body.staff);
      persist();
      sendJson(res,200,{ok:true,revision,state:sharedState});return;
    }
    if(url.pathname==='/api/action'&&req.method==='POST'){
      const body=await readJson(req);
      const result=action(body);
      sendJson(res,200,result);return;
    }
    if(url.pathname==='/api/export'&&req.method==='GET'){
      sendJson(res,200,{ok:true,revision,state:sharedState});return;
    }
    serveStatic(req,res,url.pathname);
  }catch(err){
    sendJson(res,500,{ok:false,message:err.message});
  }
});

server.listen(PORT,'0.0.0.0',()=>{
  const urls=[];
  for(const group of Object.values(os.networkInterfaces())){
    for(const net of group||[]){
      if(net.family==='IPv4'&&!net.internal) urls.push('http://'+net.address+':'+PORT);
    }
  }
  console.log('');
  console.log('============================================================');
  console.log(' PD WARRIORS 2027 — SHARED LOCAL EVENT SERVER');
  console.log('============================================================');
  console.log('Keep this window OPEN during the event.');
  console.log('Laptop: http://localhost:'+PORT);
  console.log('');
  console.log('Staff phones can open:');
  if(urls.length) urls.forEach(u=>console.log('  '+u));
  else console.log('  Connect the laptop to the event hotspot/network, then restart.');
  console.log('');
  console.log('Internet/load is NOT required once all devices are on the');
  console.log('same local Wi-Fi/hotspot.');
  console.log('Shared data: '+STATE_FILE);
  console.log('Automatic backups: '+BACKUP_DIR);
  console.log('============================================================');
  console.log('');
});
