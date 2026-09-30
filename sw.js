const CACHE='pdw2027-digital-stub-v1';
const LOCAL=['./','./index.html','./styles.css','./app.js','./manifest.json','./icon.svg'];
const QR_LIB='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(LOCAL);try{await c.add(QR_LIB)}catch{}self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{e.respondWith((async()=>{const cached=await caches.match(e.request);if(cached)return cached;try{const res=await fetch(e.request);if(e.request.method==='GET'){const c=await caches.open(CACHE);c.put(e.request,res.clone())}return res}catch{if(e.request.mode==='navigate')return caches.match('./index.html');throw new Error('offline') }})())});
