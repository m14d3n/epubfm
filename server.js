#!/usr/bin/env node
/**
 * Zero-dependency local static server for Studio Audiobook Player (epubfm).
 * Mirrors GitHub Pages behavior locally, supporting ?book=<filename.epub|pdf|txt>
 * and providing a secure context (http://localhost) for Web Speech, PDF.js, and Web Audio APIs.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT_DIR = __dirname;
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8080;
const SHOULD_OPEN = process.argv.includes('--open') || process.argv.includes('-o');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.epub': 'application/epub+zip',
    '.pdf': 'application/pdf',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

function getBookFiles() {
    try {
        return fs.readdirSync(ROOT_DIR).filter(f => /\.(epub|pdf|txt)$/i.test(f));
    } catch {
        return [];
    }
}

function openBrowser(url) {
    const platform = process.platform;
    const cmd =
        platform === 'win32'
            ? `start "" "${url}"`
            : platform === 'darwin'
            ? `open "${url}"`
            : `xdg-open "${url}"`;
    exec(cmd, () => {});
}

const server = http.createServer((req, res) => {
    try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        let pathname = decodeURIComponent(parsedUrl.pathname);

        if (pathname === '/' || pathname === '') {
            pathname = '/index.html';
        }

        // Prevent directory traversal outside ROOT_DIR
        const safePath = path.normalize(path.join(ROOT_DIR, pathname));
        if (!safePath.startsWith(ROOT_DIR)) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('403 Forbidden');
            return;
        }

        fs.stat(safePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`404 Not Found: ${pathname}`);
                return;
            }

            const ext = path.extname(safePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            });

            const stream = fs.createReadStream(safePath);
            stream.on('error', () => {
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                }
                res.end('500 Internal Server Error');
            });
            stream.pipe(res);
        });
    } catch (e) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('400 Bad Request');
    }
});

function startServer(port) {
    server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });

    server.listen(port, '127.0.0.1', () => {
        const url = `http://localhost:${port}`;
        console.log('============================================================');
        console.log('  Studio Audiobook Player & MP3 Converter (Local Server)');
        console.log('============================================================');
        console.log(`  Local URL:   ${url}`);

        const books = getBookFiles();
        if (books.length > 0) {
            console.log('\n  Detected local books (auto-load via ?book= parameter):');
            books.forEach(book => {
                console.log(`    -> ${url}/?book=${encodeURIComponent(book)}`);
            });
        } else {
            console.log('\n  Tip: Place any .epub, .pdf, or .txt file in this folder');
            console.log(`       to auto-load via ${url}/?book=filename.epub`);
        }

        console.log('\n  Press Ctrl+C to stop the server.');
        console.log('============================================================');

        if (SHOULD_OPEN) {
            openBrowser(url);
        }
    });
}

startServer(DEFAULT_PORT);
