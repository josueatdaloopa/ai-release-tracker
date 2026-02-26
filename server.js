const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const app = express();

// Gzip all responses — critical for 600-user concurrency (cuts payload 60-80%)
app.use(compression({ level: 6, threshold: 1024 }));

app.use(cors());
app.use(express.json());

// Strip Content-Length so compression middleware can replace it with Transfer-Encoding: chunked
app.use((req, res, next) => {
  const orig = res.setHeader.bind(res);
  res.setHeader = (name, value) => {
    if (name.toLowerCase() === 'content-length') return; // let compression handle sizing
    return orig(name, value);
  };
  next();
});

// Static files: ETag + smart cache headers. Compression middleware handles gzip encoding.
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      // HTML: always revalidate so users see fresh tracker data
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else {
      // CSS / JS / images: cache 7 days
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  }
}));

function resolveSkillPath() {
  const candidates = [
    path.join(os.homedir(), '.claude/skills/last30days/scripts/last30days.py'),
    path.join(os.homedir(), '.agents/skills/last30days/scripts/last30days.py'),
    path.join(os.homedir(), '.codex/skills/last30days/scripts/last30days.py'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

app.post('/api/research', (req, res) => {
  const { topic, mock, quick, deep } = req.body || {};

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const skillPath = resolveSkillPath();
  if (!skillPath) {
    return res.status(500).json({ error: 'last30days skill not found. Clone it to ~/.claude/skills/last30days' });
  }

  const args = [skillPath, topic.trim(), '--emit=json'];
  if (mock) args.push('--mock');
  if (quick) args.push('--quick');
  if (deep) args.push('--deep');

  // SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (type, data) => res.write('data: ' + JSON.stringify({ type, ...data }) + '\n\n');

  send('status', { message: 'Researching "' + topic.trim() + '" across Reddit, X, YouTube & Web...' });

  const proc = spawn('python3', args, {
    env: process.env,
    cwd: path.dirname(skillPath),
  });

  const outChunks = [];
  const errChunks = [];

  proc.stdout.on('data', (d) => outChunks.push(d));

  proc.stderr.on('data', (d) => {
    errChunks.push(d);
    const text = d.toString();
    text.split('\n').forEach((line) => {
      const clean = line.replace(/\x1b\[[0-9;]*[mGKH]/g, '').replace(/[┌┐└┘│─├┤]/g, '').trim();
      if (clean.length > 3) send('progress', { message: clean });
    });
  });

  proc.on('close', () => {
    const stdout = Buffer.concat(outChunks).toString('utf8').trim();
    if (!stdout) {
      const stderr = Buffer.concat(errChunks).toString('utf8');
      send('error', { message: 'No output from research script. Enable mock mode or add API keys.', hint: stderr.slice(0, 300) });
      return res.end();
    }
    const jsonStart = stdout.indexOf('{');
    const jsonStr = jsonStart >= 0 ? stdout.slice(jsonStart) : stdout;
    try {
      send('result', { report: JSON.parse(jsonStr) });
    } catch (e) {
      send('error', { message: 'Could not parse output', raw: stdout.slice(0, 300) });
    }
    res.end();
  });

  proc.on('error', (err) => {
    send('error', { message: 'Failed to start: ' + err.message });
    res.end();
  });
});

app.get('/tracker', (req, res) => res.redirect('/tracker.html'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('AI Pulse running at http://localhost:' + PORT);
  console.log('AI Release Tracker at http://localhost:' + PORT + '/tracker.html');
});
