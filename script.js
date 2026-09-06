/**
 * Mock API Layer - Simulates network latency and asynchronous operations
 */
const MockAPI = {
  db: {
    "ALPHA-10": {name:"ALPHA-10", region:"Northern Ridge", lat:"41.8781° N", lon:"87.6298° W", alt:"181m MSL", temp:24.1, humidity:58, wind:14.2, health:98, predicted:24.4, status:"Stable", pressure:1013.2, rain:0.2, latency:14, integrity:99.98, edge:18.4, storage:84, compute:62, insight:"No significant anomaly detected. AI confidence 0.96.", trend:[42,48,45,52,58,55,61,57,64,60,66]},
    "BETA-07": {name:"BETA-07", region:"Central Plains", lat:"39.7392° N", lon:"104.9903° W", alt:"1609m MSL", temp:23.9, humidity:61, wind:18.8, health:94, predicted:24.2, status:"Stable", pressure:1008.7, rain:0, latency:19, integrity:99.94, edge:22.1, storage:71, compute:57, insight:"Telemetry is consistent with neighboring nodes. AI confidence 0.93.", trend:[55,53,59,57,62,60,65,63,68,66,70]},
    "GAMMA-03": {name:"GAMMA-03", region:"Coastal Ridge", lat:"47.6062° N", lon:"122.3321° W", alt:"72m MSL", temp:22.9, humidity:67, wind:11.6, health:91, predicted:23.3, status:"Stable", pressure:1016.4, rain:1.4, latency:16, integrity:99.91, edge:17.6, storage:66, compute:49, insight:"Minor humidity drift detected; no correction required.", trend:[60,58,61,59,64,62,66,65,69,67,71]},
    "DELTA-09": {name:"DELTA-09", region:"Eastern Sector", lat:"25.7617° N", lon:"80.1918° W", alt:"3m MSL", temp:28.6, humidity:76, wind:22.4, health:73, predicted:27.9, status:"Warning", pressure:1004.9, rain:2.7, latency:31, integrity:98.7, edge:34.5, storage:89, compute:78, insight:"Temperature deviation detected. AI recommends calibration with 0.84 confidence.", trend:[50,54,58,63,72,68,77,81,75,84,88]},
    "PHI-OBSERVATORY": {name:"PHI-OBSERVATORY", region:"Critical Observatory", lat:"34.0522° N", lon:"118.2437° W", alt:"89m MSL", temp:31.2, humidity:42, wind:26.7, health:64, predicted:25.8, status:"Critical", pressure:997.8, rain:0, latency:48, integrity:96.2, edge:51.8, storage:93, compute:91, insight:"Critical thermal anomaly detected. AI correction strongly recommended.", trend:[45,50,58,70,82,95,88,100,92,105,110]},
    "METRO-02": {name:"METRO-02", region:"Metro East", lat:"41.8819° N", lon:"87.6278° W", alt:"176m MSL", temp:23.5, humidity:63, wind:10.4, health:0, predicted:23.7, status:"Offline", pressure:1011.8, rain:0.4, latency:0, integrity:0, edge:0, storage:58, compute:0, insight:"Station is offline. Last valid telemetry retained for comparison.", trend:[48,48,47,47,46,46,45,45,44,44,43]}
  },
  alerts: [
    { id: 'AL-902', origin: 'PHI-OBSERVATORY', severity: 'CRITICAL', type: 'Sensor Anomaly', desc: 'Critical dew point fluctuation detected.', time: '2m ago' },
    { id: 'AL-899', origin: 'DELTA-09', severity: 'HIGH', type: 'Connectivity', desc: 'Edge node signal below 15%.', time: '14m ago' },
    { id: 'AL-884', origin: 'GAMMA-03', severity: 'MEDIUM', type: 'Pressure Drop', desc: 'Sudden barometric drop.', time: '45m ago' },
    { id: 'AL-876', origin: 'METRO-02', severity: 'LOW', type: 'Maintenance', desc: 'Routine offline cycle.', time: '1h ago' }
  ],
  
  delay: (ms) => new Promise(res => setTimeout(res, ms)),

  async fetchStation(id) {
    await this.delay(400); // simulate network latency
    if(this.db[id]) return JSON.parse(JSON.stringify(this.db[id]));
    throw new Error('Station not found');
  },

  async fetchAllKeys() {
    return Object.keys(this.db);
  },

  async search(query) {
    await this.delay(300);
    const q = query.toLowerCase();
    return Object.keys(this.db).find(k => k.toLowerCase().includes(q) || this.db[k].region.toLowerCase().includes(q));
  },

  async applyCorrection(id) {
    await this.delay(600);
    if(this.db[id] && this.db[id].status !== 'Offline') {
      this.db[id].temp = this.db[id].predicted;
      this.db[id].insight = "AI correction successfully applied and synchronized.";
      this.db[id].status = "Stable";
      this.db[id].health = Math.min(100, this.db[id].health + 15);
      return this.db[id];
    }
    throw new Error('Cannot correct offline/invalid station');
  },

  async syncNetwork() {
    await this.delay(1200);
    Object.keys(this.db).forEach(k => {
      if(this.db[k].status !== 'Offline') {
        this.db[k].temp += (Math.random() - 0.5) * 0.5;
        this.db[k].wind += (Math.random() - 0.5) * 1.5;
        this.db[k].storage = Math.min(100, Math.max(10, this.db[k].storage + Math.floor((Math.random() - 0.5)*5)));
        this.db[k].trend.shift();
        this.db[k].trend.push(this.db[k].trend[this.db[k].trend.length-1] + (Math.random()-0.5)*10);
      }
    });
    return true;
  },

  async getAlerts() {
    await this.delay(300);
    return [...this.alerts];
  },

  async resolveAlert(id) {
    await this.delay(400);
    this.alerts = this.alerts.filter(a => a.id !== id);
    return true;
  }
};

