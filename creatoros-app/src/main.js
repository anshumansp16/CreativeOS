// CreatorOS - Tauri App JavaScript

// Page Navigation
document.querySelectorAll('.nav-item, .action-card').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    if (page) switchPage(page);
  });
});

function switchPage(pageId) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });
  
  // Update pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.id === pageId);
  });
}

// Helper Functions
function setLoading(btn, loading) {
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Loading...';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    btn.disabled = false;
  }
}

function displayOutput(elementId, content, isError = false) {
  const el = document.getElementById(elementId);
  if (isError) {
    el.innerHTML = `<div style="color: #f87171; padding: 20px; background: rgba(239, 68, 68, 0.1); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">${content}</div>`;
  } else {
    el.innerHTML = content;
  }
}

// ============ VIDEO TRAY (localStorage) ============
const TRAY_KEY = 'creatoros_video_tray';
const LIB_KEY  = 'creatoros_library';

function trayLoad()       { try { return JSON.parse(localStorage.getItem(TRAY_KEY) || '[]'); } catch { return []; } }
function traySave(arr)    { try { localStorage.setItem(TRAY_KEY, JSON.stringify(arr)); } catch {} }
function libLoad()        { try { return JSON.parse(localStorage.getItem(LIB_KEY)  || '[]'); } catch { return []; } }
function libSave(arr)     { try { localStorage.setItem(LIB_KEY,  JSON.stringify(arr)); } catch {} }

function libAdd(type, title, content, meta) {
  const item = { id: `${type}-${Date.now()}`, type, title, content, metadata: meta || {}, createdAt: Date.now() };
  libSave([item, ...libLoad()]);
  return item;
}

function trayAdd(idea) {
  const tray = trayLoad();
  if (tray.some(t => t.title === idea.title)) return;
  tray.unshift({ id: `tray-${Date.now()}`, ...idea, addedAt: Date.now() });
  traySave(tray);
  updateTrayIndicator();
}

function trayRemove(id) {
  traySave(trayLoad().filter(t => t.id !== id));
  updateTrayIndicator();
  renderTrayPage();
  renderSocialTrayPicker();
}

function clearTray() {
  if (!confirm('Clear all items from Video Tray?')) return;
  traySave([]);
  updateTrayIndicator();
  renderTrayPage();
}

function updateTrayIndicator() {
  const tray = trayLoad();
  const navBtn = document.querySelector('[data-page="tray"]');
  if (!navBtn) return;
  const existing = navBtn.querySelector('.tray-count');
  if (existing) existing.remove();
  if (tray.length > 0) {
    const badge = document.createElement('span');
    badge.className = 'tray-count';
    badge.textContent = tray.length;
    badge.style.cssText = 'background:#8b5cf6;color:white;border-radius:12px;padding:1px 7px;font-size:10px;font-weight:700;margin-left:auto;';
    navBtn.appendChild(badge);
  }
}

// ============ IDEAS (auto-research via Next.js API or Claude direct) ============

