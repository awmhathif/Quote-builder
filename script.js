const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const sizes = {
  square: { label: 'Square', width: 1080, height: 1080 },
  portrait: { label: 'Portrait', width: 1080, height: 1350 },
  story: { label: 'Story / Reel', width: 1080, height: 1920 },
  landscape: { label: 'Landscape', width: 1600, height: 900 },
  og: { label: 'Social preview', width: 1200, height: 630 }
};

const defaults = {
  quote: 'The best way to understand an idea is to build it.',
  author: 'Awm Hathif',
  preset: 'portrait', width: 1080, height: 1350,
  fontFamily: 'Playfair Display', fontSize: 72, fontWeight: 600,
  lineHeight: 1.18, letterSpacing: 0, textWidth: 74,
  align: 'center', textX: 50, textY: 50,
  textColor: '#f8fafc', authorColor: '#cbd5e1',
  shadowEnabled: true, shadowStrength: 34,
  bgMode: 'gradient', bgColor: '#0f172a', gradientA: '#0f172a', gradientB: '#312e81', gradientAngle: 135,
  bgImageSrc: '', imageZoom: 100, overlayOpacity: 12
};

const templates = {
  midnight: { fontFamily:'Playfair Display',fontWeight:600,fontSize:76,lineHeight:1.15,letterSpacing:0,textWidth:72,align:'center',textX:50,textY:50,textColor:'#f8fafc',authorColor:'#cbd5e1',shadowEnabled:true,shadowStrength:32,bgMode:'gradient',gradientA:'#0f172a',gradientB:'#312e81',gradientAngle:135,overlayOpacity:10 },
  paper: { fontFamily:'DM Serif Display',fontWeight:400,fontSize:74,lineHeight:1.18,letterSpacing:0,textWidth:70,align:'left',textX:18,textY:48,textColor:'#292524',authorColor:'#78716c',shadowEnabled:false,shadowStrength:0,bgMode:'solid',bgColor:'#efe8d9',overlayOpacity:0 },
  electric: { fontFamily:'Space Grotesk',fontWeight:700,fontSize:70,lineHeight:1.08,letterSpacing:-1,textWidth:76,align:'left',textX:15,textY:68,textColor:'#ecfeff',authorColor:'#99f6e4',shadowEnabled:true,shadowStrength:28,bgMode:'gradient',gradientA:'#18181b',gradientB:'#0f766e',gradientAngle:125,overlayOpacity:8 },
  mono: { fontFamily:'Inter',fontWeight:600,fontSize:62,lineHeight:1.22,letterSpacing:-1,textWidth:66,align:'center',textX:50,textY:50,textColor:'#fafafa',authorColor:'#a3a3a3',shadowEnabled:false,shadowStrength:0,bgMode:'solid',bgColor:'#111111',overlayOpacity:0 }
};

let state = structuredClone(defaults);
let bgImage = null;
let undoStack = [];
let redoStack = [];
let toastTimer;

const canvas = $('#quoteCanvas');
const ctx = canvas.getContext('2d');

function cloneState(value = state) { return JSON.parse(JSON.stringify(value)); }
function toast(message) { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),1700); }
function clamp(n,min,max){ return Math.min(max,Math.max(min,n)); }

function pushUndo() {
  const snap = cloneState();
  const last = undoStack[undoStack.length - 1];
  if (last && JSON.stringify(last) === JSON.stringify(snap)) return;
  undoStack.push(snap);
  if (undoStack.length > 40) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}

function updateUndoButtons(){ $('#undoBtn').disabled=undoStack.length===0; $('#redoBtn').disabled=redoStack.length===0; }
function restoreSnapshot(snapshot){ state=cloneState(snapshot); loadImageFromState().then(()=>{syncUI();draw();}); }
function undo(){ if(!undoStack.length)return; redoStack.push(cloneState()); restoreSnapshot(undoStack.pop()); updateUndoButtons(); }
function redo(){ if(!redoStack.length)return; undoStack.push(cloneState()); restoreSnapshot(redoStack.pop()); updateUndoButtons(); }

async function loadImageFromState(){
  bgImage=null;
  if(!state.bgImageSrc) return;
  await new Promise(resolve=>{ const img=new Image(); img.onload=()=>{bgImage=img;resolve();}; img.onerror=resolve; img.src=state.bgImageSrc; });
}

