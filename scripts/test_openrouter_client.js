#!/usr/bin/env node
const http = require('http');
// Local copy of openRouterFetch for testing (avoid compiling TS during tests)
async function openRouterFetch(url, opts = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, ...opts });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if (err?.name === 'AbortError') {
      const e = new Error('OpenRouter request timed out');
      e.code = 'ETIMEDOUT';
      throw e;
    }
    throw err;
  }
}

const PORT = 4100;
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
        // don't respond to simulate a timeout
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

server.listen(PORT, async () => {
  console.log('Mock OpenRouter listening on', PORT);

  try {
    // success case
    const okResp = await openRouterFetch('http://localhost:4100/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'x-ai/grok-4-fast', messages: [] }),
    }, 5000);
    console.log('okResp', okResp.status);

    // bad model
    const badResp = await openRouterFetch('http://localhost:4100/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nonexistent-model', messages: [] }),
    }, 5000);
    console.log('badResp', badResp.status, await badResp.text());

    // timeout
    try {
      await openRouterFetch('http://localhost:4100/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'timeout-model', messages: [] }),
      }, 1000);
      console.error('Expected timeout but fetch returned');
    } catch (err) {
      console.log('timeout caught as expected:', err.message);
    }
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
  }
});
