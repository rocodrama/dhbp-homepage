// 이 서비스 워커의 목적은 "설치 가능"을 만족시키는 것이지 오프라인 지원이 아니다.
// 이 앱은 화면 전부가 Firestore 실시간 구독이라 오프라인에서는 보여줄 게 없다.
//
// 그래서 캐시는 최소로 둔다. SPA 셸(index.html) 하나만 붙잡아서, 네트워크가 죽었을 때
// 흰 화면 대신 앱 틀이라도 뜨게 한다. 나머지 요청은 전부 그냥 통과시킨다.
//
// 캐싱을 넓히지 않는 이유: Firebase Hosting 에 배포해도 사용자가 옛 번들을 계속 보는
// 사고가 SPA + 서비스 워커 조합의 대표적인 실패다. network-first + skipWaiting 으로
// 배포가 다음 로드에 바로 반영되게 한다.

const SHELL = 'dhbp-shell-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.add('/')).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e

  // 문서 요청만 네트워크 우선 + 캐시 폴백. 항상 최신 index.html 을 받되,
  // 네트워크가 없으면 마지막으로 받아둔 셸을 준다.
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL).then((c) => c.put('/', copy))
          return res
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  // 그 외(번들·이미지·Firestore·인증)는 손대지 않는다. 캐시하면 배포가 안 먹거나
  // 인증 응답이 굳는다.
  e.respondWith(fetch(request))
})
