import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

try {
  if (fs.existsSync(".env")) process.loadEnvFile(".env");
  else if (fs.existsSync("../.env")) process.loadEnvFile("../.env");
} catch (e) {}

import stateHandler from "./api/state.mjs";
import adminHandler from "./api/admin.mjs";
import loginHandler from "./api/login.mjs";
import imgHandler from "./api/img.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg"
};

const server = http.createServer(async (req, res) => {
  // CORS & headers helper
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (obj) {
    this.setHeader("Content-Type", "application/json; charset=utf-8");
    this.end(JSON.stringify(obj));
  };
  res.send = function (data) {
    this.end(data);
  };

  const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = reqUrl.pathname;
  req.query = Object.fromEntries(reqUrl.searchParams.entries());

  // Handle API routes
  if (pathname.startsWith("/api/")) {
    // Read request body if needed
    let body = "";
    try {
      for await (const chunk of req) {
        body += chunk;
      }
      if (body) {
        try {
          req.body = JSON.parse(body);
        } catch {
          req.body = body;
        }
      } else {
        req.body = {};
      }
    } catch (e) {
      req.body = {};
    }

    try {
      if (pathname === "/api/state") {
        return await stateHandler(req, res);
      }
      if (pathname === "/api/admin") {
        return await adminHandler(req, res);
      }
      if (pathname === "/api/login") {
        return await loginHandler(req, res);
      }
      if (pathname === "/api/img") {
        return await imgHandler(req, res);
      }
      return res.status(404).json({ error: "Endpoint not found" });
    } catch (err) {
      console.error("[API Error]", err);
      return res.status(500).json({ error: String(err?.message || err) });
    }
  }

  // Handle redirects
  if (pathname === "/" || pathname === "/prompt2patch") {
    res.writeHead(302, { Location: "/prompt2patch/" });
    return res.end();
  }

  // Static file serving
  let relPath = pathname.replace(/^\/+/, "");
  let filePath = path.join(PUBLIC_DIR, relPath);

  // Directory index resolution
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const candidate = path.join(filePath, "index.html");
    if (fs.existsSync(candidate)) {
      filePath = candidate;
    }
  }

  // Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    return res.end("Forbidden");
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    return fs.createReadStream(filePath).pipe(res);
  }

  res.statusCode = 404;
  res.end("Not Found: " + pathname);
});

server.listen(PORT, () => {
  const pwd = process.env.ADMIN_PASSWORD || "admin123";
  console.log("\n========================================================");
  console.log("   🚀 Prompt2Patch Dashboard Server Running");
  console.log("========================================================");
  console.log(`   📺 Projector View:  http://localhost:${PORT}/prompt2patch/`);
  console.log(`   🛠️  Admin View:      http://localhost:${PORT}/prompt2patch/admin/`);
  console.log(`   🔑 Admin Password:  ${pwd}`);
  console.log("========================================================\n");
});