function readUI(){
  state.quote=$('#quoteText').value;
  state.author=$('#authorText').value;
  state.fontFamily=$('#fontFamily').value;
  state.fontWeight=Number($('#fontWeight').value);
  state.fontSize=Number($('#fontSize').value);
  state.lineHeight=Number($('#lineHeight').value)/100;
  state.letterSpacing=Number($('#letterSpacing').value);
  state.textWidth=Number($('#textWidth').value);
  state.textX=Number($('#textX').value);
  state.textY=Number($('#textY').value);
  state.textColor=$('#textColor').value;
  state.authorColor=$('#authorColor').value;
  state.shadowEnabled=$('#shadowEnabled').checked;
  state.shadowStrength=Number($('#shadowStrength').value);
  state.bgMode=$('#bgMode').value;
  state.bgColor=$('#bgColor').value;
  state.gradientA=$('#gradientA').value;
  state.gradientB=$('#gradientB').value;
  state.gradientAngle=Number($('#gradientAngle').value);
  state.imageZoom=Number($('#imageZoom').value);
  state.overlayOpacity=Number($('#overlayOpacity').value);
}

function syncUI(){
  $('#quoteText').value=state.quote; $('#authorText').value=state.author;
  $('#sizePreset').value=state.preset || 'custom';
  $('#canvasWidth').value=state.width; $('#canvasHeight').value=state.height;
  $('#fontFamily').value=state.fontFamily; $('#fontWeight').value=String(state.fontWeight); $('#fontSize').value=state.fontSize;
  $('#lineHeight').value=Math.round(state.lineHeight*100); $('#letterSpacing').value=state.letterSpacing; $('#textWidth').value=state.textWidth;
  $('#textX').value=state.textX; $('#textY').value=state.textY; $('#textColor').value=state.textColor; $('#authorColor').value=state.authorColor;
  $('#shadowEnabled').checked=state.shadowEnabled; $('#shadowStrength').value=state.shadowStrength;
  $('#bgMode').value=state.bgMode; $('#bgColor').value=state.bgColor; $('#gradientA').value=state.gradientA; $('#gradientB').value=state.gradientB; $('#gradientAngle').value=state.gradientAngle;
  $('#imageZoom').value=state.imageZoom; $('#overlayOpacity').value=state.overlayOpacity;
  $$('#alignGroup button').forEach(b=>b.classList.toggle('active',b.dataset.align===state.align));
  syncLabels(); syncConditionalControls(); resizeCanvas();
}

function syncLabels(){
  $('#charCount').textContent=`${state.quote.length} chars`;
  $('#fontSizeValue').textContent=`${state.fontSize} px`; $('#lineHeightValue').textContent=state.lineHeight.toFixed(2);
  $('#letterSpacingValue').textContent=`${state.letterSpacing} px`; $('#textWidthValue').textContent=`${state.textWidth}%`;
  $('#textXValue').textContent=`${state.textX}%`; $('#textYValue').textContent=`${state.textY}%`;
  $('#shadowStrengthValue').textContent=`${state.shadowStrength}%`; $('#gradientAngleValue').textContent=`${state.gradientAngle}°`;
  $('#imageZoomValue').textContent=`${state.imageZoom}%`; $('#overlayOpacityValue').textContent=`${state.overlayOpacity}%`;
  [['textColor','textColorHex'],['authorColor','authorColorHex'],['bgColor','bgColorHex'],['gradientA','gradientAHex'],['gradientB','gradientBHex']].forEach(([input,label])=>$('#'+label).textContent=$('#'+input).value.toUpperCase());
}

function syncConditionalControls(){
  const mode=state.bgMode;
  $('#solidControls').hidden=mode!=='solid'; $('#gradientControls').hidden=mode!=='gradient'; $('#imageControls').hidden=mode!=='image';
  $('#shadowStrengthGroup').hidden=!state.shadowEnabled;
  const custom=$('#sizePreset').value==='custom'; $('#customSizeGroup').hidden=!custom; $('#applyCustomSize').hidden=!custom;
  const jpeg=$('#exportFormat').value==='jpeg'; $('#qualityWrap').hidden=!jpeg;
}