let currentStation = 'ALPHA-10';
let activeView = 'dashboard';

document.addEventListener('DOMContentLoaded', async () => {
  populateDatalist();
  await refreshAlertsTable();
  await loadStation(currentStation);
});

function switchView(viewId) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  
  document.querySelectorAll('#sidebarNav button').forEach(el => {
    if(el.dataset.target === viewId) el.classList.add('active');
    else el.classList.remove('active');
  });

  const titles = { dashboard: 'Regional Overview', diagnostics: 'Sensor Diagnostics', alertsView: 'Active Network Alerts', mapView: 'Geospatial Map' };
  document.getElementById('crumbText').textContent = titles[viewId] || 'Dashboard';
  activeView = viewId;
}

async function loadStation(id) {
  try {
    const data = await MockAPI.fetchStation(id);
    currentStation = id;
    renderDashboardStats(data);
    renderDiagnostics(data);
    await renderQuickList();
    if(activeView !== 'dashboard' && activeView !== 'diagnostics') {
      switchView('dashboard');
    }
  } catch (err) {
    toast(err.message);
  }
}

async function handleSearch() {
  const val = document.getElementById('search').value.trim();
  if(!val) return;
  const btn = document.getElementById('searchBtn');
  btn.textContent = '...';
  
  const foundId = await MockAPI.search(val);
  btn.textContent = 'SEARCH';
  
  if(foundId) {
    document.getElementById('search').value = foundId;
    loadStation(foundId);
  } else {
    toast(`No results found for "${val}"`);
  }
}

// Renders the Station Selector buttons
async function renderQuickList() {
  const keys = await MockAPI.fetchAllKeys();
  const html = [];
  for (let k of keys) {
    const s = await MockAPI.fetchStation(k);
    const color = s.health < 70 ? 'var(--red)' : s.health < 85 ? 'var(--yellow)' : 'var(--green)';
    html.push(`
      <button class="quickstation ${k === currentStation ? 'selected' : ''}" onclick="loadStation('${k}')">
        <b>${k}</b>
        <span class="qsstatus" style="color:${color}">●</span>
        <small>${s.temp.toFixed(1)}°C · H:${s.health}%</small>
      </button>
    `);
  }
  document.getElementById('stationQuickList').innerHTML = html.join('');
}

function renderDashboardStats(s) {
  document.getElementById('networkIntegrity').innerHTML = `${s.integrity.toFixed(2)}<span class="unit">UPTIME</span>`;
  document.getElementById('edgeLatency').innerHTML = `${s.edge.toFixed(1)}<span class="unit">MS</span>`;
  document.getElementById('activeNodes').innerHTML = s.status === 'Offline' ? `1,427<span class="unit">ONLINE</span>` : `1,428<span class="unit">ONLINE</span>`;
  
  document.getElementById('storageValue').textContent = `${s.storage}%`;
  document.getElementById('storageFill').style.width = `${s.storage}%`;
  document.getElementById('computeValue').textContent = `${s.compute}%`;
  document.getElementById('computeFill').style.width = `${s.compute}%`;
  
  document.getElementById('footTemp').textContent = `${s.temp.toFixed(1)}°C`;
  document.getElementById('footHumidity').textContent = `${s.humidity}%`;
  document.getElementById('footWind').textContent = `${s.wind.toFixed(1)} km/h`;
  document.getElementById('footPressure').textContent = `${s.pressure.toFixed(1)} hPa`;
  document.getElementById('footRain').textContent = `${s.rain.toFixed(1)} mm`;
  document.getElementById('footLatency').textContent = `${s.latency}ms`;

  document.getElementById('mapLat').textContent = `LAT: ${s.lat}`;
  document.getElementById('mapLon').textContent = `LONG: ${s.lon}`;
  document.getElementById('mapAlt').textContent = `ALT: ${s.alt}`;
}

