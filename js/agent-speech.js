import { personaFor, CAFE_BANTER } from './agent-dialogues.js?v=office-fun-r2';

export const MIN_BUBBLE_INTERVAL_MS = 20000;
export const MAX_BUBBLE_INTERVAL_MS = 30000;
export const BUBBLE_DURATION_MS = 7000;
export const MAX_CONCURRENT_BUBBLES = 4;

export function dialogueState(agent) {
  const s = agent.status ?? agent.state;
  if (['error','blocked','waiting','paused','failed','queued'].includes(s)) return 'error';
  if (['working','running','reviewing','in-progress'].includes(s)) return 'working';
  if (['done','completed'].includes(s) || ['done','completed'].includes(agent.lastTaskStatus)) return 'done';
  return 'idle';
}

// Presentation clock only; task and worker state are never mutated.
export class DialogueDirector {
  constructor(random = Math.random) { this.random = random; this.voices = new Map(); this.nextChat = null; this.lastScript = -1; this.chat = null; }
  interval() { return MIN_BUBBLE_INTERVAL_MS + this.random() * (MAX_BUBBLE_INTERVAL_MS - MIN_BUBBLE_INTERVAL_MS); }
  choose(lines, previous) {
    const choices = lines.filter(text => text !== previous);
    return choices[Math.floor(this.random() * choices.length)] ?? lines[0];
  }
  speak(voice, text, now) {
    const active = [...this.voices.values()].filter(v => v !== voice && !v.hidden && v.revision > 0 && now < v.until + 250).length;
    if (voice.hidden || active >= MAX_CONCURRENT_BUBBLES) return false;
    voice.text = text; voice.since = now; voice.until = now + BUBBLE_DURATION_MS;
    voice.next = now + this.interval(); voice.revision++;
    return true;
  }
  tick(agents, now) {
    const live = new Set(agents.map(a => a.id));
    for (const id of this.voices.keys()) if (!live.has(id)) this.voices.delete(id);
    this.nextChat ??= now + this.interval();
    const cafe = agents.filter(a => a.zone === 'cafe' && ['idle','cafe'].includes(a.status ?? a.state) && dialogueState(a) === 'idle');
    const eligible = new Set(cafe.map(a => a.id));
    if (this.chat && this.chat.pair.some(id => !eligible.has(id))) { this.chat = null; this.nextChat = now + this.interval(); }
    for (const a of agents) {
      const state = dialogueState(a), persona = personaFor(a);
      let v = this.voices.get(a.id);
      if (!v) {
        v = {text:'',state,personaId:persona.personaId,stateSince:now,next:now+this.interval(),until:0,revision:0};
        this.voices.set(a.id,v);
        if (state === 'done') { v.next = now; v.priority = true; }
      }
      let effective = state;
      if (state === 'done' && v.state === 'done' && now - v.stateSince >= 12000) effective = 'idle';
      if (state === 'done' && v.completedTask === a.lastTaskId && v.celebrated) effective = 'idle';
      const changed = effective !== v.state || persona.personaId !== v.personaId;
      if (changed) {
        const celebrationEnded = v.state === 'done' && effective === 'idle';
        if (v.state === 'done') { v.celebrated = true; v.completedTask = a.lastTaskId; }
        if (effective === 'working') v.celebrated = false;
        v.state = effective; v.stateSince = now; v.personaId = persona.personaId;
        // State changes get first chance at a free slot; retire stale text immediately.
        if (!celebrationEnded) { v.next = now; v.until = now; v.priority = true; }
      }
      v.hidden = (a.status ?? a.state) === 'offline';
    }
    if (!this.chat && cafe.length >= 2 && now >= this.nextChat) {
      let pair = null, distance = Infinity;
      for (let i=0;i<cafe.length;i++) for (let j=i+1;j<cafe.length;j++) {
        const a=cafe[i], b=cafe[j], d=Math.hypot((a.x??0)-(b.x??0),(a.z??0)-(b.z??0));
        if (d < distance) { distance=d; pair=[a.id,b.id]; }
      }
      if (pair && distance <= 4) {
        const options=CAFE_BANTER.map((_,i)=>i).filter(i=>i!==this.lastScript);
        const index=options[Math.floor(this.random()*options.length)]; this.lastScript=index;
        this.chat={pair,lines:CAFE_BANTER[index],turn:0,next:now};
      }
    }
    const pending = [...this.voices.values()].filter(v => v.priority && !v.hidden);
    for (const v of pending) if (this.speak(v,this.choose(personaFor({personaId:v.personaId}).dialogues[v.state],v.text),now)) v.priority=false;
    if (this.chat && now >= this.chat.next) {
      const c=this.chat, voice=this.voices.get(c.pair[c.turn%2]);
      if (now >= voice.next && this.speak(voice,c.lines[c.turn],now)) {
        c.turn++; c.next=now+3000+this.random()*1000;
        if(c.turn===c.lines.length) { this.chat=null; this.nextChat=now+this.interval(); }
      }
    }
    for (const a of agents) {
      const v=this.voices.get(a.id);
      if (!v.priority && now >= v.next && !this.chat?.pair.includes(a.id)) this.speak(v,this.choose(personaFor(a).dialogues[v.state],v.text),now);
    }
    return this.voices;
  }
}

export function installSpeechStyle() {
  if (document.getElementById('office-speech-style')) return;
  const style=document.createElement('style'); style.id='office-speech-style';
  style.textContent=` .office-bubble{pointer-events:none;border:1px solid #dcc8a955;border-radius:12px;background:rgba(20,27,40,.88);color:#fff4df;padding:7px 10px;font:500 12px/1.4 "Be Vietnam Pro",sans-serif;box-shadow:0 3px 14px #0005;overflow:hidden;max-width:210px;box-sizing:border-box;transition:opacity .25s,scale .25s;scale:1;opacity:1}.office-bubble>span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-height:2.8em}.office-bubble.fresh{animation:office-say .3s ease-out}.office-bubble.quiet{opacity:0;scale:.94}.office-speech-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3}.office-speech-layer .office-bubble{position:absolute;width:190px;transform:translate(-50%,-100%)}.office-card-speech{margin:6px 0;min-height:32px}@keyframes office-say{from{opacity:0;scale:.94}to{opacity:1;scale:1}}@media(prefers-reduced-motion:reduce){.office-bubble{animation:none!important;transition:none}}`;
  document.head.append(style);
}

export function updateBubble(el, voice) {
  if (el.dataset.revision !== String(voice.revision)) {
    el.firstChild.textContent=voice.text; el.dataset.revision=voice.revision;
    el.classList.remove('fresh'); void el.offsetWidth; el.classList.add('fresh');
  }
}
