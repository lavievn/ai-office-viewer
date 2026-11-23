// Ứng dụng văn phòng ảo: dữ liệu, WebSocket, HUD, panel nhân viên, modal. Cảnh 3D nằm trong scene/office3d.js
import { Office3D, QUALITY } from './scene/office3d.js';

import { READ_ONLY, installViewerGuard, viewerState } from './viewer.js';
installViewerGuard();

const TOKEN = document.querySelector('meta[name="office-token"]').content;
const PROVIDER_LABEL = {
  'local-openai': 'Local LM Studio',
  'ollama': 'Ollama nhà trồng',
  'gemini': 'Gemini API',
  'openai-agent': 'API ngoài (OpenAI)',
  'anthropic-agent': 'API ngoài (Claude)',
  'claude-code': 'Claude Code',
  'codex': 'OpenAI Codex',
  'anthropic-chat': 'Claude chat',
  'openai-chat': 'OpenAI chat',
  'external-worker': 'Antigravity (Neon)',
  'observer': 'Hóng phiên',
};
const STATUS_LABEL = {
  idle: 'Đang lười',
  queued: 'Xếp hàng chờ dí',
  working: 'Đang còng lưng',
  waiting: 'Giơ tay xin phép',
  error: 'Đang toang',
  offline: 'Cúp điện',
};
const SHAPES = {
  zone: 'Chuồng cày việc',
  lounge: 'Khu ngồi chém gió',
  room: 'Phòng họp kín soi KPI',
  cafe: 'Quầy cà phê trốn việc',
  game: 'Góc máy game xả xì-trét',
};
const AMENITY = new Set(['cafe', 'game']);   // khu nghỉ: không xếp nhân viên vào
const THEMES = { docs: 'Văn bản', code: 'Code', design: 'Thiết kế', charts: 'Biểu đồ', media: 'Mạng xã hội', video: 'Dựng phim' };

// ---------------- Tiện ích
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hhmm = (ts) => new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const ago = (ts) => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'vừa xong' : m < 60 ? `${m} phút trước` : m < 1440 ? `${Math.round(m / 60)} giờ trước` : `${Math.round(m / 1440)} ngày trước`; };
const tagAgent = (a, fallbackId = '') => {
  if (!a) return fallbackId || 'đứa nào đó';
  const p = a.model && a.model !== 'auto' ? a.model : (PROVIDER_LABEL[a.provider] ?? a.provider);
  return `${a.name} (${p})`;
};
function toast(msg, ms = 3400) { const t = $('#toast'); t.textContent = msg; t.style.display = 'block'; clearTimeout(toast._t); toast._t = setTimeout(() => t.style.display = 'none', ms); }
async function api(path, method = 'GET', body) {
  if (READ_ONLY) {
    if (method !== 'GET') throw new Error('Read-only viewer');
    if (path === '/state') return viewerState();
    return [];
  }
  const r = await fetch('/api' + path, { method, headers: { 'content-type': 'application/json', 'x-office-token': TOKEN }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}

// ---------------- Tệp đính kèm (dán ảnh, kéo thả, chọn tệp)
const fmtSize = (n) => n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB';
const fileUrl = (a) => `/files/${a.id}/${encodeURIComponent(a.name)}?t=${encodeURIComponent(TOKEN)}`;
const extOf = (n) => (String(n).split('.').pop() || '').slice(0, 4);
const MAX_FILES = 10, MAX_SIZE = 25 * 1024 * 1024;

/** Khay đính kèm gắn vào 1 ô nhập: dán / kéo thả / nút chọn tệp, tự tải lên ngay */
function makeTray({ list: listEl, input, dropZone, fileInput, button }) {
  const items = [];
  const render = () => {
    listEl.innerHTML = items.map((it, i) => `
      <div class="att ${it.status === 'uploading' ? 'uploading' : ''} ${it.status === 'error' ? 'err' : ''}" title="${esc(it.name)}">
        ${it.preview ? `<img src="${it.preview}" alt="" />` : `<div class="ficon">${esc(extOf(it.name))}</div>`}
        <div class="nm">${esc(it.name)}<small>${it.status === 'uploading' ? 'đang đẩy lên…' : it.status === 'error' ? 'rớt mạng rồi' : fmtSize(it.size)}</small></div>
        <button class="x" type="button" data-rm="${i}" title="Bỏ tệp">×</button>
      </div>`).join('');
  };
  listEl.addEventListener('click', e => {
    const b = e.target.closest('[data-rm]'); if (!b) return;
    const [it] = items.splice(+b.dataset.rm, 1);
    if (it?.preview) URL.revokeObjectURL(it.preview);
    render();
  });
  async function add(files) {
    for (const f of files) {
      if (items.length >= MAX_FILES) { toast(`Tối đa ${MAX_FILES} tệp một kèo thôi sếp ơi`); break; }
      if (f.size > MAX_SIZE) { toast(`${f.name} nặng quá (tối đa 25MB thôi)`); continue; }
      let name = f.name || 'tep';
      if (/^image\.(png|jpe?g|gif|webp)$/i.test(name) || !f.name) { // ảnh dán từ clipboard
        const d = new Date(); const p = (n) => String(n).padStart(2, '0');
        name = `anh-dan-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.${(f.type.split('/')[1] || 'png').replace('jpeg', 'jpg')}`;
      }
      const it = { name, size: f.size, mime: f.type, status: 'uploading', preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null };
      items.push(it); render();
      try {
        const r = await fetch('/api/uploads', { method: 'POST', body: f, headers: {
          'x-office-token': TOKEN, 'content-type': 'application/octet-stream', 'x-filename': encodeURIComponent(name), 'x-mime': f.type || '' } });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || r.statusText);
        it.id = j.id; it.status = 'ok';
      } catch (err) { it.status = 'error'; toast(`Đẩy ${name} lên xịt rồi: ${err.message}`); }
      render();
    }
  }
  input.addEventListener('paste', e => {
    const files = [...(e.clipboardData?.files ?? [])];
    if (!files.length) return;
    if (!e.clipboardData.getData('text/plain')) e.preventDefault(); // chỉ có ảnh → không dán chữ rác
    add(files);
  });
  let depth = 0;
  const hasFiles = (e) => [...(e.dataTransfer?.types ?? [])].includes('Files');
  dropZone.addEventListener('dragenter', e => { if (!hasFiles(e)) return; e.preventDefault(); depth++; dropZone.classList.add('dragging'); });
  dropZone.addEventListener('dragover', e => { if (hasFiles(e)) e.preventDefault(); });
  dropZone.addEventListener('dragleave', () => { if (--depth <= 0) { depth = 0; dropZone.classList.remove('dragging'); } });
  dropZone.addEventListener('drop', e => {
    if (!hasFiles(e)) return; e.preventDefault(); depth = 0; dropZone.classList.remove('dragging');
    add([...e.dataTransfer.files]);
  });
  button.onclick = () => fileInput.click();
  fileInput.onchange = () => { add([...fileInput.files]); fileInput.value = ''; };
  return {
    busy: () => items.some(it => it.status === 'uploading'),
    ids: () => items.filter(it => it.status === 'ok').map(it => it.id),
    count: () => items.filter(it => it.status === 'ok').length,
    clear: () => { items.forEach(it => it.preview && URL.revokeObjectURL(it.preview)); items.length = 0; render(); },
  };
}
const attHtml = (atts) => atts?.length ? `<div class="ev-atts">${atts.map(a => /^image\//.test(a.mime)
  ? `<a class="img" href="${fileUrl(a)}" target="_blank" rel="noopener" title="${esc(a.name)}"><img src="${fileUrl(a)}" alt="${esc(a.name)}" loading="lazy" /></a>`
  : `<a href="${fileUrl(a)}" title="Tải ${esc(a.name)}"><div class="ficon">${esc(extOf(a.name))}</div><span>${esc(a.name)}</span></a>`).join('')}</div>` : '';

// ---------------- Trạng thái
const state = { departments: [], agents: [], tasks: [], permissions: [], feed: [], providers: [], usageToday: null };
const fmtTok = (n) => !n ? '0' : n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'k' : String(Math.round(n));
const fmtUsd = (v) => v >= 100 ? '$' + v.toFixed(0) : v >= 1 ? '$' + v.toFixed(2) : v > 0 ? '$' + v.toFixed(3) : '$0';
const fmtVnd = (v, rate) => rate ? ' · ' + Math.round(v * rate).toLocaleString('vi-VN') + '₫' : '';
const usageOf = (id) => state.usageToday?.agents.find(a => a.agentId === id);
let selectedId = null;
const agentById = (id) => state.agents.find(a => a.id === id);
const deptById = (id) => state.departments.find(d => d.id === id);

// ---------------- Cảnh 3D
const params = new URLSearchParams(location.search);
const office = new Office3D($('#stage'), {
  onPick: (id) => openPanel(id),
  onProgress: (msg) => { $('#loading-text').textContent = msg; },
});
if (params.get('q') && QUALITY[params.get('q')]) office.quality = params.get('q');
if (params.get('auto') === '0') office.autoQuality = false;
if (params.get('nghi') === 'nhanh') office.leisureSpeed = 10;   // thử nhanh cảnh đi nghỉ
office.onLeisure = () => renderHud();
office.onQualityAuto = (q) => { renderQuality(); toast(`VGA hơi thở dốc — tự hạ đồ họa xuống "${QUALITY[q]}" cho mượt nhé sếp`); };
office.onDroneTarget = (id) => {
  // Không tự nhảy panel nếu sếp đang gõ dở hoặc mở modal hoặc tự bấm khóa 1 nhân viên
  if ($('#modal').classList.contains('open')) return;
  if (panelManualLock) return;
  const input = $('#p-input');
  if (input && (document.activeElement === input || input.value.trim() || panelTray.count())) return;
  if (!id) {
    if (selectedId) closePanel({ fromDrone: true });
    return;
  }
  if (selectedId !== id) openPanel(id, { fromDrone: true });
};

function renderQuality() { $('#btn-quality').textContent = `Đồ họa: ${QUALITY[office.quality]}`; }
function renderDrone() {
  office.initDroneState?.();
  const on = office.drone?.enabled !== false;
  const b = $('#btn-drone');
  if (!b) return;
  b.textContent = on ? 'Drone: Bật' : 'Drone: Tắt';
  b.classList.toggle('primary', on);
}
$('#btn-drone').onclick = () => {
  const on = office.setDroneEnabled(!(office.drone?.enabled !== false));
  renderDrone();
  toast(on ? 'Đã thả Drone bay tuần tra khắp động code!' : 'Đã thu hồi Drone — sếp tự cầm lái camera nhé');
};
$('#btn-quality').onclick = () => {
  const order = ['high', 'medium', 'low'];
  office.autoQuality = false;
  office.applyQuality(order[(order.indexOf(office.quality) + 1) % 3]);
  renderQuality();
};
$('#btn-overview').onclick = () => office.overview();

// Menu tiện ích gọn trong toolbar (tránh tràn đè lên HUD bên trái)
const toolsMenuBtn = $('#btn-tools-menu');
const toolsMenu = $('#toolbar-menu');
function closeToolsMenu() {
  if (!toolsMenu) return;
  toolsMenu.classList.remove('open');
  toolsMenuBtn?.setAttribute('aria-expanded', 'false');
}
if (toolsMenuBtn && toolsMenu) {
  toolsMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = toolsMenu.classList.toggle('open');
    toolsMenuBtn.setAttribute('aria-expanded', String(open));
  });
  toolsMenu.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn && btn.id !== 'btn-quality') closeToolsMenu();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tb-menu-wrap')) closeToolsMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeToolsMenu();
  });
}