function renderDiagnostics(s) {
  document.getElementById('stationName').textContent = `${s.name} (${s.region})`;
  document.getElementById('stationMeta').textContent = `${s.lat} · ${s.lon} · ${s.alt} · Last Sync: Just now`;
  
  document.getElementById('stTemp').innerHTML = `${s.temp.toFixed(1)}<span class="unit">°C</span>`;
  document.getElementById('stHumidity').innerHTML = `${s.humidity}<span class="unit">%</span>`;
  document.getElementById('stWind').innerHTML = `${s.wind.toFixed(1)}<span class="unit">km/h</span>`;
  document.getElementById('stHealth').innerHTML = `${s.health}<span class="unit">%</span>`;
  
  document.getElementById('predictedTemp').innerHTML = `${s.predicted.toFixed(1)}<span class="unit">°C</span>`;
  document.getElementById('predictionStatus').textContent = s.status.toUpperCase();
  document.getElementById('aiInsight').innerHTML = `<b>⚙ AI INSIGHT</b> ${s.insight}`;
  
  const dotColor = s.status === 'Critical' ? 'var(--red)' : s.status === 'Warning' ? 'var(--yellow)' : s.status === 'Offline' ? 'var(--muted)' : 'var(--green)';
  document.getElementById('stationStatusDot').style.color = dotColor;

  const max = Math.max(...s.trend), min = Math.min(...s.trend), span = Math.max(1, max-min);
  const pts = s.trend.map((v,i) => [i*(700/(s.trend.length-1)), 250 - ((v-min)/span)*180]);
  const d = pts.map((p,i) => (i?'L':'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  document.getElementById('telemetryLine').setAttribute('d', d);
  document.getElementById('telemetryArea').setAttribute('d', d + ' L 700 300 L 0 300 Z');
}

async function refreshAlertsTable() {
  const alerts = await MockAPI.getAlerts();
  const tbody = document.getElementById('alertTableBody');
  document.getElementById('anomalyCount').innerHTML = `${alerts.length}<span class="unit">ACTIVE</span>`;
  
  const critCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  document.getElementById('criticalBadge').textContent = `${critCount} CRITICAL`;

  if(alerts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#ffffff">All clear. No active alerts.</td></tr>';
    return;
  }

  tbody.innerHTML = alerts.map(a => {
    let badgeClass = a.severity === 'CRITICAL' ? 'red' : a.severity === 'HIGH' ? 'yellow' : a.severity === 'MEDIUM' ? 'blue' : 'gray';
    return `
      <tr>
        <td>${a.id}</td>
        <td>${a.origin}</td>
        <td><span class="badge ${badgeClass}">${a.severity}</span></td>
        <td>${a.type}<br><small style="color:#cccccc">${a.desc}</small></td>
        <td>${a.time}</td>
        <td><button onclick="resolveAlert('${a.id}', this)" class="smallbtn" style="margin:0;padding:5px 7px">RESOLVE</button></td>
      </tr>
    `;
  }).join('');
}

async function handleSync() {
  const btn = document.getElementById('syncBtn');
  btn.disabled = true;
  btn.innerHTML = '⟳ &nbsp; SYNCHRONIZING...';
  
  await MockAPI.syncNetwork();
  await loadStation(currentStation);
  
  btn.disabled = false;
  btn.innerHTML = '⟳ &nbsp; SYNCHRONIZE FLEET';
  toast('Fleet synchronized globally.');
}

async function applyAICorrection() {
  confirmAction('Apply AI Correction', `This will overwrite current telemetry for ${currentStation} with AI consensus data.`, async () => {
    const btn = document.getElementById('aiBtn');
    btn.disabled = true;
    try {
      await MockAPI.applyCorrection(currentStation);
      await loadStation(currentStation);
      toast(`AI Correction applied to ${currentStation}`);
    } catch(e) {
      toast(e.message);
    }
    btn.disabled = false;
  });
}

async function resolveAlert(id, btnElement) {
  btnElement.disabled = true;
  btnElement.textContent = '...';
  await MockAPI.resolveAlert(id);
  await refreshAlertsTable();
  toast(`Alert ${id} resolved.`);
}

async function clearAllAlerts() {
  confirmAction('Resolve All Alerts', 'Are you sure you want to dismiss all active network alerts?', async () => {
    MockAPI.alerts = [];
    await refreshAlertsTable();
    toast('All alerts resolved.');
  });
}

function handleAction(type) {
  confirmAction(`${type} Sequence`, `Initialize ${type.toLowerCase()} protocol for ${currentStation}?`, () => {
    toast(`Command sent to edge node: ${currentStation}`);
  });
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => t.classList.remove('show'), 2500);
}

function confirmAction(title, text, onConfirm) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalText').textContent = text;
  document.getElementById('modal').classList.add('show');
  
  const confirmBtn = document.getElementById('modalConfirmBtn');
  
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
  
  newBtn.addEventListener('click', () => {
    closeModal();
    if(onConfirm) onConfirm();
  });
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
}

function openSettings() {
  confirmAction('System Settings', 'Settings are currently locked by the administrator profile.', null);
}

async function populateDatalist() {
  const keys = await MockAPI.fetchAllKeys();
  document.getElementById('stationList').innerHTML = keys.map(k => `<option value="${k}">`).join('');
}

document.getElementById('modal').addEventListener('click', e => { if(e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });