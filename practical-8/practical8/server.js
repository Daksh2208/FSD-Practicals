import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const COUNTER_FILE = path.join(__dirname, 'counter.json');

function readCounter() {
    if (!fs.existsSync(COUNTER_FILE)) {
        fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count: 0 }));
    }
    const data = fs.readFileSync(COUNTER_FILE);
    return JSON.parse(data).count;
}

function writeCounter(count) {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count }));
}

app.get('/count', (req, res) => {
    const count = readCounter();
    res.json({ count });
});

app.post('/increment', (req, res) => {
    let count = readCounter();
    count++;
    writeCounter(count);
    res.json({ count });
});

app.post('/decrement', (req, res) => {
    let count = readCounter();
    count = count > 0 ? count - 1 : 0;
    writeCounter(count);
    res.json({ count });
});

app.post('/reset', (req, res) => {
    writeCounter(0);
    res.json({ count: 0 });
});

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