// Thu gọn / mở rộng danh sách task bên trái
const taskBoardEl = $('#task-board');
const taskBoardToggle = $('#btn-tb-toggle');
if (taskBoardEl && taskBoardToggle) {
  taskBoardToggle.onclick = () => {
    const collapsed = taskBoardEl.classList.toggle('collapsed');
    taskBoardToggle.textContent = collapsed ? '▸' : '▾';
  };
}

// ---------------- Danh sách task dọc bên trái (Đang chạy -> Xếp hàng -> Hoàn thành -> Thất bại)
const TASK_STATUS_RANK = {
  running: 0,
  queued: 1,
  paused: 1,
  done: 2,
  failed: 3,
  cancelled: 3,
};
const TASK_STATUS_LABEL = {
  running: 'Đang chạy',
  queued: 'Xếp hàng',
  paused: 'Tạm dừng',
  done: 'Hoàn thành',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};

function taskStatusIconHtml(status) {
  if (status === 'running') {
    return `<span class="task-row-icon" title="Đang thực hiện"><span class="task-spinner"></span></span>`;
  }
  if (status === 'queued' || status === 'paused') {
    return `<span class="task-row-icon task-icon-queued" title="${status === 'paused' ? 'Tạm dừng' : 'Đang xếp hàng'}">
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
        <path d="M3 4.5h10M3 8h10M3 11.5h7"/>
      </svg>
    </span>`;
  }
  if (status === 'done') {
    return `<span class="task-row-icon task-icon-done" title="Đã hoàn thành">
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3.2 8.4l3.1 3.1 6.5-6.8"/>
      </svg>
    </span>`;
  }
  return `<span class="task-row-icon task-icon-failed" title="${status === 'cancelled' ? 'Đã hủy' : 'Thất bại'}">
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
      <path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6"/>
    </svg>
  </span>`;
}

