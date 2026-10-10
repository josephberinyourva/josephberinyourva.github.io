(() => {
 'use strict';
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const layer=document.createElement('div');layer.className='web-fx-layer';layer.setAttribute('aria-hidden','true');document.body.append(layer);
 const svgNS='http://www.w3.org/2000/svg';
 function webPath(){
  let d='';const n=9,c=71;
  for(let i=0;i<n;i++){const a=i*Math.PI*2/n;d+=`M${c} ${c}L${c+Math.cos(a)*66} ${c+Math.sin(a)*66}`;}
  for(const radius of [13,27,43,61]){
   for(let i=0;i<n;i++){const a=i*Math.PI*2/n,b=(i+1)*Math.PI*2/n,m=(a+b)/2;d+=`M${c+Math.cos(a)*radius} ${c+Math.sin(a)*radius}Q${c+Math.cos(m)*radius*.68} ${c+Math.sin(m)*radius*.68} ${c+Math.cos(b)*radius} ${c+Math.sin(b)*radius}`;}
  }return d;
 }
 const shape=webPath();
 const quiet=()=>media.matches||document.documentElement.classList.contains('motion-off');
 function impact(x,y){
  if(document.hidden)return;
  const el=document.createElement('span');el.className='web-impact'+(quiet()?' quiet':'');el.style.left=x+'px';el.style.top=y+'px';
  const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 142 142');
  for(const klass of ['web-ink','web-white']){const path=document.createElementNS(svgNS,'path');path.setAttribute('d',shape);path.setAttribute('class',klass);path.setAttribute('pathLength','1');svg.append(path);}
  const dot=document.createElementNS(svgNS,'circle');dot.setAttribute('cx','71');dot.setAttribute('cy','71');dot.setAttribute('r','2.3');dot.setAttribute('class','web-center');svg.append(dot);el.append(svg);layer.append(el);
  while(layer.childElementCount>12)layer.firstElementChild.remove();
  setTimeout(()=>el.remove(),quiet()?180:850);
 }
 document.addEventListener('pointerdown',e=>{if(e.button===0&&e.isPrimary!==false)impact(e.clientX,e.clientY);},{passive:true,capture:true});
 document.addEventListener('click',e=>{if(e.detail===0&&e.target instanceof Element){const r=e.target.getBoundingClientRect();if(r.width&&r.height)impact(r.left+r.width/2,r.top+r.height/2);}},{passive:true,capture:true});
 // Effects also appear inside a top-layer dialog, above its backdrop.
 const dialog=document.getElementById('game-dialog');
 if(dialog){const sync=()=>{if(dialog.open)dialog.append(layer);else document.body.append(layer);};new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});}
 const hero=document.querySelector('.hero'),portrait=document.querySelector('.hero-portrait');
 if(hero&&portrait){let raf=0;hero.addEventListener('pointermove',e=>{if(quiet()||e.pointerType!=='mouse'||raf)return;const rect=hero.getBoundingClientRect(),x=((e.clientX-rect.left)/rect.width-.5)*9,y=((e.clientY-rect.top)/rect.height-.5)*7;raf=requestAnimationFrame(()=>{portrait.style.setProperty('--pointer-x',x+'px');portrait.style.setProperty('--pointer-y',y+'px');raf=0;});},{passive:true});hero.addEventListener('pointerleave',()=>{portrait.style.setProperty('--pointer-x','0px');portrait.style.setProperty('--pointer-y','0px');});}
})();
