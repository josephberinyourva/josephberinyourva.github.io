'use strict';
function buildPortfolioInquiry(details,plan){
 const single=value=>String(value||'').replace(/[\r\n]+/g,' ').trim();
 const name=single(details.name),email=single(details.email),service=single(details.service),business=single(details.business),start=single(details.start);
 const subject=`Project inquiry | ${plan.name} | ${service}`;
 const lines=['Hi Joseph,','',`I’m interested in ${service.toLowerCase().replace(/\bai\b/g,'AI')}${business?' for '+business:''}.`,'','PROJECT DETAILS',String(details.message||'').replace(/\r\n?/g,'\n').trim(),'','SELECTED PACKAGE',`${plan.name}${plan.rate?' — '+plan.rate:''}`];
 if(start)lines.push('','PREFERRED START',start);
 lines.push('','Please let me know your availability and the next steps to confirm the scope.','','Best regards,',name);
 if(business)lines.push(business);
 lines.push(email);
 const body=lines.join('\r\n');
 return {subject,body,mailto:'mailto:josephberin12356@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)};
}
if(typeof module!=='undefined'&&module.exports)module.exports={buildPortfolioInquiry};
if(typeof document!=='undefined')(()=>{
 const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
 const plans={'ai-blueprint':{name:'Workflow Blueprint',rate:'USD 49 one-time / planning only',note:'One process map, requirements, prompt outline, and one revision. No connected setup.'},'ai-pilot':{name:'AI Workflow Pilot',rate:'From USD 149 one-time; final quote after scope review',note:'One workflow, up to two supported apps, one AI step. Software and usage costs excluded. Feasibility confirmed first.'},'ai-connected':{name:'Connected Workflow',rate:'From USD 299 one-time; final quote after scope review',note:'One workflow, up to three supported apps, one AI step and two routing branches. Software and usage costs excluded.'},choose:{name:'Project support',rate:'Scope and pricing to be discussed',note:'Share the task and I’ll help you choose a suitable scope.'},starter:{name:'Starter Task',rate:'USD 18 for 3 hours (one time)',note:'One focused task, including your First-Task Roadmap within the three-hour budget.'},part:{name:'Part-Time Support',rate:'USD 120 per week / 20 hours',note:'A proposed four-hour day across five days. Schedule and scope agreed together.'},full:{name:'Full-Time Support',rate:'USD 240 per week / 40 hours',note:'A proposed eight-hour day across five days. Start date and schedule subject to availability.'},flex:{name:'Flexible Support',rate:'USD 60 for a 10-hour block',note:'A smaller block for an agreed task list. Timing confirmed before work starts.'},custom:{name:'One-Time Project',rate:'Custom quote after scope review',note:'Share the deliverable, source materials, and deadline for a tailored quote.'}};
 const picker=q('#support-plan'),form=q('#contact-form'),dialog=q('#inquiry-dialog');let draft=null;
 function planNote(){q('#selected-plan-note').textContent=plans[picker.value].note;}
 picker.addEventListener('change',()=>{if(picker.value.startsWith('ai-'))q('#task-type').value='AI automation / workflow project';planNote();});
 all('.offers [data-plan], .ai-packages [data-plan]').forEach(button=>button.addEventListener('click',()=>{picker.value=button.dataset.plan;if(picker.value.startsWith('ai-'))q('#task-type').value='AI automation / workflow project';planNote();q('#contact').scrollIntoView({behavior:document.documentElement.classList.contains('motion-off')?'auto':'smooth'});picker.focus({preventScroll:true});}));
 all('.offers [data-period]').forEach(button=>button.addEventListener('click',()=>{const four=button.dataset.period==='four';all('.offers [data-period]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));all('.offers [data-price]').forEach(el=>el.textContent='$'+Number(el.dataset.price)*(four?4:1));all('.offers [data-period-label]').forEach(el=>el.textContent=four?'per 4 weeks':'per week');q('#period-note').textContent=four?'Four weeks: 80 hours part-time or 160 hours full-time. Not a calendar-month subscription.':'Ongoing plans shown per week. The starter is a one-time paid trial.';}));
 form.addEventListener('submit',event=>{
  event.preventDefault();const fields={name:q('#sender-name').value,email:q('#sender-email').value,service:q('#task-type').value,business:q('#business-name').value,start:q('#start-date').value,message:q('#task-details').value};
  if(!fields.name.trim()||!fields.message.trim()){q('#form-status').textContent='Please add your name and a short description of the project.';return;}
  draft=buildPortfolioInquiry(fields,plans[picker.value]);q('#inquiry-subject').textContent=draft.subject;q('#inquiry-body').textContent=draft.body;q('#open-inquiry-email').href=draft.mailto;q('#inquiry-status').textContent='';q('#form-status').textContent='Your inquiry is ready to review. It has not been sent.';dialog.showModal();
 });
 q('#close-inquiry').addEventListener('click',()=>dialog.close());q('#edit-inquiry').addEventListener('click',()=>{dialog.close();q('#task-details').focus();});
 q('#open-inquiry-email').addEventListener('click',()=>{q('#inquiry-status').textContent='Email draft requested. Review it and press Send in your email app. Your message has not been sent by this website.';});
 q('#copy-inquiry').addEventListener('click',async()=>{if(!draft)return;try{await navigator.clipboard.writeText(`To: josephberin12356@gmail.com\nSubject: ${draft.subject}\n\n${draft.body}`);q('#inquiry-status').textContent='Message copied. Paste it into your email service, review, and send.';}catch{const range=document.createRange();range.selectNodeContents(q('#inquiry-body'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);q('#inquiry-status').textContent='Message selected. Press ⌘C or Ctrl+C to copy; the recipient and subject are shown above.';}});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
})();
