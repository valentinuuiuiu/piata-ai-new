#!/usr/bin/env node
const http = require('http');
const PORT = process.env.PORT || 4100;
const server = http.createServer((req, res) => {
  if (req.url === '/chat/completions' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => body += c);
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const model = payload.model;
      if (model === 'nonexistent-model') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'nonexistent-model is not a valid model ID', code: 400 } }));
        return;
      }
      if (model === 'timeout-model') {
        // Intentionally delay response beyond typical timeout to simulate network timeout
        setTimeout(() => {
          if (!res.writableEnded) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ choices: [ { message: { content: 'Late reply' } } ] }));
          }
        }, 30000);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ choices: [ { message: { content: 'Mock reply for ' + model } } ] }));
    });
    return;
  }
  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, () => console.log('Mock OpenRouter server listening on', PORT));