function resizeCanvas(){
  canvas.width=state.width; canvas.height=state.height;
  const matched=Object.values(sizes).find(s=>s.width===state.width&&s.height===state.height);
  $('#canvasLabel').textContent=`${matched?.label||'Custom'} · ${state.width} × ${state.height}`;
  requestAnimationFrame(updatePreviewScale);
}

function updatePreviewScale(){
  const rect=canvas.getBoundingClientRect();
  if(!rect.width)return;
  const pct=Math.round((rect.width/state.width)*100);
  $('#previewScale').textContent=pct>=98?'100%':`${pct}%`;
}

function gradientPoints(angleDeg,w,h){
  const r=angleDeg*Math.PI/180, x=Math.cos(r), y=Math.sin(r), cx=w/2,cy=h/2, len=Math.abs(w*x)+Math.abs(h*y);
  return [cx-x*len/2,cy-y*len/2,cx+x*len/2,cy+y*len/2];
}

function drawBackground(){
  ctx.save(); ctx.clearRect(0,0,canvas.width,canvas.height);
  if(state.bgMode==='image' && bgImage){
    const scale=Math.max(canvas.width/bgImage.width,canvas.height/bgImage.height)*(state.imageZoom/100);
    const w=bgImage.width*scale,h=bgImage.height*scale;
    ctx.drawImage(bgImage,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
  }else if(state.bgMode==='gradient'){
    const p=gradientPoints(state.gradientAngle,canvas.width,canvas.height),g=ctx.createLinearGradient(...p); g.addColorStop(0,state.gradientA);g.addColorStop(1,state.gradientB);ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
  }else{ctx.fillStyle=state.bgColor;ctx.fillRect(0,0,canvas.width,canvas.height)}
  if(state.overlayOpacity>0){ctx.fillStyle=`rgba(0,0,0,${state.overlayOpacity/100})`;ctx.fillRect(0,0,canvas.width,canvas.height)}
  ctx.restore();
}

function setFont(size,weight=state.fontWeight,family=state.fontFamily){ ctx.font=`${weight} ${size}px "${family}", sans-serif`; }
function measureSpaced(text,spacing){
  if(!spacing)return ctx.measureText(text).width;
  return ctx.measureText(text).width+Math.max(0,text.length-1)*spacing;
}
function drawSpacedText(text,x,y,spacing,align,fill=true){
  if(!spacing){ctx.textAlign=align; (fill?ctx.fillText.bind(ctx):ctx.strokeText.bind(ctx))(text,x,y);return;}
  const total=measureSpaced(text,spacing); let start=x;
  if(align==='center')start=x-total/2; if(align==='right')start=x-total;
  ctx.textAlign='left';
  for(const ch of text){ if(fill)ctx.fillText(ch,start,y);else ctx.strokeText(ch,start,y); start+=ctx.measureText(ch).width+spacing; }
}

function wrapParagraph(text,maxWidth,spacing){
  if(!text.trim())return [''];
  const words=text.trim().split(/\s+/); const lines=[]; let line='';
  for(const word of words){
    const candidate=line?`${line} ${word}`:word;
    if(measureSpaced(candidate,spacing)<=maxWidth){line=candidate;continue;}
    if(line)lines.push(line);
    if(measureSpaced(word,spacing)<=maxWidth){line=word;continue;}
    let part='';
    for(const ch of word){ const next=part+ch; if(part&&measureSpaced(next,spacing)>maxWidth){lines.push(part);part=ch}else part=next; }
    line=part;
  }
  if(line)lines.push(line); return lines;
}
function wrappedLines(text,maxWidth,spacing){
  return text.split(/\n/).flatMap((p,i,arr)=>{const lines=wrapParagraph(p,maxWidth,spacing);return i<arr.length-1?[...lines,'']:lines});
}

function drawText(){
  const quote=state.quote.trim()||'Write something worth remembering…';
  const maxWidth=canvas.width*(state.textWidth/100);
  const scale=Math.min(canvas.width/1080,canvas.height/1080);
  const quoteSize=clamp(state.fontSize*scale,18,220);
  const authorSize=clamp(quoteSize*.28,14,44);
  const letter=state.letterSpacing*scale;
  setFont(quoteSize);
  const lines=wrappedLines(quote,maxWidth,letter);
  const lineH=quoteSize*state.lineHeight;
  const authorGap=state.author.trim()?quoteSize*.62:0;
  const total=lines.length*lineH+authorGap+(state.author.trim()?authorSize*1.3:0);
  let startY=canvas.height*(state.textY/100)-total/2+quoteSize*.82;
  startY=clamp(startY,quoteSize,canvas.height-total+quoteSize*.4);
  let x=canvas.width*(state.textX/100);
  const half=maxWidth/2;
  if(state.align==='left')x=clamp(x,canvas.width*.04,canvas.width-maxWidth-canvas.width*.04);
  if(state.align==='right')x=clamp(x,maxWidth+canvas.width*.04,canvas.width*.96);
  if(state.align==='center')x=clamp(x,half+canvas.width*.03,canvas.width-half-canvas.width*.03);

  ctx.save();
  ctx.fillStyle=state.textColor; ctx.textBaseline='alphabetic';
  if(state.shadowEnabled){const a=.12+.48*(state.shadowStrength/100);ctx.shadowColor=`rgba(0,0,0,${a})`;ctx.shadowBlur=quoteSize*.16*(state.shadowStrength/100);ctx.shadowOffsetY=quoteSize*.06*(state.shadowStrength/100)}
  lines.forEach((line,index)=>drawSpacedText(line,x,startY+index*lineH,letter,state.align,true));
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  if(state.author.trim()){
    setFont(authorSize,600,'Inter'); ctx.fillStyle=state.authorColor;
    const authorY=startY+lines.length*lineH+authorGap-authorSize*.3;
    const prefix=state.align==='center'?'— ':''; drawSpacedText(prefix+state.author.trim(),x,authorY,Math.max(0,letter*.2),state.align,true);
  }
  ctx.restore();
}

function draw(){ drawBackground(); drawText(); syncLabels(); }

function applyPreset(key){
  if(!sizes[key])return; pushUndo(); const s=sizes[key]; state.preset=key;state.width=s.width;state.height=s.height; $('#canvasWidth').value=s.width;$('#canvasHeight').value=s.height;resizeCanvas();draw();
}

function applyTemplate(name){
  if(!templates[name])return; pushUndo(); Object.assign(state,templates[name]); state.bgImageSrc='';bgImage=null; syncUI();draw();toast(`${name[0].toUpperCase()+name.slice(1)} template applied`);
}

function resetDesign(){ pushUndo(); const size={preset:state.preset,width:state.width,height:state.height};state={...cloneState(defaults),...size};bgImage=null;syncUI();draw();toast('Design reset'); }

function safeFilename(){ const base=(state.quote||'quote').trim().slice(0,36).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'quote'; return base; }
function exportImage(){
  draw(); const format=$('#exportFormat').value; const mime=format==='jpeg'?'image/jpeg':'image/png'; const quality=Number($('#jpegQuality').value||.92); const a=document.createElement('a'); a.download=`${safeFilename()}-${state.width}x${state.height}.${format==='jpeg'?'jpg':'png'}`; a.href=canvas.toDataURL(mime,quality); a.click(); toast('Image exported');
}

function previewCss(stateValue){
  if(stateValue.bgMode==='gradient')return `linear-gradient(${stateValue.gradientAngle}deg,${stateValue.gradientA},${stateValue.gradientB})`;
  if(stateValue.bgMode==='solid')return stateValue.bgColor;
  if(stateValue.bgImageSrc)return `linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.15)),url(${stateValue.bgImageSrc}) center/cover`;
  return '#16181d';
}

function getDrafts(){ try{return JSON.parse(localStorage.getItem('quote-studio-drafts')||'[]')}catch{return[]} }
function setDrafts(items){ try{localStorage.setItem('quote-studio-drafts',JSON.stringify(items));return true}catch{toast('Draft is too large for browser storage');return false} }
function saveDraft(){
  readUI(); let snapshot=cloneState();
  if(snapshot.bgImageSrc.length>900000){snapshot.bgImageSrc='';toast('Draft saved without large background image');}
  const drafts=getDrafts(); const item={id:Date.now(),savedAt:new Date().toISOString(),state:snapshot}; drafts.unshift(item); if(setDrafts(drafts.slice(0,12))){renderDrafts();toast('Draft saved locally');}
}
function renderDrafts(){
  const list=$('#draftList'),drafts=getDrafts();list.innerHTML='';
  if(!drafts.length){list.innerHTML='<div class="empty-drafts">No saved drafts yet.</div>';return}
  drafts.forEach(item=>{const card=document.createElement('article');card.className='draft-card';const preview=document.createElement('div');preview.className='draft-preview';preview.style.background=previewCss(item.state);const title=document.createElement('b');title.textContent=item.state.quote||'Untitled quote';const time=document.createElement('small');time.textContent=new Date(item.savedAt).toLocaleString();const del=document.createElement('button');del.className='draft-delete';del.textContent='×';del.title='Delete draft';del.onclick=e=>{e.stopPropagation();setDrafts(getDrafts().filter(d=>d.id!==item.id));renderDrafts();toast('Draft deleted')};card.onclick=()=>{pushUndo();state={...cloneState(defaults),...cloneState(item.state)};loadImageFromState().then(()=>{syncUI();draw();toast('Draft loaded')})};card.append(preview,title,time,del);list.append(card)});
}

function bindLiveControl(selector,event='input'){
  $(selector).addEventListener(event,()=>{readUI();syncConditionalControls();draw()});
}
function bindUndoBoundary(selector){ const el=$(selector); el.addEventListener('pointerdown',pushUndo,{passive:true}); el.addEventListener('focus',()=>{if(el.matches('textarea,input[type=text],select'))pushUndo()}); }

async function init(){
  await document.fonts.ready;
  syncUI(); draw(); renderDrafts(); updateUndoButtons();

  const live=['#quoteText','#authorText','#fontFamily','#fontWeight','#fontSize','#lineHeight','#letterSpacing','#textWidth','#textX','#textY','#textColor','#authorColor','#shadowEnabled','#shadowStrength','#bgMode','#bgColor','#gradientA','#gradientB','#gradientAngle','#imageZoom','#overlayOpacity'];
  live.forEach(sel=>{bindLiveControl(sel,$(sel).type==='checkbox'||$(sel).tagName==='SELECT'?'change':'input');bindUndoBoundary(sel)});

  $('#sizePreset').addEventListener('change',e=>{syncConditionalControls();if(e.target.value!=='custom')applyPreset(e.target.value)});
  $('#applyCustomSize').onclick=()=>{const w=clamp(Number($('#canvasWidth').value),320,4096),h=clamp(Number($('#canvasHeight').value),320,4096);pushUndo();state.preset='custom';state.width=w;state.height=h;resizeCanvas();draw()};
  $$('#alignGroup button').forEach(btn=>btn.onclick=()=>{pushUndo();state.align=btn.dataset.align;$$('#alignGroup button').forEach(b=>b.classList.toggle('active',b===btn));draw()});
  $$('.template-card').forEach(btn=>btn.onclick=()=>applyTemplate(btn.dataset.template));

  $('#bgImage').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;if(file.size>8*1024*1024){toast('Choose an image smaller than 8 MB');return}pushUndo();const reader=new FileReader();reader.onload=()=>{state.bgImageSrc=reader.result;loadImageFromState().then(()=>{state.bgMode='image';$('#bgMode').value='image';syncConditionalControls();draw();toast('Background loaded')})};reader.readAsDataURL(file)});

  $('#undoBtn').onclick=undo; $('#redoBtn').onclick=redo; $('#resetBtn').onclick=resetDesign;
  $('#saveDraftBtn').onclick=saveDraft; $('#exportBtn').onclick=exportImage; $('#exportTopBtn').onclick=()=>{document.querySelector('.export-bar').scrollIntoView({behavior:'smooth',block:'center'});setTimeout(exportImage,250)};
  $('#exportFormat').onchange=syncConditionalControls;
  $('#clearDraftsBtn').onclick=()=>{if(!getDrafts().length)return;localStorage.removeItem('quote-studio-drafts');renderDrafts();toast('Drafts cleared')};

  window.addEventListener('resize',updatePreviewScale);
  window.addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==='s'){e.preventDefault();saveDraft()}if(mod&&e.key.toLowerCase()==='z'&&!e.shiftKey){e.preventDefault();undo()}if(mod&&e.key.toLowerCase()==='z'&&e.shiftKey){e.preventDefault();redo()}});
}

init();