async function loadIdeas() {
  const output = document.getElementById('ideas-output');
  const cacheInfo = document.getElementById('ideas-cache-info');
  if (!output) return;

  output.innerHTML = `<div style="text-align:center;padding:60px;">
    <span style="font-size:48px;display:block;margin-bottom:12px;animation:spin 1s linear infinite">💡</span>
    <p style="color:#94a3b8;">Researching trending topics for Indian dev audience...</p>
  </div>`;

  try {
    // Try to call Next.js API if it's running locally
    let ideas = [];
    let cached = false;
    let generatedAt = null;

    try {
      const res = await fetch('http://localhost:3001/api/ideas', { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        const data = await res.json();
        ideas = data.ideas || [];
        cached = data.cached;
        generatedAt = data.generatedAt;
      }
    } catch {
      // Next.js not running — fall back to cached file or error
      ideas = [];
    }

    if (ideas.length === 0) {
      output.innerHTML = `<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:16px;padding:24px;color:#f87171;">
        <strong>Could not fetch ideas.</strong><br>
        <span style="font-size:13px;color:#94a3b8;">Make sure the CreatorOS web app is running (npm run dev in dashboard folder) then refresh.</span>
        <br><br><button class="btn-primary" onclick="loadIdeas()">🔄 Try Again</button>
      </div>`;
      return;
    }

    if (cacheInfo) {
      cacheInfo.style.display = 'block';
      cacheInfo.textContent = cached
        ? `Cached ideas from ${new Date(generatedAt).toLocaleString('en-IN')} · Refresh to regenerate`
        : `Fresh ideas generated at ${new Date(generatedAt).toLocaleString('en-IN')}`;
    }

    renderIdeas(ideas);
  } catch (e) {
    output.innerHTML = `<div style="color:#f87171;padding:20px;">Error: ${e}</div>`;
  }
}

function renderIdeas(ideas) {
  const output = document.getElementById('ideas-output');
  if (!output) return;

  const probColor = p => p >= 75 ? '#10b981' : p >= 55 ? '#f59e0b' : '#ef4444';
  const demandColor = { High: '#10b981', Medium: '#f59e0b', Low: '#ef4444' };
  const compColor   = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

  output.innerHTML = `<div style="display:flex;flex-direction:column;gap:16px;">
    ${ideas.map((idea, i) => {
      const inTray = trayLoad().some(t => t.title === idea.title);
      return `<div style="background:rgba(255,255,255,0.03);border:1px solid ${inTray ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'};border-radius:16px;padding:20px 24px;">
        <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:12px;">
          <div style="min-width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#ef4444);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:15px;flex-shrink:0;">${i+1}</div>
          <div style="flex:1;">
            <h3 style="color:#f8fafc;font-weight:600;font-size:16px;margin:0 0 8px;">${idea.title}</h3>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${idea.category ? `<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(139,92,246,0.15);color:#c4b5fd;border:1px solid rgba(139,92,246,0.3);">${idea.category}</span>` : ''}
              <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:${demandColor[idea.searchDemand] || '#888'}20;color:${demandColor[idea.searchDemand] || '#888'};border:1px solid ${demandColor[idea.searchDemand] || '#888'}40;">📈 ${idea.searchDemand} Demand</span>
              <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:${compColor[idea.competition] || '#888'}20;color:${compColor[idea.competition] || '#888'};border:1px solid ${compColor[idea.competition] || '#888'}40;">⚔️ ${idea.competition} Competition</span>
              <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(255,255,255,0.05);color:#94a3b8;border:1px solid rgba(255,255,255,0.1);">👁️ ${idea.estimatedViews}</span>
              <span style="padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700;background:${probColor(idea.successProbability)}20;color:${probColor(idea.successProbability)};border:1px solid ${probColor(idea.successProbability)}40;">🎯 ${idea.successProbability}% success</span>
            </div>
          </div>
          <button onclick="handleIdeaTray(${i})" id="tray-btn-${i}"
            style="padding:8px 16px;background:${inTray ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)'};border:1px solid ${inTray ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.15)'};border-radius:8px;color:${inTray ? '#c4b5fd' : '#94a3b8'};font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;">
            ${inTray ? '✅ In Tray' : '➕ Add to Tray'}
          </button>
        </div>
        <p style="color:#94a3b8;font-size:13px;font-style:italic;margin:0 0 8px;padding-left:52px;">"${idea.hook || ''}"</p>
        ${idea.whyNow ? `<p style="color:#64748b;font-size:12px;margin:0;padding-left:52px;">💡 ${idea.whyNow}</p>` : ''}
      </div>`;
    }).join('')}
  </div>`;

  // Store ideas globally for tray handler
  window._latestIdeas = ideas;
}

function handleIdeaTray(index) {
  const idea = (window._latestIdeas || [])[index];
  if (!idea) return;
  const inTray = trayLoad().some(t => t.title === idea.title);
  if (inTray) {
    traySave(trayLoad().filter(t => t.title !== idea.title));
    updateTrayIndicator();
    renderIdeas(window._latestIdeas);
  } else {
    trayAdd(idea);
    // Auto-save to Library
    libAdd('idea', idea.title, [
      `Hook: ${idea.hook}`, `Category: ${idea.category || ''}`,
      `Target Audience: ${idea.targetAudience || ''}`, `Why Now: ${idea.whyNow || ''}`,
      `Search Demand: ${idea.searchDemand} | Competition: ${idea.competition}`,
      `Success Probability: ${idea.successProbability}%`, `Estimated Views: ${idea.estimatedViews}`,
      `SEO Keywords: ${(idea.seoKeywords || []).join(', ')}`,
    ].filter(l => !l.endsWith(': ')).join('\n'), {
      successProbability: idea.successProbability, estimatedViews: idea.estimatedViews,
      searchDemand: idea.searchDemand, competition: idea.competition,
    });
    renderIdeas(window._latestIdeas);
    renderTrayPage();
    renderSocialTrayPicker();
    renderLibrary();
  }
}

async function refreshIdeas(e) {
  const btn = e.target;
  setLoading(btn, true);
  try {
    await fetch('http://localhost:3001/api/ideas', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({forceRefresh:true}), signal: AbortSignal.timeout(5000) });
  } catch {}
  await loadIdeas();
  setLoading(btn, false);
}

