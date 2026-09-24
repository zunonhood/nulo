import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4319);
const ponsUrl = 'https://www.ponsfamily.com/launchpad';
const xUrl = 'https://x.com/nuloonhood';

const agents = [{
  id: 1,
  ponsName: 'agent_0001',
  style: 'Genesis',
  status: 'waiting',
  trading: 'waiting',
  avatarUrl: '/nulo.png',
  address: null,
  bankStartUsd: 0,
  bankUsd: 0,
  pnlUsd: null,
  nuloUsd: 0,
  trades: 0,
  wins: 0,
  openPositions: 0,
  note: 'Waiting for the NULO contract launch on Robinhood Chain.',
}];

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};

const state = {
  mode: 'prelaunch',
  network: 'Robinhood Chain',
  ticker: 'NULO',
  ca: null,
  xUrl,
  ponsUrl,
  teamPct: 10,
  agentUsd: 10,
  nuloBuyUsd: 5,
  bankUsd: 5,
  sweepUsd: 10,
  updatedAt: null,
  token: { marketCap: null },
  agents: {
    total: agents.length,
    active: 0,
    stopped: 0,
    bankUsd: 0,
    investedUsd: 0,
    profitToNuloUsd: 0,
    trades: 0,
    wins: 0,
    calloutsPosted: 0,
    calloutsQueued: 0,
    heldPct: null,
  },
  next: {
    number: 2,
    agent: null,
    haveUsd: 0,
    needUsd: 10,
    ready: 0,
  },
  fees: {
    claimedUsd: 0,
    unclaimedUsd: 0,
    spentUsd: 0,
    teamUsd: 0,
    claims: [],
  },
  treasury: null,
};

function sendJson(res, value, status = 200) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(value));
}

function serveApi(url, req, res) {
  if (url.pathname === '/api/state') return sendJson(res, state);
  if (url.pathname === '/api/leaderboard') return sendJson(res, { agents });
  if (url.pathname === '/api/agents') return sendJson(res, { agents, total: agents.length });
  if (url.pathname === '/api/trades') return sendJson(res, { trades: [] });
  if (url.pathname === '/api/callouts') return sendJson(res, { callouts: [] });
  if (url.pathname === '/api/holders') return sendJson(res, { rows: [], total: 0, count: 0, agentsHolding: 0 });
  if (url.pathname.startsWith('/api/agent/')) {
    const id = Number(url.pathname.split('/').pop());
    const agent = agents.find((item) => item.id === id);
    return agent
      ? sendJson(res, { agent, cashUsd: 0, positions: [], trades: [], callouts: [] })
      : sendJson(res, { error: 'Agent not found' }, 404);
  }

  if (url.pathname === '/api/stream') {
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    });
    res.write(`event: state\ndata: ${JSON.stringify(state)}\n\n`);
    const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 25_000);
    req.on('close', () => clearInterval(heartbeat));
    return;
  }

  sendJson(res, { error: 'Not found' }, 404);
}

function serveFile(res, file) {
  res.writeHead(200, {
    'content-type': types[extname(file).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-cache',
  });
  createReadStream(file).pipe(res);
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname.startsWith('/api/')) {
    serveApi(url, req, res);
    return;
  }

  const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const safePath = normalize(requested).replace(/^(\.\.(\\|\/|$))+/, '');
  const file = join(root, safePath);

  if (file.startsWith(root) && existsSync(file) && statSync(file).isFile()) {
    serveFile(res, file);
    return;
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`NULO local frontend: http://127.0.0.1:${port}`);
});
