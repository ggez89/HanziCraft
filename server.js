import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { pinyin } from 'pinyin-pro';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// API endpoint to get pinyin for Chinese characters
app.get('/api/pinyin', (req, res) => {
  try {
    const text = String(req.query.text || '');
    if (!text) {
      return res.json({ result: 'ok', text: '' });
    }
    const result = pinyin(text, { toneType: 'symbol' });
    res.json({ result: 'ok', text: result });
  } catch (err) {
    console.error('Error generating pinyin:', err);
    res.status(500).json({ result: 'error', message: err.message });
  }
});

// Serve local stroke order data
app.use('/data/strokes', express.static(path.join(__dirname, 'node_modules/hanzi-writer-data')));

// Serve static assets from project root
app.use(express.static(__dirname));

// Fallback to index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
