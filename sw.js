const CACHE='pdw2027-digital-stub-v6';
const LOCAL=['./','./index.html','./styles.css?v=6','./app.js?v=6','./manifest.json','./icon.svg'];
const QR_LIB='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await c.addAll(LOCAL);
    try{await c.add(QR_LIB)}catch{}
    self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k!==CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;

  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        const c=await caches.open(CACHE);
        c.put('./index.html',fresh.clone());
        return fresh;
      }catch{
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  if(req.url.includes('styles.css') || req.url.includes('app.js')){
    e.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        const c=await caches.open(CACHE);
        c.put(req,fresh.clone());
        return fresh;
      }catch{
        return caches.match(req);
      }
    })());
    return;
  }

  e.respondWith((async()=>{
    const cached=await caches.match(req);
    if(cached) return cached;
    try{
      const res=await fetch(req);
      const c=await caches.open(CACHE);
      c.put(req,res.clone());
      return res;
    }catch{
      throw new Error('offline');
    }
  })());
});