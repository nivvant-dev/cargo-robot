// Temporary local static server for verification only.
const root = process.cwd();
Bun.serve({
  port: 4173,
  hostname: "127.0.0.1",
  async fetch(req) {
    const url = new URL(req.url);
    let path = decodeURIComponent(url.pathname);
    if (path === "/") path = "/index.html";
    if (path.includes("..")) return new Response("Forbidden", { status: 403 });
    const file = Bun.file(root + path);
    if (!(await file.exists())) return new Response("Not found", { status: 404 });
    return new Response(file);
  }
});
console.log("serving on http://127.0.0.1:4173");