function renderTaskBoard() {
  const listEl = $('#task-list');
  const statsEl = $('#task-board-stats');
  if (!listEl) return;

  const tasks = Array.isArray(state.tasks) ? [...state.tasks] : [];
  let nRun = 0, nQueued = 0, nDone = 0, nFail = 0;
  for (const t of tasks) {
    if (t.status === 'running') nRun++;
    else if (t.status === 'queued' || t.status === 'paused') nQueued++;
    else if (t.status === 'done') nDone++;
    else nFail++;
  }

  if (statsEl) {
    const parts = [];
    if (nRun) parts.push(`<span class="tb-pill run" title="Đang chạy">● ${nRun}</span>`);
    if (nQueued) parts.push(`<span class="tb-pill q" title="Đang xếp hàng">▪ ${nQueued}</span>`);
    if (nDone) parts.push(`<span class="tb-pill ok" title="Đã xong">✓ ${nDone}</span>`);
    if (nFail) parts.push(`<span class="tb-pill err" title="Thất bại">✕ ${nFail}</span>`);
    statsEl.innerHTML = parts.length ? parts.join('') : '<span class="tb-pill">0 kèo</span>';
  }

  if (!tasks.length) {
    listEl.innerHTML = '<div class="task-empty">Chưa có kèo nào trong danh sách.</div>';
    return;
  }

  tasks.sort((a, b) => {
    const ra = TASK_STATUS_RANK[a.status] ?? 4;
    const rb = TASK_STATUS_RANK[b.status] ?? 4;
    if (ra !== rb) return ra - rb;
    // Hàng đợi xếp FIFO (vào trước chạy trước); nhóm chạy/xong/lỗi xếp mới nhất lên trên
    if (ra === 1) return (a.createdAt || 0) - (b.createdAt || 0);
    const ta = a.finishedAt || a.startedAt || a.createdAt || 0;
    const tb = b.finishedAt || b.startedAt || b.createdAt || 0;
    return tb - ta;
  });

  const prevScroll = listEl.scrollTop;
  listEl.innerHTML = tasks.map(t => {
    const ag = agentById(t.agentId);
    const who = ag ? ag.name : (t.agentId || 'Chưa rõ');
    const title = (t.title || t.prompt || 'Kèo không tên').trim();
    const stLabel = TASK_STATUS_LABEL[t.status] ?? t.status;
    const refTs = t.finishedAt || t.startedAt || t.createdAt;
    const timeStr = refTs ? ago(refTs) : '';
    const errTip = t.error ? ` — Lỗi: ${t.error.slice(0, 140)}` : '';
    return `
      <button type="button" class="task-row st-${esc(t.status)}" data-task-id="${esc(t.id)}" data-task-agent="${esc(t.agentId || '')}" title="${esc(title)} (${esc(who)} · ${esc(stLabel)}${esc(errTip)})">
        <div class="task-row-info">
          <div class="task-row-title">${esc(title)}</div>
          <div class="task-row-meta"><b>${esc(who)}</b> · ${esc(stLabel)}${timeStr ? ` · ${esc(timeStr)}` : ''}</div>
        </div>
        ${taskStatusIconHtml(t.status)}
      </button>`;
  }).join('');
  listEl.scrollTop = prevScroll;
}

$('#task-list')?.addEventListener('click', (e) => {
  const row = e.target.closest('.task-row');
  if (!row) return;
  if (READ_ONLY) { selectedTaskId = row.dataset.taskId; renderViewerTask(); return; }
  const aid = row.dataset.taskAgent;
  if (aid && agentById(aid)) {
    openPanel(aid);
    office.flyTo(aid);
  }
});

let selectedTaskId = null;
function renderViewerTask() {
  const t = state.tasks.find(t => t.id === selectedTaskId); if (!t) return;
  openModal(`<h3>${esc(t.title)}</h3><p>${esc(t.status)} · ${esc(agentById(t.agentId)?.name ?? '')} · ${t.durationSec ?? 0}s</p><p>${esc(t.startedAt ? new Date(t.startedAt).toLocaleString() : '')}</p><p>${esc(t.summary ?? '')}</p><h4>Phản hồi / Kết quả</h4><pre style="white-space:pre-wrap">${esc(t.response ?? '')}</pre><h4>Reviewer verdict</h4><p>${esc(t.reviewerVerdict ?? '')}</p><button class="btn" data-close>Đóng</button>`);
  $('#modal').querySelector('[data-close]').addEventListener('click', () => { selectedTaskId = null; });
}
// ---------------- HUD & feed (ngôn ngữ cợt nhả cho riêng màn 3D)
function isReviewerAgent(a) {
  return /review/i.test(a?.id || '') || /review/i.test(a?.role || '') || /review/i.test(a?.name || '');
}
function renderHud() {
  const working = state.agents.filter(a => a.status === 'working' || a.status === 'waiting');
  const waiting = working.find(a => a.status === 'waiting');
  const lead = waiting ?? working[0];
  if (waiting) {
    $('#hud-title').textContent = `Sếp ơi! ${waiting.name} giơ tay xin phép kìa`;
    $('#hud-sub').textContent = `Ông ${tagAgent(waiting)} đang đòi chạy lệnh ngoài luồng — sếp vào ký giấy hay đuổi về bàn?`;
  } else if (working.length >= 2) {
    const names = working.map(a => tagAgent(a)).join(' + ');
    $('#hud-title').textContent = `Căng đét! ${working.length} đứa đang cày song song`;
    $('#hud-sub').textContent = `Sếp dí deadline tới tấp — ${names} đang gõ muốn rụng ngón!`;
  } else if (lead) {
    const task = lead.currentTask;
    const shortTitle = (task?.title || task?.prompt || '').slice(0, 88);
    if (task?.failoverCount > 0) {
      $('#hud-title').textContent = `${lead.name} vừa bị gọi vào gánh kèo hộ!`;
      $('#hud-sub').textContent = `Ông trước vừa cạn quota, ${tagAgent(lead)} phải nhảy vào gánh tiếp: ${shortTitle || 'đống deadline của sếp'}`;
    } else if (isReviewerAgent(lead) || /^Review:/i.test(task?.title || '')) {
      $('#hud-title').textContent = `${lead.name} đang vạch lá tìm sâu…`;
      $('#hud-sub').textContent = `Đội code vừa nộp bài, giờ tới lượt ${tagAgent(lead)} soi từng dòng xem có lòi bug không!`;
    } else {
      $('#hud-title').textContent = `Sếp vừa dí kèo cho ${lead.name}!`;
      $('#hud-sub').textContent = shortTitle ? `${tagAgent(lead)} đang còng lưng cày: ${shortTitle}` : `${tagAgent(lead)} đang cắm mặt gõ code không dám ngẩng đầu.`;
    }
  } else if (state.agents.length) {
    const now = Date.now();
    const cooling = state.agents.filter(a => a.cooldownUntil && a.cooldownUntil > now);
    const qPending = state.agents.reduce((s, a) => s + (a.queued || 0), 0);
    const fmtWait = (ms) => {
      const totalMin = Math.max(1, Math.ceil(ms / 60_000));
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return h > 0 ? (m > 0 ? `${h}g ${m}p` : `${h}g`) : `${totalMin}p`;
    };
    const nextUntil = cooling.length ? Math.min(...cooling.map(a => a.cooldownUntil)) : null;
    const baseStrike = 'Nhân viên đang đình công vì sếp chưa mua cơm cho nhân viên, các fú ông fú bà nào hảo tâm thì cho tụi em bữa cơm lấy sức chạy đi';
    $('#hud-title').textContent = cooling.length
      ? '🚨 Nhân viên đang đình công đòi cơm!'
      : '🍜 Nhân viên đang đình công chờ cơm!';
    $('#hud-sub').textContent = nextUntil
      ? `${baseStrike} (⏳ Thử hồi sức sau ~${fmtWait(nextUntil - now)}${qPending ? ` · còn ${qPending} kèo xếp hàng` : ''})`
      : baseStrike;
  } else {
    $('#hud-title').textContent = 'Văn phòng trống huơ trống hoác';
    $('#hud-sub').textContent = 'Bấm "+ Tuyển lính" để rước nhân viên đầu tiên về cày giúp sếp.';
  }

  const q = state.agents.reduce((s, a) => s + (a.queued || 0), 0);
  const t = state.usageToday?.total;
  const spend = t && (t.input + t.output) > 0 ? ` · Đốt ${fmtTok(t.input + t.output + t.cacheRead + t.cacheWrite)} token${t.costUsd > 0 ? ' (~' + fmtUsd(t.costUsd) + ')' : ''}` : '';
  const lc = office.leisureCounts?.() ?? { cafe: 0, game: 0 };
  const rest = [lc.cafe && `${lc.cafe} đứa trốn uống cà phê`, lc.game && `${lc.game} đứa cắm máy game`].filter(Boolean).join(', ');
  $('#hud-count').textContent = `${working.length} con sen đang cày` + (q ? ` · ${q} kèo xếp hàng` : '') + ` · ${state.agents.length} mạng trong ổ` + (rest ? ` · ${rest}` : '') + spend;
}

