self.addEventListener("install", e => {
 e.waitUntil(
  caches.open("discipline-cache").then(cache => {
   return cache.addAll([
    "/",
    "/index.html",
    "/app.js",
    "/ai.js",
    "/stats.js",
    "/sessions.js",
    "/strict.js"
   ]);
  })
 );
});