// ============ SCRIPT GENERATOR ============
async function generateScript() {
  const topic = document.getElementById('script-topic').value;
  const style = document.getElementById('script-style').value;
  const btn = event.target;
  if (!topic) { displayOutput('scripts-output', 'Please enter a topic', true); return; }
  setLoading(btn, true);
  try {
    const res = await fetch('http://localhost:3001/api/scripts', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ topic, style }), signal: AbortSignal.timeout(30000),
    });
    const data = await res.json();
    if (data.script) {
      libAdd('script', topic, data.script, { style });
      renderLibrary();
      displayOutput('scripts-output', `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="color:white;display:flex;align-items:center;gap:8px;">📄 Script Outline <span style="font-size:11px;color:#22c55e;background:rgba(34,197,94,0.1);padding:2px 8px;border-radius:6px;">Saved to Library ✓</span></h3>
          <button class="btn-secondary" onclick="navigator.clipboard.writeText(document.getElementById('script-content').innerText)">📋 Copy</button>
        </div>
        <div style="padding:24px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:16px;">
          <pre id="script-content" style="white-space:pre-wrap;color:#e2e8f0;font-family:monospace;font-size:13px;line-height:1.8;">${data.script}</pre>
        </div>`);
    } else { displayOutput('scripts-output', data.error || 'Generation failed', true); }
  } catch (e) { displayOutput('scripts-output', `Error: ${e}. Make sure the web app is running on port 3001.`, true); }
  finally { setLoading(btn, false); }
}

// ============ DESCRIPTION GENERATOR ============
async function generateDescription() {
  const topic = document.getElementById('desc-title').value;
  const btn = event.target;
  if (!topic) { displayOutput('descriptions-output', 'Please enter a topic', true); return; }
  setLoading(btn, true);
  try {
    const res = await fetch('http://localhost:3001/api/descriptions', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ topic }), signal: AbortSignal.timeout(30000),
    });
    const data = await res.json();
    if (data.description) {
      libAdd('description', topic, data.description);
      renderLibrary();
      displayOutput('descriptions-output', `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="color:white;display:flex;align-items:center;gap:8px;">💬 YouTube Description <span style="font-size:11px;color:#22c55e;background:rgba(34,197,94,0.1);padding:2px 8px;border-radius:6px;">Saved ✓</span></h3>
          <button class="btn-secondary" onclick="navigator.clipboard.writeText(document.getElementById('desc-content').innerText)">📋 Copy</button>
        </div>
        <div style="padding:24px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:16px;">
          <pre id="desc-content" style="white-space:pre-wrap;color:#e2e8f0;font-size:13px;line-height:1.8;">${data.description}</pre>
        </div>`);
    } else { displayOutput('descriptions-output', data.error || 'Generation failed', true); }
  } catch (e) { displayOutput('descriptions-output', `Error: ${e}`, true); }
  finally { setLoading(btn, false); }
}

// ============ SOCIAL CONTENT ============
async function generateSocial(e) {
  const topic = document.getElementById('social-topic').value;
  const type  = document.getElementById('social-type').value;
  const btn = e.target;
  if (!topic) { displayOutput('social-output', 'Please enter a topic', true); return; }
  setLoading(btn, true);
  try {
    const res = await fetch('http://localhost:3001/api/generate', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ topic, type }), signal: AbortSignal.timeout(30000),
    });
    const data = await res.json();
    if (data.content) {
      libAdd(type, topic, data.content, { contentType: type });
      renderLibrary();
      const labels = { linkedin: '💼 LinkedIn Post', twitter: '🐦 Twitter Thread', hashtags: '#️⃣ Hashtags' };
      displayOutput('social-output', `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="color:white;">${labels[type] || type} <span style="font-size:11px;color:#22c55e;background:rgba(34,197,94,0.1);padding:2px 8px;border-radius:6px;">Saved ✓</span></h3>
          <button class="btn-secondary" onclick="navigator.clipboard.writeText(document.getElementById('social-content').innerText)">📋 Copy</button>
        </div>
        <div style="padding:24px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:16px;">
          <pre id="social-content" style="white-space:pre-wrap;color:#e2e8f0;font-size:13px;line-height:1.8;">${data.content}</pre>
        </div>`);
    } else { displayOutput('social-output', data.error || 'Failed', true); }
  } catch (e) { displayOutput('social-output', `Error: ${e}`, true); }
  finally { setLoading(btn, false); }
}

// ============ VIDEO TRAY PAGE ============
// Tray sort/filter state
let traySortBy = 'added';   // 'added' | 'probability' | 'demand' | 'competition'
let traySortDir = 'desc';   // 'desc' | 'asc'
let trayFilterDemand = 'all';
let trayFilterComp   = 'all';
let traySearch = '';

const DEMAND_RANK = { High: 3, Medium: 2, Low: 1 };
const COMP_RANK   = { Low: 3, Medium: 2, High: 1 };

