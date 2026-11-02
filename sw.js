// 보컬트레이닝 시각화자료 — 오프라인 저장 (v44)
// - 설치(install) = 이 버전 파일을 통째로 저장(캐시 'vocal-v버전'). 저장이 끝나야 새 버전으로 바뀜(중간에 끊기면 이전 저장본 그대로)
// - 바뀜(activate) = 이전 버전 저장본을 모두 지우고, 열려 있는 화면에 '새 버전 저장됨'을 알림
// - 열기 = 저장본을 바로 엶(빠름·인터넷 없이도). 새 버전 확인은 페이지가 sw.js를 다시 확인해서(reg.update) 함
// - 다른 사이트 것(유튜브 썸네일·영상, 로그인)은 저장하지 않음(인터넷 필요)
const VER='61';
const CACHE='vocal-v'+VER;
const FILES=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
async function saveAll(){const c=await caches.open(CACHE);await c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})));}
async function info(){const c=await caches.open(CACHE);let n=0,bytes=0;for(const f of FILES){const r=await c.match(f);if(r){n++;bytes+=(await r.clone().blob()).size;}}return {t:'status',v:VER,n,all:FILES.length,bytes};}
async function tell(m){for(const cl of await self.clients.matchAll({includeUncontrolled:true}))cl.postMessage(m);}
self.addEventListener('install',e=>{e.waitUntil(saveAll().then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&(k.startsWith('vocal-'))).map(k=>caches.delete(k))))
  .then(()=>self.clients.claim()).then(()=>info()).then(s=>tell(Object.assign(s,{t:'ready'}))));});
self.addEventListener('message',e=>{const d=e.data||{};
  if(d.t=='status')e.waitUntil(info().then(s=>e.source.postMessage(s)));
  else if(d.t=='save')e.waitUntil(saveAll().then(info).then(s=>e.source.postMessage(Object.assign(s,{t:'saved'}))).catch(err=>e.source.postMessage({t:'error',m:String(err)})));});
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;const u=new URL(q.url);if(u.origin!==location.origin)return;
  if(q.mode==='navigate'){e.respondWith(caches.open(CACHE).then(c=>c.match('./index.html')).then(r=>r||fetch(q)));return;}
  e.respondWith(caches.match(q,{ignoreSearch:true}).then(r=>r||fetch(q)));});
