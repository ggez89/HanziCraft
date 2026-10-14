import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

const STROKES_DIR = path.join(__dirname, 'data', 'strokes');

// API to retrieve stroke data for a character (with fallback to CDN)
app.get('/api/strokes/:char', async (req, res) => {
  const char = req.params.char;
  if (!char) {
    return res.status(400).json({ error: 'Character required' });
  }

  const localFile = path.join(STROKES_DIR, `${char}.json`);
  if (fs.existsSync(localFile)) {
    try {
      const data = fs.readFileSync(localFile, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      return res.send(data);
    } catch (e) {
      console.error(`Error reading local stroke file for ${char}:`, e);
    }
  }

  // Fetch from dedicated ggez89 CDN endpoint (with raw GitHub and jsdelivr fallbacks)
  const cdnEndpoints = [
    `https://ggez89.github.io/hanzi-writer-data/data/${encodeURIComponent(char)}.json`,
    `https://raw.githubusercontent.com/ggez89/hanzi-writer-data/master/data/${encodeURIComponent(char)}.json`,
    `https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${encodeURIComponent(char)}.json`,
  ];

  for (const cdnUrl of cdnEndpoints) {
    try {
      const response = await fetch(cdnUrl);
      if (response.ok) {
        const json = await response.json();
        return res.json(json);
      }
    } catch (err) {
      console.warn(`Failed CDN fetch from ${cdnUrl} for char ${char}:`, err);
    }
  }

  return res.status(404).json({ error: `No stroke data available for '${char}'` });
});

// Directly serve local stroke files if requested by static path
app.use('/data/strokes', express.static(STROKES_DIR));

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[AI Studio] Chinese Character Worksheets server active on http://0.0.0.0:${PORT}`);
});