function renderTrayPage() {
  const raw  = trayLoad();
  const empty = document.getElementById('tray-empty');
  const list  = document.getElementById('tray-list');
  const controls = document.getElementById('tray-controls');
  if (!list) return;
  if (raw.length === 0) {
    if (empty)    empty.style.display = 'block';
    if (controls) controls.style.display = 'none';
    list.innerHTML = '';
    return;
  }
  if (empty)    empty.style.display = 'none';
  if (controls) controls.style.display = 'flex';

  // --- filter ---
  let tray = raw.filter(item => {
    if (trayFilterDemand !== 'all' && item.searchDemand !== trayFilterDemand) return false;
    if (trayFilterComp   !== 'all' && item.competition   !== trayFilterComp)   return false;
    if (traySearch && !item.title.toLowerCase().includes(traySearch.toLowerCase())) return false;
    return true;
  });

  // --- sort ---
  tray.sort((a, b) => {
    let diff = 0;
    if (traySortBy === 'added')       diff = (a.addedAt || 0) - (b.addedAt || 0);
    if (traySortBy === 'probability') diff = (a.successProbability || 0) - (b.successProbability || 0);
    if (traySortBy === 'demand')      diff = (DEMAND_RANK[a.searchDemand] || 0) - (DEMAND_RANK[b.searchDemand] || 0);
    if (traySortBy === 'competition') diff = (COMP_RANK[a.competition] || 0) - (COMP_RANK[b.competition] || 0);
    return traySortDir === 'desc' ? -diff : diff;
  });

  list.innerHTML = tray.length === 0
    ? `<div style="text-align:center;padding:40px;color:#64748b;">No items match the current filter.</div>`
    : tray.map(item => `
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(139,92,246,0.25);border-radius:14px;padding:18px 20px;">
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <div style="flex:1;">
          <h3 style="color:#f8fafc;font-size:15px;font-weight:600;margin:0 0 8px;">${item.title}</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
            ${item.successProbability ? `<span style="font-size:11px;color:#10b981;background:rgba(16,185,129,0.1);padding:2px 8px;border-radius:6px;">🎯 ${item.successProbability}% success</span>` : ''}
            ${item.estimatedViews    ? `<span style="font-size:11px;color:#94a3b8;background:rgba(255,255,255,0.05);padding:2px 8px;border-radius:6px;">👁️ ${item.estimatedViews}</span>` : ''}
            ${item.searchDemand      ? `<span style="font-size:11px;color:#f59e0b;background:rgba(245,158,11,0.1);padding:2px 8px;border-radius:6px;">${item.searchDemand} Demand</span>` : ''}
            ${item.competition       ? `<span style="font-size:11px;color:#818cf8;background:rgba(99,102,241,0.1);padding:2px 8px;border-radius:6px;">${item.competition} Comp.</span>` : ''}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button onclick="prefillAndGo('scripts','script-topic','${item.title.replace(/'/g,"\\'")}','scripts')" style="padding:6px 12px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:8px;color:#818cf8;font-size:12px;cursor:pointer;">📝 Script</button>
            <button onclick="prefillAndGo('descriptions','desc-title','${item.title.replace(/'/g,"\\'")}','descriptions')" style="padding:6px 12px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:8px;color:#34d399;font-size:12px;cursor:pointer;">💬 Description</button>
            <button onclick="prefillAndGo('social','social-topic','${item.title.replace(/'/g,"\\'")}','social')" style="padding:6px 12px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.25);border-radius:8px;color:#60a5fa;font-size:12px;cursor:pointer;">🚀 Social</button>
          </div>
        </div>
        <button onclick="trayRemove('${item.id}')" style="padding:6px 10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:#f87171;font-size:12px;cursor:pointer;flex-shrink:0;">✕</button>
      </div>
    </div>`).join('');

  // Update count badge
  const badge = document.getElementById('tray-filter-count');
  if (badge) {
    badge.textContent = tray.length < raw.length ? `${tray.length}/${raw.length} shown` : '';
  }
}

function setTraySort(key) {
  if (traySortBy === key) traySortDir = traySortDir === 'desc' ? 'asc' : 'desc';
  else { traySortBy = key; traySortDir = 'desc'; }
  updateTraySortBtns();
  renderTrayPage();
}
function setTrayFilterDemand(v) { trayFilterDemand = v; updateTrayFilterBtns(); renderTrayPage(); }
function setTrayFilterComp(v)   { trayFilterComp   = v; updateTrayFilterBtns(); renderTrayPage(); }
function setTraySearch(v)       { traySearch = v;       renderTrayPage(); }

