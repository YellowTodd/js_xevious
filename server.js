"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 8080);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

function getFilePath(url = "/") {
  const pathname = decodeURIComponent(url.split("?")[0]);
  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(root, relativePath));

  return filePath.startsWith(root) ? filePath : null;
}

http
  .createServer((req, res) => {
    if ((req.url || "/").split("?")[0] === "/") {
      res.writeHead(302, {
        "Cache-Control": "no-store",
        Location: "/x2/index.html",
      });
      res.end();
      return;
    }

    const filePath = getFilePath(req.url);

    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(error.code === "ENOENT" ? 404 : 500);
        res.end(error.code === "ENOENT" ? "Not found" : "Server error");
        return;
      }

      res.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      });
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log(`XEVIOUS is running at http://localhost:${port}`);
  });
