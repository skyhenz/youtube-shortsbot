let currentPassword = localStorage.getItem('bot_password');

if (currentPassword) {
    showDashboard();
}

async function login() {
    const password = document.getElementById('password').value;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });

    if (res.ok) {
        currentPassword = password;
        localStorage.setItem('bot_password', password);
        showDashboard();
    } else {
        alert('Invalid Password');
    }
}

function logout() {
    localStorage.removeItem('bot_password');
    location.reload();
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    startStatusPolling();
    loadMonetization();
    updateLogBtn();
}

function updateLogBtn() {
    const now = new Date();
    const logName = `upload_log_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}.json`;
    const btn = document.getElementById('monthly-log-btn');
    btn.onclick = () => loadLog(logName);
}

async function startStatusPolling() {
    updateStatus();
    setInterval(updateStatus, 5000);
}

async function updateStatus() {
    try {
        const res = await fetch('/api/status', {
            headers: { 'x-password': currentPassword }
        });

        if (res.status === 401) return logout();

        const data = await res.json();

        const statusBadge = document.getElementById('bot-status');
        statusBadge.innerText = data.bot.status;
        statusBadge.className = 'status-badge status-' + data.bot.status;

        document.getElementById('start-btn').disabled = data.isProcessRunning;
        document.getElementById('stop-btn').disabled = !data.isProcessRunning;

        if (data.bot.next_run) {
            const next = new Date(data.bot.next_run);
            document.getElementById('next-run').innerText = 'Next run: ' + next.toLocaleString();
        } else {
            document.getElementById('next-run').innerText = '';
        }

        if (data.lastUpload) {
            document.getElementById('last-video').innerText = data.lastUpload.title || '-';
            document.getElementById('last-upload').innerText = new Date(data.lastUpload.timestamp).toLocaleString();
        }

        if (data.lastFailed) {
            document.getElementById('last-failed').innerText = data.lastFailed;
        }
    } catch (err) {
        console.error('Status fetch failed');
    }
}

async function startBot() {
    await fetch('/api/start', {
        method: 'POST',
        headers: { 'x-password': currentPassword }
    });
    updateStatus();
}

async function stopBot() {
    if (!confirm('Are you sure you want to stop the bot?')) return;
    await fetch('/api/stop', {
        method: 'POST',
        headers: { 'x-password': currentPassword }
    });
    updateStatus();
}

async function loadMonetization() {
    try {
        const res = await fetch('/api/monetization', {
            headers: { 'x-password': currentPassword }
        });
        const data = await res.json();
        document.getElementById('cta-count').innerText = data.cta.total;
        document.getElementById('affiliate-count').innerText = data.affiliate.total;
    } catch (err) { }
}

async function loadLog(file) {
    const viewer = document.getElementById('log-viewer');
    viewer.innerText = 'Loading log...';
    try {
        const res = await fetch(`/api/logs/${file}`, {
            headers: { 'x-password': currentPassword }
        });
        const data = await res.text();
        viewer.innerText = data;
    } catch (err) {
        viewer.innerText = 'Failed to load log: ' + file;
    }
}