function updateTraySortBtns() {
  ['added','probability','demand','competition'].forEach(k => {
    const btn = document.getElementById(`tray-sort-${k}`);
    if (!btn) return;
    const active = traySortBy === k;
    btn.style.background = active ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)';
    btn.style.borderColor = active ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)';
    btn.style.color = active ? '#c4b5fd' : '#64748b';
    btn.textContent = btn.dataset.label + (active ? (traySortDir === 'desc' ? ' ↓' : ' ↑') : '');
  });
}
function updateTrayFilterBtns() {
  ['all','High','Medium','Low'].forEach(v => {
    const btn = document.getElementById(`tray-fd-${v}`);
    if (btn) { const a = trayFilterDemand === v; btn.style.background = a ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)'; btn.style.color = a ? '#34d399' : '#64748b'; }
  });
  ['all','Low','Medium','High'].forEach(v => {
    const btn = document.getElementById(`tray-fc-${v}`);
    if (btn) { const a = trayFilterComp === v; btn.style.background = a ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)'; btn.style.color = a ? '#818cf8' : '#64748b'; }
  });
}

function prefillAndGo(page, inputId, value, switchTo) {
  switchPage(switchTo || page);
  setTimeout(() => {
    const el = document.getElementById(inputId);
    if (el) el.value = value;
  }, 50);
}

function renderSocialTrayPicker() {
  const tray = trayLoad();
  const picker = document.getElementById('social-tray-picker');
  const chips  = document.getElementById('social-tray-chips');
  if (!picker || !chips) return;
  if (tray.length === 0) { picker.style.display = 'none'; return; }
  picker.style.display = 'block';
  chips.innerHTML = tray.map(item => `
    <button onclick="document.getElementById('social-topic').value='${item.title.replace(/'/g,"\\'")}'"
      style="padding:6px 12px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);border-radius:20px;color:#c4b5fd;font-size:12px;cursor:pointer;">
      ${item.title.slice(0,40)}${item.title.length > 40 ? '…' : ''}
    </button>`).join('');
}

// ============ LIBRARY PAGE ============
const TYPE_EMOJI = { idea:'💡', script:'📝', description:'💬', linkedin:'💼', twitter:'🐦', hashtags:'#️⃣' };
const TYPE_COLOR = { idea:'#f59e0b', script:'#8b5cf6', description:'#06b6d4', linkedin:'#3b82f6', twitter:'#22d3ee', hashtags:'#10b981' };

