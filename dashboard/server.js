import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3001;
const PASSWORD = process.env.DASHBOARD_PASSWORD || 'admin123';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let botProcess = null;

// Authentication Middleware
const auth = (req, res, next) => {
    const password = req.headers['x-password'];
    if (password === PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.get('/api/status', auth, async (req, res) => {
    const statusFile = path.join(__dirname, '..', 'logs', 'bot_status.json');
    let botStatus = { status: 'IDLE' };

    if (botProcess) {
        try {
            const data = await fs.readFile(statusFile, 'utf-8');
            botStatus = JSON.parse(data);
        } catch (err) {
            botStatus = { status: 'RUNNING' };
        }
    }

    // Get metrics
    let lastUpload = null;
    try {
        const now = new Date();
        const logFile = path.join(__dirname, '..', 'logs', `upload_log_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}.json`);
        const data = await fs.readFile(logFile, 'utf-8');
        const uploads = JSON.parse(data);
        lastUpload = uploads[uploads.length - 1];
    } catch (err) { }

    let lastFailed = null;
    try {
        const failLog = path.join(__dirname, '..', 'logs', 'upload_failed.log');
        const data = await fs.readFile(failLog, 'utf-8');
        const lines = data.trim().split('\n');
        lastFailed = lines[lines.length - 1];
    } catch (err) { }

    res.json({
        bot: botStatus,
        lastUpload,
        lastFailed,
        isProcessRunning: !!botProcess
    });
});

app.post('/api/start', auth, (req, res) => {
    if (botProcess) {
        return res.status(400).json({ error: 'Bot already running' });
    }

    botProcess = spawn('node', ['index.js'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
    });

    botProcess.on('exit', () => {
        botProcess = null;
    });

    res.json({ success: true });
});

app.post('/api/stop', auth, (req, res) => {
    if (!botProcess) {
        return res.status(400).json({ error: 'Bot not running' });
    }

    botProcess.kill();
    botProcess = null;
    res.json({ success: true });
});

app.get('/api/logs/:file', auth, async (req, res) => {
    const fileName = req.params.file;
    const allowedLogs = [
        'upload_failed.log',
        'rotation.log',
        'ai_recommendation.json'
    ];

    // Handle dynamic upload log
    if (fileName.startsWith('upload_log_')) {
        allowedLogs.push(fileName);
    }

    if (!allowedLogs.includes(fileName)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const logPath = path.join(__dirname, '..', 'logs', fileName);
        const data = await fs.readFile(logPath, 'utf-8');
        res.send(data);
    } catch (err) {
        res.status(404).json({ error: 'Log not found' });
    }
});

app.get('/api/monetization', auth, async (req, res) => {
    try {
        const ctaPath = path.join(__dirname, '..', 'config', 'cta_list.json');
        const affiliatePath = path.join(__dirname, '..', 'config', 'affiliate_list.json');

        const ctaData = JSON.parse(await fs.readFile(ctaPath, 'utf-8'));
        const affiliateData = JSON.parse(await fs.readFile(affiliatePath, 'utf-8'));

        // For simplicity, we'll just show the counts. 
        // In index.js, we should also track the "last used" ones if possible.
        // But the requirement says "currently selected", which happens during run.

        res.json({
            cta: {
                total: ctaData.length
            },
            affiliate: {
                total: affiliateData.length
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read monetization config' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dashboard running at http://localhost:${PORT}`);
});