/** Chuyển log khô khan thành bản tin hóng drama văn phòng ở góc phải dưới */
function narrateFeedEvent(e) {
  const a = agentById(e.agentId);
  const who = tagAgent(a, e.agentId);
  const txt = String(e.text ?? '');
  const short = txt.replace(/\s+/g, ' ').slice(0, 78);

  if (txt.includes('⏳') || /holding task/i.test(txt)) {
    const mins = e.data?.waitMin ? ` (~${e.data.waitMin}p nữa thử lại)` : '';
    return `🍜 <b>${esc(who)}</b> cạn cơm (quota) rồi — tạm đình công đòi fú ông fú bà nuôi cơm${mins}!`;
  }
  if (txt.includes('⚡') || /failover|cooldown/i.test(txt)) {
    const fb = e.data?.fallbackAgentId ? agentById(e.data.fallbackAgentId) : null;
    if (fb) return `<b>${esc(who)}</b> cạn bình quota rồi — đá banh gấp sang <b>${esc(tagAgent(fb))}</b> gánh hộ!`;
    return `⚡ <b>${esc(who)}</b>: ${esc(short)}`;
  }
  if (e.kind === 'task') {
    if (e.data?.reviewTaskId || /Handed off to reviewer/i.test(txt)) {
      const m = txt.match(/reviewer "([^"]+)"/);
      const rev = m ? agentById(m[1]) : null;
      return `<b>${esc(who)}</b> code xong rồi — vừa đẩy đống này qua cho ông <b>${esc(rev ? tagAgent(rev) : (m?.[1] || 'reviewer'))}</b> soi bug!`;
    }
    if (e.data?.fromAgentId) {
      const from = agentById(e.data.fromAgentId);
      const fromLabel = from ? from.name : e.data.fromAgentId;
      if (isReviewerAgent(a)) return `<b>${esc(fromLabel)}</b> vừa nộp bài, dí sang cho <b>${esc(who)}</b> check kỹ từng dòng!`;
      return `<b>${esc(fromLabel)}</b> vừa đẩy kèo sang bắt <b>${esc(who)}</b> làm tiếp: ${esc(short)}`;
    }
    return `Sếp vừa dí kèo cho <b>${esc(who)}</b>: ${esc(short)}`;
  }
  if (e.kind === 'result') {
    if (isReviewerAgent(a)) return `<b>${esc(who)}</b> soi bài xong rồi — có kết quả báo cáo sếp!`;
    return `<b>${esc(who)}</b> gõ xong thở phào nhẹ nhõm — nộp bài chờ chấm!`;
  }
  if (e.kind === 'permission') {
    return `<b>${esc(who)}</b> đang rón rén giơ tay xin phép sếp bấm nút nguy hiểm!`;
  }
  if (e.kind === 'error') {
    return `Toang nhẹ! <b>${esc(who)}</b> vừa dẫm mìn: ${esc(short)}`;
  }
  return `<b>${esc(who)}</b>: ${esc(short)}`;
}

/** Dòng sự kiện góc dưới: chỉ giữ tin trong 3 phút gần nhất cho đỡ che khu cà phê / giải trí */
function renderFeed() {
  const fresh = READ_ONLY ? state.feed : state.feed.filter(e => Date.now() - e.ts < 180000);
  $('#feed').innerHTML = fresh.slice(-4).map(e => `<div>${hhmm(e.ts)} · ${narrateFeedEvent(e)}</div>`).join('');
}

setInterval(renderFeed, 15000);