function renderLibrary() {
  const items  = libLoad();
  const search = (document.getElementById('lib-search')?.value || '').toLowerCase();
  const filter = document.getElementById('lib-filter')?.value || 'all';
  const stats  = document.getElementById('lib-stats');
  const list   = document.getElementById('lib-list');
  if (!list) return;

  // Stats row
  if (stats) {
    const types = ['idea','script','description','linkedin','twitter','hashtags'];
    stats.innerHTML = types.map(t => {
      const n = items.filter(i => i.type === t).length;
      return `<div style="background:rgba(255,255,255,0.04);border:1px solid ${n ? TYPE_COLOR[t]+'44' : 'rgba(255,255,255,0.06)'};border-radius:10px;padding:6px 12px;display:flex;align-items:center;gap:6px;">
        <span style="font-size:13px;">${TYPE_EMOJI[t]}</span>
        <span style="font-size:12px;color:#94a3b8;">${t}</span>
        <span style="background:${TYPE_COLOR[t]}33;color:${TYPE_COLOR[t]};border-radius:20px;padding:1px 8px;font-size:11px;font-weight:700;">${n}</span>
      </div>`;
    }).join('');
  }

  // Filter + search
  let visible = items;
  if (filter !== 'all') visible = visible.filter(i => i.type === filter);
  if (search) visible = visible.filter(i =>
    i.title.toLowerCase().includes(search) || i.content.toLowerCase().includes(search));

  if (visible.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:#64748b;">
      ${items.length === 0 ? '<span style="font-size:48px;display:block;margin-bottom:12px;">📭</span><p>Generate scripts, ideas, or social content — they auto-save here</p>'
        : `<p>No results for "${search || filter}"</p>`}
    </div>`;
    return;
  }

  list.innerHTML = visible.map(item => {
    const color = TYPE_COLOR[item.type] || '#888';
    const emoji = TYPE_EMOJI[item.type] || '📄';
    const preview = item.content.slice(0, 120);
    const date = new Date(item.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden;">
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;">
        <span style="font-size:16px;width:30px;height:30px;background:${color}20;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${emoji}</span>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
            <span style="background:${color}25;color:${color};border-radius:6px;padding:1px 8px;font-size:10px;font-weight:700;">${item.type.toUpperCase()}</span>
            <span style="color:#f1f5f9;font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.title}</span>
          </div>
          <p style="color:#64748b;font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${preview}…</p>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <span style="color:#475569;font-size:11px;">${date}</span>
          <button onclick="navigator.clipboard.writeText(${JSON.stringify(item.content)})" style="padding:4px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#94a3b8;font-size:11px;cursor:pointer;">Copy</button>
          <button onclick="deleteLibItem('${item.id}')" style="padding:4px 10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15);border-radius:6px;color:#f87171;font-size:11px;cursor:pointer;">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function deleteLibItem(id) {
  libSave(libLoad().filter(i => i.id !== id));
  renderLibrary();
}

function clearLibrary() {
  if (!confirm('Clear entire Content Library? This cannot be undone.')) return;
  libSave([]);
  renderLibrary();
}

function exportLibrary() {
  const data = JSON.stringify(libLoad(), null, 2);
  const a = document.createElement('a');
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);
  a.download = `creatoros_library_${Date.now()}.json`;
  a.click();
}

// Fetch Analytics
async function fetchAnalytics() {
  const btn = event.target;
  setLoading(btn, true);
  
  try {
    if (window.__TAURI__) {
      const result = await window.__TAURI__.core.invoke('run_youtube_analytics');
      if (result.success) {
        console.log('Analytics fetched:', result.output);
      }
    }
  } catch (e) {
    console.error('Error fetching analytics:', e);
  } finally {
    setLoading(btn, false);
  }
}

// Generate Calendar
async function generateCalendar() {
  const btn = event.target;
  setLoading(btn, true);
  
  try {
    if (window.__TAURI__) {
      const result = await window.__TAURI__.core.invoke('run_content_calendar');
      if (result.success) {
        console.log('Calendar generated:', result.output);
      }
    }
  } catch (e) {
    console.error('Error generating calendar:', e);
  } finally {
    setLoading(btn, false);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('CreatorOS initialized');
  loadYouTubeData();
  loadIdeas();
  updateTrayIndicator();
  renderTrayPage();
  renderSocialTrayPicker();
  renderLibrary();

  // Re-render tray/library when switching to those pages
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page === 'tray')    { renderTrayPage(); updateTrayIndicator(); }
      if (page === 'library') { renderLibrary(); }
      if (page === 'social')  { renderSocialTrayPicker(); }
    });
  });
});

// ============ INSIGHTS PAGE ============

function renderInsights(data) {
  const channel = data.channel || {};
  const videos = Array.isArray(data.videos) ? data.videos : [];
  const subs = channel.subscribers || 359;
  const totalViews = channel.total_views || 9600;
  const videoCount = channel.video_count || 12;
  const watchHours = 430;
  const avgViews = videoCount > 0 ? Math.round(totalViews / videoCount) : 0;
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const avgEng = videos.length > 0
    ? (videos.reduce((s, v) => s + (v.engagement_rate || 0), 0) / videos.length).toFixed(1)
    : '0';
  const subsProgress = Math.min((subs / 500) * 100, 100);
  const hoursProgress = Math.min((watchHours / 4000) * 100, 100);
  const yppProgress = ((subsProgress + hoursProgress) / 2).toFixed(0);

  // YPP Banner
  const yppTitle = document.getElementById('ypp-title');
  const yppDesc = document.getElementById('ypp-desc');
  const yppBar = document.getElementById('ypp-bar');
  const yppPct = document.getElementById('ypp-pct');
  if (yppTitle) yppTitle.textContent = `YouTube Partner Program — ${yppProgress}% Complete`;
  if (yppDesc) yppDesc.textContent = `Need ${500 - subs} more subscribers & ${3000 - watchHours} more watch hours`;
  if (yppBar) yppBar.style.width = `${yppProgress}%`;
  if (yppPct) yppPct.textContent = `${yppProgress}%`;

  // Metrics Grid
  const metricsData = [
    { label: 'Subscribers', value: formatNumber(subs), sub: `${500-subs} to YPP`, emoji: '👥', color: '#ef4444', bar: subsProgress },
    { label: 'Total Views', value: formatNumber(totalViews), sub: 'all time', emoji: '👁️', color: '#8b5cf6', bar: 65 },
    { label: 'Watch Hours', value: formatNumber(watchHours), sub: `${3000-watchHours} to YPP`, emoji: '⏱️', color: '#f97316', bar: hoursProgress },
    { label: 'Videos Published', value: videoCount.toString(), sub: 'on channel', emoji: '🎬', color: '#06b6d4', bar: Math.min((videoCount/24)*100,100) },
    { label: 'Avg Views/Video', value: formatNumber(avgViews), sub: 'per video', emoji: '📊', color: '#10b981', bar: Math.min((avgViews/5000)*100,100) },
    { label: 'Total Likes', value: formatNumber(totalLikes), sub: 'all videos', emoji: '❤️', color: '#ec4899', bar: Math.min((totalLikes/1000)*100,100) },
  ];
  const metricsEl = document.getElementById('insights-metrics');
  if (metricsEl) {
    metricsEl.innerHTML = metricsData.map(m => `
      <div style="background:linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03));border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:22px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <span style="font-size:28px;">${m.emoji}</span>
          <span style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;background:${m.color}22;color:${m.color};border:1px solid ${m.color}44;">${m.sub}</span>
        </div>
        <div style="font-size:30px;font-weight:800;color:white;margin-bottom:4px;">${m.value}</div>
        <div style="font-size:13px;color:#94a3b8;margin-bottom:14px;">${m.label}</div>
        <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${m.bar}%;background:linear-gradient(90deg,${m.color},${m.color}99);border-radius:3px;"></div>
        </div>
      </div>
    `).join('');
  }

  // Goals
  const goalsData = [
    { name: 'YouTube Partner Program', current: subs, target: 500, unit: 'subs', emoji: '🎯', pct: subsProgress },
    { name: 'Watch Hours (YPP)', current: watchHours, target: 4000, unit: 'hrs', emoji: '⏱️', pct: hoursProgress },
    { name: '30-Day Video Goal', current: 0, target: 8, unit: 'videos', emoji: '🎬', pct: 0 },
    { name: 'Revenue Goal (Month 1)', current: 0, target: 5000, unit: '₹', emoji: '💰', pct: 0 },
    { name: 'Telegram Community', current: 0, target: 200, unit: 'members', emoji: '✈️', pct: 0 },
  ];
  const goalsEl = document.getElementById('insights-goals');
  if (goalsEl) {
    goalsEl.innerHTML = goalsData.map(g => `
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:#e2e8f0;">
            <span>${g.emoji}</span> ${g.name}
          </span>
          <span style="font-size:12px;color:#64748b;">${g.current} / ${g.target} ${g.unit}</span>
        </div>
        <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${g.pct}%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:4px;min-width:${g.pct>0?'8px':'0'};"></div>
        </div>
        <div style="text-align:right;font-size:11px;color:#475569;margin-top:4px;">${g.pct.toFixed(0)}%</div>
      </div>
    `).join('');
  }

  // Top Video
  const topVideo = videos.length > 0 ? videos.reduce((a, b) => (a.views > b.views ? a : b)) : null;
  const topVideoEl = document.getElementById('insights-top-video');
  if (topVideoEl) {
    topVideoEl.innerHTML = topVideo ? `
      <p style="color:#e2e8f0;font-size:14px;font-weight:500;margin-bottom:12px;line-height:1.4;">${topVideo.title}</p>
      <div style="display:flex;gap:16px;">
        <div style="text-align:center;"><div style="color:#34d399;font-size:22px;font-weight:700;">${formatNumber(topVideo.views)}</div><div style="color:#64748b;font-size:11px;">Views</div></div>
        <div style="text-align:center;"><div style="color:#f472b6;font-size:22px;font-weight:700;">${formatNumber(topVideo.likes||0)}</div><div style="color:#64748b;font-size:11px;">Likes</div></div>
        <div style="text-align:center;"><div style="color:#818cf8;font-size:22px;font-weight:700;">${(topVideo.engagement_rate||0).toFixed(1)}%</div><div style="color:#64748b;font-size:11px;">Eng. Rate</div></div>
      </div>
    ` : `<p style="color:#64748b;font-size:13px;">No video data yet</p>`;
  }

  // Engagement
  const engEl = document.getElementById('insights-engagement');
  const engSub = document.getElementById('insights-eng-sub');
  if (engEl) engEl.textContent = `${avgEng}%`;
  if (engSub) engSub.textContent = `across ${videos.length} videos`;

  // Video Table
  const tableEl = document.getElementById('insights-video-table');
  if (tableEl) {
    const sorted = [...videos].sort((a,b) => b.views - a.views).slice(0, 8);
    tableEl.innerHTML = sorted.length > 0 ? sorted.map((v, i) => `
      <div style="display:flex;align-items:center;gap:16px;padding:14px 16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.06);">
        <span style="width:28px;height:28px;border-radius:8px;background:${i===0?'linear-gradient(135deg,#fbbf24,#f97316)':'rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:700;flex-shrink:0;">#${i+1}</span>
        <p style="flex:1;color:#e2e8f0;font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${v.title}</p>
        <div style="display:flex;gap:20px;flex-shrink:0;">
          <div style="text-align:right;"><div style="color:#818cf8;font-weight:600;font-size:14px;">${formatNumber(v.views)}</div><div style="color:#475569;font-size:11px;">views</div></div>
          <div style="text-align:right;"><div style="color:#f472b6;font-weight:600;font-size:14px;">${formatNumber(v.likes||0)}</div><div style="color:#475569;font-size:11px;">likes</div></div>
          <div style="text-align:right;"><div style="color:#34d399;font-weight:600;font-size:14px;">${(v.engagement_rate||0).toFixed(1)}%</div><div style="color:#475569;font-size:11px;">eng.</div></div>
        </div>
      </div>
    `).join('') : `<p style="color:#64748b;text-align:center;padding:20px;font-size:13px;">No video data found. Run YouTube Analytics first.</p>`;
  }
}
// Load YouTube Data from shared JSON file
async function loadYouTubeData() {
  try {
    let data = null;
    
    if (window.__TAURI__) {
      // In Tauri, read from the shared data file
      const result = await window.__TAURI__.core.invoke('read_youtube_data');
      if (result.success) {
        data = JSON.parse(result.data);
      }
    } else {
      // For browser testing, use mock data
      data = {
        channel: { name: "Anshuman Parmar", subscribers: 359, total_views: 9600, video_count: 12 },
        videos: [
          { title: "How to Build AI Apps with Claude", views: 2500, thumbnail: "https://i.ytimg.com/vi/kx3d2yOV2Y4/hqdefault.jpg" },
          { title: "Cursor IDE Tutorial for Beginners", views: 1800, thumbnail: "https://i.ytimg.com/vi/lnuYflfGRTc/hqdefault.jpg" },
          { title: "N8N Automation Workflow Guide", views: 1200, thumbnail: "https://i.ytimg.com/vi/ZQ9wmN_oLXg/hqdefault.jpg" }
        ]
      };
    }
    
    if (data) {
      updateDashboardStats(data);
      renderVideos(data.videos || []);
      renderInsights(data);
    }
  } catch (e) {
    console.error('Error loading YouTube data:', e);
    renderVideosError();
  }
}

// Update dashboard stats
function updateDashboardStats(data) {
  const channel = data.channel || {};
  
  // Update dashboard stats
  const subsCount = document.getElementById('subs-count');
  if (subsCount) subsCount.textContent = formatNumber(channel.subscribers || 359);
  
  const viewsCount = document.getElementById('views-count');
  if (viewsCount) viewsCount.textContent = formatNumber(channel.total_views || 9600);
  
  // Update YouTube page stats
  const ytSubs = document.getElementById('yt-subs');
  if (ytSubs) ytSubs.textContent = formatNumber(channel.subscribers || 359);
  
  const ytViews = document.getElementById('yt-views');
  if (ytViews) ytViews.textContent = formatNumber(channel.total_views || 9600);
  
  const ytVideos = document.getElementById('yt-videos');
  if (ytVideos) ytVideos.textContent = channel.video_count || 12;
}

// Format number (e.g., 9600 -> 9.6K)
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Render videos to both dashboard and YouTube page
function renderVideos(videos) {
  const dashboardContainer = document.getElementById('dashboard-videos');
  const youtubeContainer = document.getElementById('youtube-videos');
  
  if (!videos || videos.length === 0) {
    const emptyHtml = `
      <div style="text-align: center; padding: 40px; color: #64748b;">
        <span style="font-size: 32px; display: block; margin-bottom: 8px;">📹</span>
        No videos found. Run YouTube Analytics to fetch your videos.
      </div>
    `;
    if (dashboardContainer) dashboardContainer.innerHTML = emptyHtml;
    if (youtubeContainer) youtubeContainer.innerHTML = emptyHtml;
    return;
  }
  
  // Render top 3 videos on dashboard
  const topVideos = videos.slice(0, 3);
  if (dashboardContainer) {
    dashboardContainer.innerHTML = topVideos.map(video => createVideoCard(video)).join('');
  }
  
  // Render all videos on YouTube page
  if (youtubeContainer) {
    youtubeContainer.innerHTML = videos.map(video => createVideoCard(video)).join('');
  }
}

// Create video card HTML
function createVideoCard(video) {
  const thumbnail = video.thumbnail || '';
  const title = video.title || 'Untitled Video';
  const views = formatNumber(video.views || 0);
  
  return `
    <div class="video-list-item">
      <div style="width: 96px; height: 54px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: rgba(255,255,255,0.1);">
        ${thumbnail ? 
          `<img src="${thumbnail}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;\\'>🎬</div>'">` : 
          `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🎬</div>`
        }
      </div>
      <div style="flex: 1; min-width: 0;">
        <p style="color: white; font-weight: 500; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 4px;">👁️ ${views} views</p>
      </div>
    </div>
  `;
}

// Render error state
function renderVideosError() {
  const errorHtml = `
    <div style="text-align: center; padding: 40px; color: #f87171;">
      <span style="font-size: 32px; display: block; margin-bottom: 8px;">⚠️</span>
      Failed to load videos. Please try refreshing.
    </div>
  `;
  const dashboardContainer = document.getElementById('dashboard-videos');
  const youtubeContainer = document.getElementById('youtube-videos');
  if (dashboardContainer) dashboardContainer.innerHTML = errorHtml;
  if (youtubeContainer) youtubeContainer.innerHTML = errorHtml;
}
