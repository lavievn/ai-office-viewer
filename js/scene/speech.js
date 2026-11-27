import * as THREE from 'three';
import { DialogueDirector, installSpeechStyle, updateBubble } from '../agent-speech.js?v=office-fun-r2b';

export class SpeechLayer {
  constructor(container) {
    installSpeechStyle(); this.director=new DialogueDirector(); this.elements=new Map(); this.agents=new Map();
    this.layer=document.createElement('div'); this.layer.className='office-speech-layer'; this.layer.setAttribute('aria-hidden','true');
    if (getComputedStyle(container).position==='static') container.style.position='relative';
    container.append(this.layer); this.point=new THREE.Vector3();
  }
  setAgents(agents,tasks=[]) {
    this.agents=new Map(agents.map(a=>{const task=tasks.find(t=>(t.targetAgentId??t.agentId)===a.id);return [a.id,{...a,lastTaskStatus:task?.status,lastTaskId:task?.id}];}));
  }
  update(office,now) {
    const agents=[...office.agents.values()].map(v=>({...this.agents.get(v.id),id:v.id,status:v.status,
      zone:v.where==='leisure' && v.spot?.kind==='cafe' ? 'cafe' : 'desk', x:v.person.anchor.x,z:v.person.anchor.z}));
    const voices=this.director.tick(agents,now);
    for (const [id,el] of this.elements) if (!office.agents.has(id)) {el.remove();this.elements.delete(id);}
    const placed=[];
    const visuals=[...office.agents].sort(([,a],[,b])=>Number(b.status==='working')-Number(a.status==='working'));
    for (const [id,v] of visuals) {
      const voice=voices.get(id); let el=this.elements.get(id);
      if (!el) {el=document.createElement('div');el.className='office-bubble quiet';el.dataset.agentId=id;el.append(document.createElement('span'));this.layer.append(el);this.elements.set(id,el);}
      updateBubble(el,voice);
      this.point.copy(v.label.position);this.point.y+=.55;this.point.project(office.camera);
      const visible=!voice.hidden && this.point.z>=-1 && this.point.z<=1 && Math.abs(this.point.x)<1 && Math.abs(this.point.y)<1;
      const x=Math.max(98,Math.min(this.layer.clientWidth-98,(this.point.x+1)*.5*this.layer.clientWidth));
      let y=(1-this.point.y)*.5*this.layer.clientHeight; const height=el.offsetHeight;
      const speaking=visible && now<voice.until;
      if (speaking) {
        // Keep nearby cafe replies readable, with a short vertical stack above their heads.
        for(let i=0;i<placed.length;i++) {const p=placed[i];if(Math.abs(x-p.x)<198 && y>p.y-p.height-6 && y-height<p.y+6){y=p.y-p.height-8;i=-1;}}
        placed.push({x,y,height});
      }
      el.classList.toggle('quiet',!speaking || y<height);
      el.style.left=x+'px';el.style.top=y+'px';
    }
  }
}
