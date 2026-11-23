import { decryptStatus } from './viewer-crypto.js';
export const READ_ONLY = globalThis.READ_ONLY_VIEWER === true;
let latest, failed = false;
export function installViewerGuard() {
  if (!READ_ONLY) return;
  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (input, init = {}) => {
    const request = input instanceof Request ? input : null;
    const url = new URL(request?.url ?? input, location.href);
    if ((init.method ?? request?.method ?? 'GET').toUpperCase() !== 'GET' || url.origin !== location.origin || /\/(api|ws|files)(\/|$)/.test(url.pathname)) return Promise.reject(new Error('Read-only viewer: request blocked'));
    return originalFetch(input, init);
  };
  globalThis.WebSocket = class { constructor() { throw new Error('Read-only viewer: WebSocket disabled'); } };
  const style = document.createElement('style');
  style.textContent = '#btn-brief,#btn-add,#btn-attach,#btn-depts,#btn-cost,#p-stop,#p-reset,#p-edit,#p-del,#composer,#perms,#toolbar a,#modal{display:none!important}';
  document.head.append(style);
  const badge = document.createElement('div'); badge.id = 'viewer-status'; badge.className = 'eyebrow';
  document.querySelector('#hud').prepend(badge);
  const update = () => { badge.textContent = `READ-ONLY LIVE VIEW · ${latest ? `Updated ${Math.max(0, Math.floor((Date.now() - Date.parse(latest)) / 1000))}s ago` : 'Waiting for snapshot'}${failed ? ' · update failed' : ''}`; };
  update(); setInterval(update, 1000);
}
let layout;
export async function viewerState() {
  try {
    layout ??= await fetch('./viewer-layout.json').then(r => { if (!r.ok) throw Error('Layout unavailable'); return r.json(); });
    let response = await fetch('./live-status.json?t=' + Date.now(), { cache: 'no-store' });
    let data;
    if (response.status === 404) {
      response = await fetch('./live-status.enc.json?t=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw Error('Snapshot unavailable');
      const envelope = await response.json();
      let pass = sessionStorage.getItem('live-viewer-passphrase');
      if (!pass) pass = prompt('Live viewer passphrase');
      if (!pass) throw Error('Passphrase required');
      try { data = await decryptStatus(envelope, pass); sessionStorage.setItem('live-viewer-passphrase', pass); }
      catch { sessionStorage.removeItem('live-viewer-passphrase'); throw Error('Unable to decrypt snapshot'); }
    } else {
      if (!response.ok) throw Error('Snapshot unavailable');
      data = await response.json();
    }
    const tasks = [...data.activeTasks, ...data.recentTasks].map(t => ({ ...t, startedAt: Date.parse(t.startedAt) || null, updatedAt: Date.parse(t.updatedAt) || null, finishedAt: ['done', 'failed', 'cancelled'].includes(t.status) ? Date.parse(t.updatedAt) : null }));
    const agents = data.agents.map(a => ({ ...a, status: a.state, provider: '', departmentId: layout.seats[a.id] ?? layout.departments.find(d => d.style?.shape === 'zone')?.id, currentTask: tasks.find(t => t.id === a.currentTaskId), queued: tasks.filter(t => t.agentId === a.id && t.status === 'queued').length }));
    latest = data.updatedAt; failed = false;
    return { departments: layout.departments, agents, tasks, permissions: [], feed: [] };
  } catch (error) { failed = true; throw error; }
}