// ---------------- Panel nhân viên
let panelManualLock = false;
async function openPanel(id, { fromDrone = false } = {}) {
  panelManualLock = !fromDrone;
  selectedId = id; $('#panel').classList.add('open'); document.body.classList.add('panel-open'); renderPanel(); office.select(id);
  if (!fromDrone) office.setDroneLock(id);
  const evs = READ_ONLY ? agentById(id)?.messages ?? [] : await api(`/agents/${id}/events?limit=200`).catch(() => []);
  if (selectedId !== id) return;
  $('#log').innerHTML = ''; evs.forEach(appendLog); $('#log').scrollTop = 1e9;
}
function closePanel({ fromDrone = false } = {}) {
  panelManualLock = false;
  selectedId = null; $('#panel').classList.remove('open'); document.body.classList.remove('panel-open'); office.select(null);
  if (!fromDrone) {
    office.setDroneLock(null);
    office.pauseDrone(10000);
  }
}
function renderPanel() {
  const a = agentById(selectedId); if (!a) return closePanel();
  $('#p-name').textContent = a.name;
  $('#p-role').textContent = `${a.role || 'Chuyên gia ngồi bàn'} · ${deptById(a.departmentId)?.name ?? ''}`;
  const chips = [
    `<span class="chip status-${a.status}">${STATUS_LABEL[a.status] ?? a.status}</span>`,
    `<span class="chip">${PROVIDER_LABEL[a.provider] ?? a.provider}</span>`,
  ];
  if (a.model) chips.push(`<span class="chip">${esc(a.model)}</span>`);
  if (a.fallbackAgentId) chips.push(`<span class="chip">cứu bồ → ${esc(a.fallbackAgentId)}</span>`);
  if (a.cooldownUntil && a.cooldownUntil > Date.now()) {
    const mins = Math.max(1, Math.ceil((a.cooldownUntil - Date.now()) / 60000));
    chips.push(`<span class="chip status-waiting">hồi mana ${mins}p</span>`);
  }
  if (a.permissionMode && !['anthropic-chat', 'openai-chat', 'observer'].includes(a.provider)) chips.push(`<span class="chip">quyền: ${a.permissionMode}</span>`);
  if (a.sessionId) chips.push(`<span class="chip" title="${esc(a.sessionId)}">phiên ${esc(a.sessionId.split(/[\\/]/).pop().slice(0, 10))}…</span>`);
  if (a.queued) chips.push(`<span class="chip status-queued">${a.queued} kèo xếp hàng</span>`);
  const u = usageOf(a.id);
  if (u) chips.push(`<span class="chip chip-cost" title="Token vào ${fmtTok(u.input)} · ra ${fmtTok(u.output)} · cache ${fmtTok(u.cacheRead + u.cacheWrite)}">Hôm nay đốt: ${fmtTok(u.input + u.output + u.cacheRead + u.cacheWrite)} token${u.costUsd > 0 ? ' · ~' + fmtUsd(u.costUsd) : u.unpriced ? ' · chưa tính tiền' : ''}</span>`);
  $('#p-chips').innerHTML = chips.join('');
  const observer = a.provider === 'observer';
  $('#composer').style.display = observer ? 'none' : 'flex';
  $('#p-stop').style.display = observer ? 'none' : '';
  $('#p-reset').style.display = observer ? 'none' : '';
  if (READ_ONLY) {
    $('#log').innerHTML = '';
    if (a.currentTaskTitle) appendLog({kind:'task',ts:Date.now(),text:a.currentTaskTitle});
    (a.messages ?? []).forEach(appendLog);
  }
  renderPerms();
}
function renderPerms() {
  const list = state.permissions.filter(p => p.agentId === selectedId);
  $('#perms').innerHTML = list.map(p => `
    <div class="perm"><b>Sếp ơi cho em bấm: ${esc(p.tool)}</b>
      <pre>${esc(JSON.stringify(p.input, null, 2).slice(0, 1500))}</pre>
      <button class="btn small primary" data-perm="${p.id}" data-allow="1">Duyệt, quất đi</button>
      <button class="btn small danger" data-perm="${p.id}" data-allow="0">Thôi dẹp</button>
    </div>`).join('');
}
$('#perms').addEventListener('click', async e => {
  const b = e.target.closest('[data-perm]'); if (!b) return;
  b.disabled = true;
  await api(`/permissions/${b.dataset.perm}`, 'POST', { allow: b.dataset.allow === '1' }).catch(err => toast(err.message));
});
function appendLog(e) {
  const el = document.createElement('div'); el.className = `ev k-${e.kind}`;
  el.innerHTML = `<time>${hhmm(e.ts)} · ${e.kind}</time>${esc(e.text)}${attHtml(e.data?.attachments)}`;
  const log = $('#log'); const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
  log.appendChild(el); if (atBottom) log.scrollTop = 1e9;
}
const panelTray = makeTray({ list: $('#p-atts'), input: $('#p-input'), dropZone: $('#composer'), fileInput: $('#p-file'), button: $('#p-attach') });
async function sendTask() {
  const prompt = $('#p-input').value.trim(); if ((!prompt && !panelTray.count()) || !selectedId) return;
  if (panelTray.busy()) return toast('Chờ đẩy tệp lên xong đã sếp ơi');
  $('#p-send').disabled = true;
  try { await api(`/agents/${selectedId}/tasks`, 'POST', { prompt, attachments: panelTray.ids() }); $('#p-input').value = ''; panelTray.clear(); toast('Đã dí kèo thành công!'); }
  catch (err) { toast(err.message); }
  finally { $('#p-send').disabled = false; }
}
$('#p-send').onclick = sendTask;
$('#p-input').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendTask(); });
$('#p-close').onclick = closePanel;
$('#p-focus').onclick = () => selectedId && office.flyTo(selectedId);
$('#p-stop').onclick = () => api(`/agents/${selectedId}/stop`, 'POST').then(r => toast(`Đã kéo phanh gấp${r.cancelledQueued ? `, đá bay ${r.cancelledQueued} kèo đang chờ` : ''}`)).catch(e => toast(e.message));
$('#p-reset').onclick = () => confirm('Tẩy não đứa này để mở phiên trắng tinh? Nó sẽ quên sạch chuyện cũ nhé sếp.') && api(`/agents/${selectedId}/reset`, 'POST').then(() => toast('Đã tẩy não sạch sẽ!')).catch(e => toast(e.message));
$('#p-del').onclick = () => { const a = agentById(selectedId); if (a && confirm(`Sa thải ${a.name} cho ra đảo thật hả sếp?`)) api(`/agents/${a.id}`, 'DELETE').then(() => { closePanel(); toast(`Đã tiễn ${a.name} về vườn!`); }).catch(e => toast(e.message)); };
$('#p-edit').onclick = () => agentForm(agentById(selectedId));

