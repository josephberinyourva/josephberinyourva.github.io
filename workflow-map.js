'use strict';
function workflowPath(result){
 const path=['receive','validate'];
 if(result.route==='Validation')return path;
 if(['Duplicate','ID conflict'].includes(result.route))return [...path,'duplicate'];
 if(result.route==='Clarification')return [...path,'clarify','review'];
 path.push('lookup');
 if(result.action==='Verify order and customer')return [...path,'manual','review'];
 path.push('route');
 return [...path,result.route==='Ready for review'?'draft':'manual','review'];
}
if(typeof module!=='undefined')module.exports={workflowPath};
if(typeof document!=='undefined')(()=>{
 const q=s=>document.querySelector(s),nodes=[...document.querySelectorAll('[data-node]')],edges=[...document.querySelectorAll('[data-edge]')];
 const info={
 receive:['Request received','The form collects a request ID, customer email, order number, request type, and message.','The sample request entered in the form.','A request object to validate.'],
 validate:['Validate & dedupe','Check required fields and normalize IDs. An existing request ID stops here; changed details are flagged as an ID conflict.','Request ID, email, message, and current queue.','A unique valid request, or a duplicate / validation result.'],
 lookup:['Match the order','Match both the order number and customer email against the two sample order records. A mismatch never reveals order information.','Order number + customer email.','Matched sample order, or a manual-verification route.'],
 route:['Choose a route','The selected request type controls routing. Shipping prepares a status draft. Refunds and other requests go to a person.','Matched order + request type selected in the form.','A template-draft route or a manual-decision route.'],
 draft:['Prepare reply','Insert only the matched sample order status into a fixed reply template. No delivery date is guessed.','Approved sample status + order number.','A response draft for a person to check.'],
 review:['Human review','Collect the result in a review queue. A person checks facts and policy before using the draft. Exporting a CSV does not send any messages.','Route, next action, and proposed response.','One queue row and an optional downloadable CSV.'],
 duplicate:['Duplicate check','Keep the original queue entry. Repeating the same ID does not create extra work; different details trigger an ID conflict.','An ID already present in the queue.','A duplicate / conflict notice; no additional queue row.'],
 clarify:['Clarify first','When the order number is missing, skip lookup and prepare a request for the missing detail.','A request without an order number.','A clarification draft for human review.'],
 manual:['Manual decision','Unknown records need verification. Refund requests need an owner’s approval. Open-ended questions need a person’s review.','An unmatched record, refund, or other request.','A specific next action without promising a refund or outcome.'],
 ai:['AI drafting — planned extension','A future connected version could pass approved facts to an AI model for a summary or reply draft. This node is illustrative and never executes in this browser demo.','Proposed: customer message, verified facts, approved policy.','Proposed: structured summary + draft, still held for human review.']};
 let last=null,path=[],timers=[],motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,selected='receive';
 function inspect(id){selected=id;nodes.forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.node===id)));const d=info[id];['#node-title','#node-description','#node-input','#node-output'].forEach((s,i)=>q(s).textContent=d[i]);q('#node-run').textContent=id==='ai'?'Not executed. No AI model is connected.':!last?'Run a sample to inspect its result.':path.includes(id)?`${last.request.id} · ${last.route} · ${last.action}`:'Skipped for this request.';}
 function clear(){timers.forEach(clearTimeout);timers=[];nodes.forEach(n=>n.classList.remove('executed'));edges.forEach(e=>e.classList.remove('executed'));}
 function play(){clear();if(!last)return;path=workflowPath(last);q('#map-status').textContent=`Tracing ${last.request.id}…`;path.forEach((id,i)=>{const show=()=>{q(`[data-node="${id}"]`).classList.add('executed');if(i){const edge=q(`[data-edge="${path[i-1]}-${id}"]`);if(edge)edge.classList.add('executed');}if(i===path.length-1)q('#map-status').textContent=`${last.request.id} → ${last.route}. ${path.length} steps visited. AI node not executed.`;};if(motion)timers.push(setTimeout(show,i*320));else show();});inspect(selected);}
 nodes.forEach(n=>n.addEventListener('click',()=>inspect(n.dataset.node)));
 q('#map-run').addEventListener('click',()=>q('#router-form').requestSubmit());q('#map-replay').addEventListener('click',play);
 function motionLabel(){q('#map-motion').textContent=motion?'Motion on':'Motion off';q('#map-motion').setAttribute('aria-pressed',String(motion));}
 q('#map-motion').addEventListener('click',()=>{motion=!motion;motionLabel();if(last)play();});motionLabel();
 document.addEventListener('workflow:result',e=>{last=e.detail;q('#map-replay').disabled=false;play();});
 document.addEventListener('workflow:reset',()=>{clear();last=null;path=[];q('#map-replay').disabled=true;q('#map-status').textContent='Ready. Run the current sample or choose a scenario below.';inspect('receive');});inspect('receive');
})();
