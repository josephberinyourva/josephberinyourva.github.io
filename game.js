(() => {
 'use strict';
 const el=id=>document.getElementById(id),dialog=el('game-dialog');if(!dialog)return;
 const arena=el('game-arena'),targets=el('game-targets'),trails=el('game-trails'),overlay=el('game-overlay'),startButton=el('start-game'),pauseButton=el('pause-game');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),duration=30000;
 const dock=[...dialog.querySelectorAll('[data-lane]')];
 const types=[{kind:'email',icon:'@',label:'Email',name:'customer email'},{kind:'orders',icon:'▦',label:'Order',name:'order update'},{kind:'checks',icon:'✓',label:'Check',name:'quality check'}];
 let state='ready',score=0,lives=3,combo=0,best=0,elapsed=0,spawnClock=0,last=0,raf=0,nextId=0,lane=1,items=[],lastLane=-1;
 try{const value=Number(localStorage.getItem('joseph-web-patrol-best'));if(Number.isFinite(value)&&value>=0&&value<=100000)best=Math.floor(value);}catch{}
 arena.tabIndex=0;
 const quiet=()=>reduced.matches||document.documentElement.classList.contains('motion-off');
 function announce(message){el('game-status').textContent=message;}
 function hud(){el('game-score').textContent=String(score).padStart(3,'0');el('game-time').textContent=Math.ceil(Math.max(0,duration-elapsed)/1000)+'s';el('game-lives').textContent=Array(lives).fill('♥').join(' ')||'—';el('game-lives').setAttribute('aria-label',lives+' lives remaining');el('game-best').textContent=String(best).padStart(3,'0');el('game-combo').textContent=combo>=2?combo+'× STREAK!':'';}
 function selectLane(value){lane=Math.max(0,Math.min(2,value));dock.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===lane)));}
 function frameStop(){if(raf)cancelAnimationFrame(raf);raf=0;}
 function clearItems(){items.forEach(item=>item.node.remove());items=[];targets.replaceChildren();trails.replaceChildren();}
 function showOverlay(kicker,title,description,label){el('overlay-kicker').textContent=kicker;el('overlay-title').textContent=title;el('overlay-description').textContent=description;startButton.textContent=label+' ↗';overlay.hidden=false;}
 function render(item){const available=Math.max(70,targets.clientHeight-75);const y=quiet()?24+item.lane*25:item.y;item.node.style.left=((item.lane+.5)/3*100)+'%';item.node.style.transform=`translateY(${Math.min(y,available+90)}px) rotate(${item.angle}deg)`;}
 function spawn(){
  if(items.length>=7)return;
  let nextLane=Math.floor(Math.random()*3);if(nextLane===lastLane)nextLane=(nextLane+1+Math.floor(Math.random()*2))%3;lastLane=nextLane;
  // Keep the static reduced-motion layout clear, with one target per lane.
  if(quiet()&&items.some(item=>item.lane===nextLane)){const free=[0,1,2].find(l=>!items.some(item=>item.lane===l));if(free===undefined)return;nextLane=free;}
  const type=types[Math.floor(Math.random()*types.length)],node=document.createElement('button');
  node.type='button';node.className='task-target type-'+type.kind;node.setAttribute('aria-label',`Catch ${type.name} in lane ${nextLane+1}`);node.tabIndex=-1;
  const icon=document.createElement('strong');icon.textContent=type.icon;icon.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=type.label;node.append(icon,label);
  const item={id:++nextId,lane:nextLane,node,y:-74,age:0,speed:52+elapsed/duration*37,angle:Math.random()*10-5};
  node.addEventListener('click',()=>{if(state==='running')catchItem(item.id);});targets.append(node);items.push(item);render(item);
 }
 const svgNS='http://www.w3.org/2000/svg';
 function shot(x,y,points){
  const width=arena.clientWidth,height=arena.clientHeight,group=document.createElementNS(svgNS,'g');
  trails.setAttribute('viewBox',`0 0 ${width} ${height}`);
  const line=document.createElementNS(svgNS,'line');line.setAttribute('x1',String(width*(lane+.5)/3));line.setAttribute('y1',String(height-20));line.setAttribute('x2',String(x));line.setAttribute('y2',String(y));line.setAttribute('pathLength','1');group.append(line);
  if(points){
   const web=document.createElementNS(svgNS,'path');let d='';const n=8;
   for(let i=0;i<n;i++){const a=i*Math.PI*2/n;d+=`M${x} ${y}L${x+Math.cos(a)*43} ${y+Math.sin(a)*43}`;}
   for(const r of [17,32,42])for(let i=0;i<n;i++){const a=i*Math.PI*2/n,b=(i+1)*Math.PI*2/n;d+=`M${x+Math.cos(a)*r} ${y+Math.sin(a)*r}Q${x+Math.cos((a+b)/2)*r*.66} ${y+Math.sin((a+b)/2)*r*.66} ${x+Math.cos(b)*r} ${y+Math.sin(b)*r}`;}
   web.setAttribute('d',d);web.setAttribute('class','caught-web');group.append(web);
   const text=document.createElementNS(svgNS,'text');text.setAttribute('x',x);text.setAttribute('y',Math.max(28,y-12));text.setAttribute('text-anchor','middle');text.textContent='+'+points;group.append(text);
  }
  trails.append(group);while(trails.childElementCount>10)trails.firstElementChild.remove();setTimeout(()=>group.remove(),quiet()?160:600);
 }
 function catchItem(id){
  if(state!=='running')return;const item=items.find(item=>item.id===id);if(!item)return;
  selectLane(item.lane);const rect=item.node.getBoundingClientRect(),field=arena.getBoundingClientRect();const x=rect.left-field.left+rect.width/2,y=rect.top-field.top+rect.height/2;
  combo++;const points=10+Math.min(combo-1,4)*5;score+=points;item.node.remove();items=items.filter(i=>i.id!==id);shot(x,y,points);hud();announce(`Caught. ${score} points. ${lives} lives remaining.`);
 }
 function fire(which){
  if(state!=='running')return;selectLane(which);
  const available=items.filter(item=>item.lane===lane&&(quiet()||item.y>-38)).sort((a,b)=>b.age-a.age);
  if(available.length)catchItem(available[0].id);else{combo=0;shot(arena.clientWidth*(lane+.5)/3,25,0);hud();}
 }
 function finish(reason){
  state='over';frameStop();clearItems();pauseButton.disabled=true;pauseButton.textContent='Pause Ⅱ';
  const record=score>best;if(record){best=score;try{localStorage.setItem('joseph-web-patrol-best',String(best));}catch{}}
  hud();showOverlay(record?'NEW PERSONAL BEST!':'PATROL COMPLETE',score>0?`${score} points.\nNice web work!`:'A new hero\nneeds a warm-up.',reason==='lives'?'Three tasks escaped. Try another patrol and keep an eye on all three lanes.':'Time is up. Your neighborhood is a little more organized. Ready for another round?','Play again');announce(`Patrol complete. Final score: ${score}. Best score: ${best}.`);startButton.focus();
 }
 function tick(now){
  raf=0;if(state!=='running')return;const delta=Math.max(0,now-last);last=now;elapsed+=delta;spawnClock+=delta;arena.dataset.motion=quiet()?'quiet':'full';
  if(elapsed>=duration){elapsed=duration;finish('time');return;}
  const cadence=950-elapsed/duration*240;
  if(spawnClock>=cadence){spawnClock=0;spawn();}
  for(const item of [...items]){
   item.age+=delta;item.y+=item.speed*Math.min(delta,100)/1000;render(item);
   if((quiet()&&item.age>3400)||(!quiet()&&item.y>targets.clientHeight-24)){
    item.node.remove();items=items.filter(i=>i.id!==item.id);lives--;combo=0;announce(`A task escaped. ${lives} lives remaining.`);
    if(lives<=0){finish('lives');return;}
   }
  }
  hud();raf=requestAnimationFrame(tick);
 }
 function run(){state='running';overlay.hidden=true;pauseButton.disabled=false;pauseButton.textContent='Pause Ⅱ';last=performance.now();frameStop();raf=requestAnimationFrame(tick);arena.focus();announce('Patrol started. Click cards or press 1, 2, and 3 to fire.');}
 function newGame(){frameStop();clearItems();score=0;lives=3;combo=0;elapsed=0;spawnClock=700;lastLane=-1;selectLane(1);hud();run();}
 function pause(){if(state!=='running')return;state='paused';frameStop();pauseButton.textContent='Resume ▷';showOverlay('TAKE YOUR TIME','Patrol paused.',`Your ${score} points are safe. Resume whenever you're ready.`,'Resume patrol');announce('Patrol paused.');startButton.focus();}
 function openGame(){if(dialog.open)return;dialog.showModal();document.body.classList.add('game-open');hud();startButton.focus();}
 function closeGame(){if(state==='running')pause();dialog.close();}
 el('open-game').addEventListener('click',openGame);el('close-game').addEventListener('click',closeGame);
 dialog.addEventListener('close',()=>{if(state==='running')pause();frameStop();document.body.classList.remove('game-open');el('open-game').focus();});
 dialog.addEventListener('cancel',()=>{if(state==='running')pause();});
 startButton.addEventListener('click',()=>{if(state==='paused')run();else newGame();});
 pauseButton.addEventListener('click',()=>{if(state==='running')pause();else if(state==='paused')run();});
 dock.forEach(button=>button.addEventListener('click',()=>fire(Number(button.dataset.lane))));
 dialog.addEventListener('keydown',event=>{
  if(event.altKey||event.metaKey||event.ctrlKey||event.repeat)return;
  if(event.key.toLowerCase()==='p'&&(state==='running'||state==='paused')){event.preventDefault();state==='running'?pause():run();return;}
  if(state!=='running')return;
  if(['1','2','3'].includes(event.key)){event.preventDefault();fire(Number(event.key)-1);}
  else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();selectLane(lane+(event.key==='ArrowLeft'?-1:1));}
  else if(event.key===' '&&(event.target===arena||event.target.closest('.game-dock'))){event.preventDefault();fire(lane);}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='running')pause();});
 selectLane(1);hud();
})();