// ---------------- Modal
function openModal(html) { $('#modal-box').innerHTML = html; $('#modal').classList.add('open'); }
function closeModal() { selectedTaskId = null; $('#modal').classList.remove('open'); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.dataset.close !== undefined) closeModal(); });
const opt = (v, cur, label = v) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(label)}</option>`;

function agentForm(a = {}, isEdit = !!a.id && !!agentById(a.id)) {
  const toolProviders = 'claude-code codex local-openai ollama gemini openai-agent anthropic-agent';
  openModal(`
    <h3>${isEdit ? 'Chỉnh hàng nhân viên' : 'Tuyển lính mới về ổ'}</h3>
    <form id="agent-form">
      <div class="row2">
        <div class="field"><label>Tên gọi trong ổ</label><input name="name" required value="${esc(a.name)}" placeholder="VD: Thằng Dev gánh team" /></div>
        <div class="field"><label>Chuồng làm việc</label><select name="departmentId">${state.departments.filter(d => !AMENITY.has(d.style?.shape)).map(d => opt(d.id, a.departmentId, d.name)).join('')}</select></div>
      </div>
      <div class="field"><label>Chức danh</label><input name="role" value="${esc(a.role)}" placeholder="VD: Code thuê, Soi bug, Viết kịch bản" /></div>
      <div class="row2">
        <div class="field"><label>Động cơ AI</label><select name="provider">${state.providers.map(p => opt(p, a.provider ?? 'codex', PROVIDER_LABEL[p] ?? p)).join('')}</select></div>
        <div class="field" data-for="${toolProviders} anthropic-chat openai-chat"><label>Model (bỏ trống = mặc định)</label><input name="model" value="${esc(a.model)}" /></div>
      </div>
      <div class="field" data-for="${toolProviders}"><label>Thư mục cày việc (cwd)</label><input name="cwd" value="${esc(a.cwd)}" placeholder="project-workspace" /><small>Khóa trong thư mục này kẻo nó nghịch lung tung.</small></div>
      <div class="field" data-for="${toolProviders}"><label>Độ liều (Quyền)</label><select name="permissionMode">
        ${opt('default', a.permissionMode ?? 'default', 'Ngoan: sửa gì cũng giơ tay hỏi sếp')}
        ${opt('acceptEdits', a.permissionMode, 'Tự sửa file, chạy lệnh mới hỏi')}
        ${opt('plan', a.permissionMode, 'Chỉ đứng soi & bình luận (read-only)')}
        ${opt('bypassPermissions', a.permissionMode, '⚠ Thả rông toàn quyền, không hỏi')}
      </select></div>
      <div class="field" data-for="observer claude-code codex openai-chat"><label>Session / thread ID ${a.provider === 'observer' ? '(đường dẫn file JSONL)' : '(bỏ trống = mở não mới)'}</label><input name="sessionId" value="${esc(a.sessionId)}" /></div>
      <div class="field" data-for="${toolProviders} anthropic-chat openai-chat"><label>Dặn dò riêng (system prompt)</label><textarea name="systemPrompt">${esc(a.systemPrompt)}</textarea></div>
      <div class="modal-actions"><button type="button" class="btn" data-close>Thôi</button><button class="btn primary">${isEdit ? 'Lưu luôn' : 'Tuyển vào ổ'}</button></div>
    </form>`);
  const form = $('#agent-form');
  const sync = () => { const p = form.provider.value; form.querySelectorAll('[data-for]').forEach(el => el.style.display = el.dataset.for.split(' ').includes(p) ? '' : 'none'); };
  form.provider.onchange = sync; sync();
  form.onsubmit = async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(form));
    try {
      if (body.permissionMode === 'bypassPermissions' && !confirm('Thả rông toàn quyền: đứa này chạy MỌI lệnh không hỏi sếp luôn đó. Chắc chắn chưa?')) return;
      if (isEdit) await api(`/agents/${a.id}`, 'PATCH', body);
      else { const c = await api('/agents', 'POST', body); setTimeout(() => openPanel(c.id), 400); }
      closeModal();
    } catch (err) { toast(err.message); }
  };
}
$('#btn-add').onclick = () => agentForm({ departmentId: state.departments[0]?.id });

// Bắt cóc phiên có sẵn
$('#btn-attach').onclick = async () => {
  openModal('<h3>Bắt cóc phiên terminal</h3><p style="color:var(--muted)">Đang đi rình ~/.claude/projects và ~/.codex/sessions…</p>');
  let list = [];
  try { list = await api('/discover'); } catch (e) { return openModal(`<h3>Toang</h3><p>${esc(e.message)}</p>`); }
  openModal(`
    <h3>Bắt cóc phiên terminal</h3>
    <div class="warnbox"><b>Hóng thôi</b>: chỉ ngồi nhìn phiên ngoài terminal, an toàn tuyệt đối. <b>Chiếm quyền</b>: lôi nó vào văn phòng để dí việc tiếp — nhớ tắt phiên ngoài terminal kẻo hai ông đấm nhau.</div>
    ${list.length ? '' : '<p style="color:var(--muted)">Chẳng thấy phiên nào đang chạy cả sếp ơi.</p>'}
    ${list.map((s, i) => `
      <div class="sess">
        <div class="top"><span>${s.source === 'claude' ? 'Claude Code' : 'Codex'} · ${esc(s.project)}</span><span>${ago(s.mtime)}</span></div>
        <div class="pv">${esc(s.preview || '(im re chẳng có preview)')}</div>
        <button class="btn small" data-i="${i}" data-mode="observe">Hóng thôi</button>
        <button class="btn small" data-i="${i}" data-mode="control">Chiếm quyền</button>
      </div>`).join('')}
    <div class="modal-actions"><button class="btn" data-close>Đóng</button></div>`);
  $('#modal-box').onclick = e => {
    const b = e.target.closest('[data-mode]'); if (!b) return;
    const s = list[+b.dataset.i];
    const name = (s.preview || s.project).slice(0, 28) || 'Phiên';
    const dept = state.departments.find(d => d.id === 'ky-thuat')?.id ?? state.departments[0]?.id;
    $('#modal-box').onclick = null;
    if (b.dataset.mode === 'observe') agentForm({ name, role: 'Phiên đang hóng', departmentId: dept, provider: 'observer', sessionId: s.file }, false);
    else agentForm({ name, role: 'Phiên bị chiếm quyền', departmentId: dept, provider: s.source === 'claude' ? 'claude-code' : 'codex', sessionId: s.sessionId, cwd: s.cwd || '', permissionMode: 'default' }, false);
  };
};

// Dí kèo mới
$('#btn-brief').onclick = () => {
  const lead = state.agents.find(a => a.id === 'dev' && a.provider !== 'observer')
    ?? state.agents.find(a => a.departmentId === 'dieu-phoi' && a.provider !== 'observer')
    ?? state.agents.find(a => a.provider !== 'observer');
  if (!lead) return toast('Chưa có đứa nào trong ổ để dí việc cả sếp ơi');
  openModal(`
    <h3>Dí kèo mới cho lính</h3>
    <form id="brief-form">
      <div class="field"><label>Nạn nhân hôm nay</label><select name="to">${state.agents.filter(a => a.provider !== 'observer').map(a => `<option value="${a.id}" ${a.id === lead.id ? 'selected' : ''}>${esc(tagAgent(a))} — ${esc(deptById(a.departmentId)?.name ?? '')}</option>`).join('')}</select></div>
      <div class="field brief-drop" id="brief-drop"><label>Đống việc sếp muốn dí</label><textarea name="prompt" style="min-height:140px" placeholder="VD: Fix giùm đống bug Save/Load đi, làm xong đẩy qua cho ông reviewer soi lại từng dòng! Dán ảnh Ctrl+V hoặc quăng tệp vào đây luôn."></textarea>
        <div class="drop-hint">Quăng tệp vào đây cho nó làm</div></div>
      <div class="atts" id="brief-atts" style="margin:-4px 0 10px"></div>
      <input type="file" id="brief-file" multiple hidden />
      <div class="modal-actions"><button type="button" class="btn" id="brief-attach" style="margin-right:auto">Đính kèm tệp</button><button type="button" class="btn" data-close>Tha cho nó</button><button class="btn primary">Dí luôn!</button></div>
    </form>`);
  const f0 = $('#brief-form');
  const tray = makeTray({ list: $('#brief-atts'), input: f0.prompt, dropZone: $('#brief-drop'), fileInput: $('#brief-file'), button: $('#brief-attach') });
  f0.onsubmit = async e => {
    e.preventDefault(); const f = e.target;
    if (tray.busy()) return toast('Chờ đẩy tệp lên xong đã sếp ơi');
    try { await api(`/agents/${f.to.value}/tasks`, 'POST', { prompt: f.prompt.value, attachments: tray.ids() }); closeModal(); openPanel(f.to.value); toast('Đã bắn deadline thành công!'); }
    catch (err) { toast(err.message); }
  };
};

// Sửa bố cục phòng ban
$('#btn-depts').onclick = () => {
  const list = state.departments;
  openModal(`
    <h3>Chia chuồng cho anh em</h3>
    <p style="color:var(--muted);margin:0 0 10px;font-size:12.5px">Sàn rộng x −18…18, z −14…14 (mét). Toạ độ là tâm khu vực.</p>
    <form id="dept-form">
      <div class="field"><label>Chọn khu</label><select name="id">${list.map(d => opt(d.id, list[0]?.id, d.name)).join('')}${opt('__new', '', '+ Mở thêm khu mới')}</select></div>
      <div id="dept-fields"></div>
      <div class="modal-actions"><button type="button" class="btn" data-close>Đóng</button><button class="btn primary">Lưu</button></div>
    </form>`);
  const form = $('#dept-form');
  const fill = () => {
    const d = deptById(form.id.value) ?? { id: '', name: '', color: '#6b6f78', x: 0, z: 9, w: 6, d: 4, style: { shape: 'zone', screenTheme: 'docs' } };
    const st = d.style ?? {};
    $('#dept-fields').innerHTML = `
      ${form.id.value === '__new' ? `<div class="field"><label>Mã (không dấu)</label><input name="newId" required pattern="[a-z0-9-]+" /></div>` : ''}
      <div class="row2">
        <div class="field"><label>Tên</label><input name="name" required value="${esc(d.name)}" /></div>
        <div class="field"><label>Chữ in trên sàn</label><input name="label" value="${esc(st.label ?? '')}" placeholder="${esc(d.name)}" /></div>
      </div>
      <div class="row2">
        <div class="field"><label>Kiểu khu vực</label><select name="shape">${Object.entries(SHAPES).map(([k, v]) => opt(k, st.shape ?? 'zone', v)).join('')}</select></div>
        <div class="field"><label>Màn hình hiển thị</label><select name="screenTheme">${Object.entries(THEMES).map(([k, v]) => opt(k, st.screenTheme ?? 'docs', v)).join('')}</select></div>
      </div>
      <div class="row4">
        <div class="field"><label>Tâm x</label><input name="x" type="number" step="0.1" value="${d.x}" /></div>
        <div class="field"><label>Tâm z</label><input name="z" type="number" step="0.1" value="${d.z}" /></div>
        <div class="field"><label>Rộng</label><input name="w" type="number" step="0.1" min="2" value="${d.w}" /></div>
        <div class="field"><label>Sâu</label><input name="d" type="number" step="0.1" min="2" value="${d.d}" /></div>
      </div>
      <div class="field"><label>Màu thảm</label><input name="color" type="color" value="${esc(d.color)}" /></div>`;
  };
  form.id.onchange = fill; fill();
  form.onsubmit = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const id = f.id === '__new' ? f.newId : f.id;
    const prev = deptById(id)?.style ?? {};
    const body = { id, name: f.name, color: f.color, x: +f.x, z: +f.z, w: +f.w, d: +f.d, style: { ...prev, shape: f.shape, screenTheme: f.screenTheme, label: f.label || undefined, seed: prev.seed ?? Math.floor(Math.random() * 1000) } };
    try { await api('/departments', 'POST', body); toast('Đã quy hoạch lại văn phòng!'); closeModal(); }
    catch (err) { toast(err.message); }
  };
};

// ---------------- Token & chi phí
async function loadUsageToday() {
  try { state.usageToday = await api('/usage?range=today'); renderHud(); if (selectedId) renderPanel(); } catch { /* bỏ qua */ }
}
const PROVIDER_SHORT = {
  'local-openai': 'LM Studio', 'ollama': 'Ollama', 'gemini': 'Gemini',
  'openai-agent': 'API OpenAI', 'anthropic-agent': 'API Claude',
  'claude-code': 'Claude Code', 'codex': 'Codex', 'anthropic-chat': 'Claude API', 'openai-chat': 'OpenAI API',
  'external-worker': 'Antigravity (Neon)', 'observer': 'Hóng',
};
let costRange = 'today';
async function renderCost(range = 'today') {
  if (READ_ONLY) {
    const box = $('#cost-box'), d = state.costSummary;
    if (box) box.innerHTML = d ? `<h4>Ước tính (Estimated)</h4><p>Input $${d.inputRate}/1M · Output $${d.outputRate}/1M · Tổng $${d.total.costUsd.toFixed(4)}</p>${d.agents.map(a => `<p>${esc(agentById(a.agentId)?.name ?? a.agentId)}: ${a.totalTokens} tokens · $${a.costUsd.toFixed(4)} ${a.estimated ? '(Estimated)' : ''}</p>`).join('')}` : '<p>Chưa có số liệu</p>';
    return;
  }
  costRange = range;
  const box = $('#cost-box'); if (!box) return;
  let d;
  try { d = await api(`/usage?range=${range}`); } catch (e) { box.innerHTML = `<p>${esc(e.message)}</p>`; return; }
  const rate = d.usdToVnd;
  const tabs = [['today', 'Hôm nay'], ['7d', '7 ngày'], ['30d', '30 ngày'], ['all', 'Từ khai thiên']]
    .map(([k, v]) => `<button class="btn small ${k === range ? 'primary' : ''}" data-range="${k}">${v}</button>`).join('');
  const name = (id) => esc(agentById(id)?.name ?? id + ' (đã về vườn)');
  const costCell = (r) => r.costUsd > 0 ? fmtUsd(r.costUsd) + fmtVnd(r.costUsd, rate) + (r.unpriced ? ' <span class="muted">+ phần chưa có giá</span>' : '') : (r.unpriced ? '<span class="muted">xài ké / chưa có giá</span>' : '$0');
  const rows = d.agents.map(a => `
    <tr class="agent-row"><td><b>${name(a.agentId)}</b><div class="muted">${PROVIDER_SHORT[a.provider] ?? a.provider} · ${a.tasks} kèo</div></td>
      <td>${fmtTok(a.input)}</td><td>${fmtTok(a.output)}</td><td>${fmtTok(a.cacheRead + a.cacheWrite)}</td><td class="num">${costCell(a)}</td></tr>
    ${a.models.map(m => `<tr class="model-row"><td>↳ ${esc(m.model)}</td><td>${fmtTok(m.input)}</td><td>${fmtTok(m.output)}</td><td>${fmtTok(m.cacheRead + m.cacheWrite)}</td><td class="num">${costCell(m)}</td></tr>`).join('')}`).join('');
  const t = d.total;
  const maxDay = Math.max(1, ...d.byDay.map(x => x.tokens));
  const bars = d.byDay.length > 1 ? `<div class="daybars">${d.byDay.map(x => `<div title="${x.day}: ${fmtTok(x.tokens)} token · ${fmtUsd(x.costUsd)}"><span style="height:${Math.max(3, x.tokens / maxDay * 100)}%"></span><em>${x.day.slice(8)}</em></div>`).join('')}</div>` : '';
  box.innerHTML = `
    <div class="cost-tabs">${tabs}</div>
    <div class="cost-total"><div><small>Tổng token đã đốt</small><b>${fmtTok(t.input + t.output + t.cacheRead + t.cacheWrite)}</b></div>
      <div><small>Thiệt hại ước tính</small><b>${fmtUsd(t.costUsd)}${rate ? '<em>' + Math.round(t.costUsd * rate).toLocaleString('vi-VN') + '₫</em>' : ''}</b></div>
      <div><small>Số kèo đã gánh</small><b>${t.tasks}</b></div></div>
    ${bars}
    ${d.agents.length ? `<div class="cost-scroll"><table class="cost-table"><thead><tr><th>Ông nào đốt</th><th>Vào</th><th>Ra</th><th>Cache</th><th class="num">Thiệt hại</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : '<p class="muted">Chưa đứa nào đốt token trong khoảng này — sếp tiết kiệm ghê!</p>'}
    <p class="cost-note">• <b>Gói Subscription (Codex / Claude Code)</b>: số liệu chỉ để soi xem đứa nào đang ngốn hạn mức 5h/tuần mạnh nhất, không bị trừ tiền lẻ.<br>
    • <b>Local LM Studio / Ollama</b>: 0đ hoàn toàn — chỉ tốn tiền điện RTX 2080!<br>
    • Muốn quy đổi tiền cho API ngoài thì điền bảng giá vào <code>pricing.json</code>.</p>`;
  box.querySelectorAll('[data-range]').forEach(b => b.onclick = () => renderCost(b.dataset.range));
}
$('#btn-cost').onclick = () => {
  selectedTaskId = null;
  openModal('<h3>Soi hóa đơn đốt token</h3><div id="cost-box"><p class="muted">Đang cộng sổ…</p></div><div class="modal-actions"><button class="btn" data-close>Đóng sổ</button></div>');
  renderCost('today');
};

// ---------------- Dữ liệu & WebSocket
async function loadState() {
  const s = await api('/state');
  Object.assign(state, s);
  office.setData(state.departments, state.agents);
  renderHud(); renderTaskBoard(); renderFeed(); if (selectedId) renderPanel(); if (READ_ONLY && selectedTaskId && $('#modal').classList.contains('open')) renderViewerTask(); if (READ_ONLY && $('#cost-box')) renderCost();
}
function connect() {
  if (READ_ONLY) {
    const poll = async () => {
      try { await loadState(); $('#loading').classList.add('done'); }
      catch { toast('Live snapshot unavailable; retaining last status'); $('#loading').classList.add('done'); }
      finally { setTimeout(poll, 15000); }
    };
    poll(); return;
  }
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?token=${TOKEN}`);
  ws.onopen = () => loadState().then(() => { $('#loading').classList.add('done'); loadUsageToday(); }).catch(e => toast(e.message));
  ws.onmessage = (m) => {
    const { type, payload } = JSON.parse(m.data);
    if (type === 'status') {
      const a = agentById(payload.agentId);
      if (a) {
        a.status = payload.status;
        office.setStatus(a.id, a.status);
        renderHud();
        if (a.id === selectedId) renderPanel();
        if (payload.status === 'waiting') office.droneFocus(a.id, { priority: 'high' });
        else if (payload.status === 'working') office.droneFocus(a.id, { priority: 'normal' });
      }
      clearTimeout(connect._t); connect._t = setTimeout(() => loadState().catch(() => {}), 400);
    } else if (type === 'event') {
      const evTxt = String(payload.text || '');
      const isFailover = payload.kind === 'system' && evTxt.includes('⚡');
      const isQuotaWait = payload.kind === 'system' && evTxt.includes('⏳');
      if (['task', 'result', 'error', 'permission'].includes(payload.kind) || isFailover || isQuotaWait) {
        state.feed.push(payload); state.feed = state.feed.slice(-30); renderFeed();
      }
      if (payload.kind === 'task' && payload.data?.fromAgentId) office.courier(payload.data.fromAgentId, payload.agentId);
      if (isFailover && payload.data?.fallbackAgentId) {
        office.courier(payload.agentId, payload.data.fallbackAgentId);
        office.droneFocus(payload.data.fallbackAgentId, { priority: 'high' });
      } else if (['message', 'result', 'error', 'permission'].includes(payload.kind)) {
        office.droneFocus(payload.agentId, { priority: 'high' });
      } else if (payload.kind === 'task') {
        office.droneFocus(payload.agentId, { priority: 'normal' });
      }
      if (payload.agentId === selectedId) appendLog(payload);
    } else if (type === 'permission') {
      state.permissions.push(payload); if (payload.agentId === selectedId) renderPerms();
      office.droneFocus(payload.agentId, { priority: 'high' });
      const a = agentById(payload.agentId); toast(`Sếp ơi! ${a?.name ?? payload.agentId} giơ tay xin bấm ${payload.tool} kìa`);
    } else if (type === 'permission-resolved') {
      state.permissions = state.permissions.filter(p => p.id !== payload.id); renderPerms();
    } else if (type === 'usage') {
      clearTimeout(connect._u); connect._u = setTimeout(() => { loadUsageToday(); if ($('#cost-box')) renderCost(costRange); }, 800);
    } else if (type === 'changed') loadState().catch(() => {});
  };
  ws.onclose = () => { $('#hud-title').textContent = 'Động code bị cúp điện, đang kéo cầu dao lại…'; setTimeout(connect, 2000); };
}

// Chờ font tiếng Việt (chữ trên sàn vẽ bằng canvas) rồi mới dựng cảnh
await Promise.all([document.fonts.load('600 64px "Be Vietnam Pro"'), document.fonts.load('400 14px "Be Vietnam Pro"')]).catch(() => {});
await office.init();
renderQuality();
renderDrone();
setInterval(() => { if (state.agents.length) { renderHud(); renderTaskBoard(); } }, 30_000);
window.__office = office; // tiện debug: __office.stats()
connect();

if (READ_ONLY) {
  $('#btn-depts').onclick = () => {
    selectedTaskId = null;
    openModal(`<h3>Phòng ban / Agents</h3>${state.departments.map(d => `<p><b>${esc(d.name)}</b></p>${state.agents.filter(a => a.departmentId === d.id).map(a => `<button class="btn small" data-view-agent="${esc(a.id)}">${esc(a.name)} · ${esc(a.status)}</button>`).join('')}`).join('')}<p><button class="btn" data-close>Đóng</button></p>`);
    $('#modal-box').querySelectorAll('[data-view-agent]').forEach(b => b.onclick = () => { closeModal(); openPanel(b.dataset.viewAgent); office.flyTo(b.dataset.viewAgent); });
  };
}
