const DPI=300;
const presetSets={
  'id-photo':{title:'Preset Sizes',items:{"1x1":{w:1,h:1,unit:'inch',cols:4,rows:2},"1.5x1.5":{w:1.5,h:1.5,unit:'inch',cols:3,rows:2},"2x2":{w:2,h:2,unit:'inch',cols:2,rows:2},Passport:{w:35,h:45,unit:'mm',cols:2,rows:3},Visa:{w:2,h:2,unit:'inch',cols:2,rows:2},"Half Body":{w:3,h:4,unit:'inch',cols:1,rows:2},Wallet:{w:2.5,h:3.5,unit:'inch',cols:2,rows:1}}},
  polaroid:{title:'INSTAX Sizes',items:{Mini:{w:2.1,h:3.4,unit:'inch',photoW:1.8,photoH:2.4,cols:2,rows:2},Wide:{w:4.25,h:3.4,unit:'inch',photoW:3.9,photoH:2.4,cols:1,rows:2},Square:{w:2.8,h:3.4,unit:'inch',photoW:2.4,photoH:2.4,cols:2,rows:1},FilmStrip:{w:2,h:6,unit:'inch',photoW:1.6,photoH:1.6,cols:1,rows:1}}},
  'id-xerox':{title:'Preset Sizes',items:{"ID Front":{w:3.375,h:2.125,unit:'inch',cols:2,rows:2},"ID Back":{w:3.375,h:2.125,unit:'inch',cols:2,rows:2},"A4 Copy":{w:8.27,h:11.69,unit:'inch',cols:1,rows:1}}}
};
let currentMode='id-photo';
const defaultStates={
 'id-photo':{paper:'4R',sizes:[{name:'2x2',w:2,h:2,unit:'inch',qty:4}],image:null,processed:null,photos:[],imageUrl:null,bgImage:null,bgUrl:null,design:'classic',filmstripLayout:'1',xeroxFront:null,xeroxBack:null,xeroxFrontUrl:null,xeroxBackUrl:null,xeroxMode:'color',rotation:0,flip:false,zoom:1,brightness:100,contrast:100,cropper:null,margin:0.2,spacing:0.06,landscape:false,guides:true,labels:true},
 polaroid:{paper:'4R',sizes:[{name:'Mini',w:2.1,h:3.4,unit:'inch',photoW:1.8,photoH:2.4,qty:4,cols:2,rows:2}],image:null,processed:null,photos:[],imageUrl:null,bgImage:null,bgUrl:null,design:'classic',filmstripLayout:'1',xeroxFront:null,xeroxBack:null,xeroxFrontUrl:null,xeroxBackUrl:null,xeroxMode:'color',rotation:0,flip:false,zoom:1,brightness:100,contrast:100,cropper:null,margin:0.2,spacing:0.06,landscape:false,guides:true,labels:true},
 'id-xerox':{paper:'A4',sizes:[{name:'ID Front',w:3.375,h:2.125,unit:'inch',qty:4}],image:null,processed:null,photos:[],imageUrl:null,bgImage:null,bgUrl:null,design:'classic',filmstripLayout:'1',xeroxFront:null,xeroxBack:null,xeroxFrontUrl:null,xeroxBackUrl:null,xeroxMode:'color',rotation:0,flip:false,zoom:1,brightness:100,contrast:100,cropper:null,margin:0.2,spacing:0.06,landscape:false,guides:true,labels:true}
};
const tabStates=structuredClone(defaultStates);
const papers={"3R":{w:3.5,h:5},"4R":{w:4,h:6},"5R":{w:5,h:7},A4:{w:8.27,h:11.69},Letter:{w:8.5,h:11},Legal:{w:8.5,h:14}};
let state=tabStates[currentMode];
const $=id=>document.getElementById(id); const canvas=$('previewCanvas'),ctx=canvas.getContext('2d');
function unitToIn(v,u){return u==='mm'?v/25.4:u==='cm'?v/2.54:v}
function fitDpi(){let p={...papers[state.paper]}; if(state.landscape&&p.h>p.w)[p.w,p.h]=[p.h,p.w]; canvas.width=Math.round(p.w*DPI); canvas.height=Math.round(p.h*DPI);}
function renderButtons(){ const set=presetSets[currentMode]; const isPolaroid=currentMode==='polaroid'; const isXerox=currentMode==='id-xerox'; document.getElementById('uploadCard').hidden=isXerox; document.getElementById('xeroxCard').hidden=!isXerox; document.getElementById('presetCard').hidden=isXerox; document.getElementById('sizesCard').hidden=isPolaroid||isXerox; document.getElementById('polaroidDesignCard').hidden=!isPolaroid; document.getElementById('imageProcessingCard').hidden=currentMode==='id-photo'||isXerox; document.querySelector('.paper-panel').hidden=isXerox; document.getElementById('sizeSectionNumber').textContent=isPolaroid?'4':'3'; document.querySelector('#presetTitle').textContent=set.title; const activeName=state.sizes[0]?.name; $('presetButtons').innerHTML=Object.keys(set.items).map(k=>`<button data-preset="${k}" class="${k===activeName?'active':''}">${k}</button>`).join(''); $('paperButtons').innerHTML=Object.keys(papers).filter(k=>['3R','4R','5R','A4','Letter','Legal'].includes(k)).map(k=>`<button data-paper="${k}" class="${k===state.paper?'active':''}">${k}</button>`).join(''); if($('xeroxPaperButtons')) $('xeroxPaperButtons').innerHTML=['A4','Letter','Legal'].map(k=>`<button data-xerox-paper="${k}" class="${k===state.paper?'active':''}">${k}</button>`).join('');}
function updateFormula(){const c=+$('cols').value||1,r=+$('rows').value||1;$('copyFormula').textContent=`${c} × ${r} = ${c*r} copies`;}
function fitPreview(){
 const wrap=document.querySelector('.preview-wrap'); if(!wrap||!canvas.width||!canvas.height)return;
 applyPreviewTransform();
}
function applyPreviewTransform(){canvas.style.removeProperty('--preview-width');canvas.style.removeProperty('--preview-rotation');}
function updateDesignControls(){ if($('polaroidDesign')){ const selected=$('polaroidDesign').value; const showCustom=currentMode==='polaroid'&&(state.design==='custom'||selected==='custom'); $('customBgLabel').hidden=false; $('customBgLabel').style.display=showCustom?'block':'none'; if($('filmstripLayoutLabel')){$('filmstripLayoutLabel').style.display=(currentMode==='polaroid'&&state.sizes[0]?.name==='FilmStrip')?'block':'none';$('filmstripLayout').value=state.filmstripLayout||'1';} } if($('xeroxColorMode')){ $('xeroxColorMode').value=state.xeroxMode||'color'; $('xeroxFrontThumb').hidden=!state.xeroxFrontUrl; $('xeroxBackThumb').hidden=!state.xeroxBackUrl; if(state.xeroxFrontUrl)$('xeroxFrontThumb').src=state.xeroxFrontUrl; if(state.xeroxBackUrl)$('xeroxBackThumb').src=state.xeroxBackUrl; }}
function updateOutputs(){ updateDesignControls(); $('margin').value=state.margin ?? 0.2; $('spacing').value=state.spacing ?? 0.06; $('landscape').checked=!!state.landscape; $('guides').checked=state.guides!==false; $('labels').checked=state.labels!==false; $('marginOut').textContent=(+$('margin').value).toFixed(2)+' in'; $('spacingOut').textContent=(+$('spacing').value).toFixed(2)+' in'; $('zoom').value=state.zoom; $('brightness').value=state.brightness; $('contrast').value=state.contrast; $('zoomOut').textContent=Math.round(state.zoom*100)+'%'; $('brightOut').textContent=state.brightness+'%'; $('contrastOut').textContent=state.contrast+'%'; applyPreviewTransform();}
function refreshSizeList(){ $('sizeList').innerHTML=state.sizes.map((s,i)=>`<div class="size-item"><span><b>${s.name||'Custom'}</b> · ${s.w}×${s.h} ${s.unit} · ${s.qty} copies</span><button data-del="${i}">Remove</button></div>`).join('');}
function pageLayout(){fitDpi(); const margin=(state.margin ?? +$('margin').value)*DPI, spacing=(state.spacing ?? +$('spacing').value)*DPI; let x=margin,y=margin,rowH=0,items=[]; const maxW=canvas.width-margin,maxH=canvas.height-margin; let photoIndex=0; if(currentMode==='id-xerox'){const cardW=3.375*DPI,cardH=2.125*DPI,gap=Math.max(spacing,0.35*DPI);const totalH=cardH*2+gap;const startX=(canvas.width-cardW)/2;const startY=(canvas.height-totalH)/2;items.push({x:startX,y:startY,w:cardW,h:cardH,photoIndex:0,label:'Front ID'});items.push({x:startX,y:startY+cardH+gap,w:cardW,h:cardH,photoIndex:1,label:'Back ID'});return {items,pages:1,overflow:false};} for(const s of state.sizes){const w=unitToIn(s.w,s.unit)*DPI,h=unitToIn(s.h,s.unit)*DPI; const qty=(currentMode==='polaroid'&&state.photos?.length)?state.photos.length:s.qty; for(let i=0;i<qty;i++){ if(x+w>maxW+.1){x=margin;y+=rowH+spacing;rowH=0} if(y+h>maxH+.1) return {items,pages:2,overflow:true}; items.push({x,y,w,h,photoIndex:photoIndex++,photoW:s.photoW?unitToIn(s.photoW,s.unit)*DPI:null,photoH:s.photoH?unitToIn(s.photoH,s.unit)*DPI:null,label:`${s.name||''} ${s.w}×${s.h} ${s.unit}${s.photoW?` · photo ${s.photoW}×${s.photoH}`:''}`}); x+=w+spacing; rowH=Math.max(rowH,h); }}
 // center each visual row
 const rows=[]; items.forEach(it=>{let row=rows.find(r=>Math.abs(r.y-it.y)<2); if(!row){row={y:it.y,items:[]}; rows.push(row)} row.items.push(it)}); rows.forEach(r=>{const minX=Math.min(...r.items.map(i=>i.x)),maxX=Math.max(...r.items.map(i=>i.x+i.w)); const off=(canvas.width-(maxX-minX))/2-minX; r.items.forEach(i=>i.x+=off)}); return {items,pages:1,overflow:false};}
function drawPlaceholder(x,y,w,h){ctx.fillStyle='#e5f2fc';ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(157,204,242,.10)';ctx.lineWidth=4;ctx.strokeRect(x,y,w,h);ctx.fillStyle='#2783de';ctx.font='bold 42px system-ui';ctx.textAlign='center';ctx.fillText('Upload Photo',x+w/2,y+h/2)}
function drawFilmstrip(it){
 const layout=state.filmstripLayout||'1';
 ctx.save();
 ctx.fillStyle=state.design==='dark'?'#20242c':'#fff';ctx.fillRect(it.x,it.y,it.w,it.h);
 if(state.design==='custom'&&state.bgImage){ctx.save();ctx.beginPath();ctx.rect(it.x,it.y,it.w,it.h);ctx.clip();const sc=Math.max(it.w/state.bgImage.width,it.h/state.bgImage.height);const bw=state.bgImage.width*sc,bh=state.bgImage.height*sc;ctx.drawImage(state.bgImage,it.x+(it.w-bw)/2,it.y+(it.h-bh)/2,bw,bh);ctx.restore();}
 ctx.strokeStyle='rgba(20,40,70,.10)';ctx.lineWidth=3;ctx.strokeRect(it.x,it.y,it.w,it.h);
 const pad=0.14*DPI,gap=0.035*DPI,logoH=layout==='4'?0.36*DPI:0;
 const stampH=(layout==='1'||layout==='2')?0.42*DPI:0.72*DPI;
 const top=it.y+pad+logoH, usableH=it.h-pad*2-stampH-logoH;
 let slots=[];
 if(layout==='1'){
   const square=1.6*DPI;
   const x=it.x+(it.w-square)/2;
   const y0=it.y+0.26*DPI;
   const yGap=0.22*DPI;
   for(let i=0;i<3;i++)slots.push({x,y:y0+i*(square+yGap),w:square,h:square});
 }else if(layout==='2'){
   const h=(usableH-gap)/2; for(let i=0;i<2;i++)slots.push({x:it.x+pad,y:top+i*(h+gap),w:it.w-pad*2,h});
 }else{
   const h=(usableH-gap*2)/3; for(let i=0;i<3;i++)slots.push({x:it.x+pad,y:top+i*(h+gap),w:it.w-pad*2,h});
 }
 if(layout==='4'){
   ctx.fillStyle='#e14b44';ctx.font='bold 38px system-ui';ctx.textAlign='center';ctx.fillText('LOGO 2',it.x+it.w/2,it.y+0.34*DPI);
 }
 slots.forEach((slot,idx)=>{
   ctx.save();ctx.shadowColor='rgba(17,34,51,.18)';ctx.shadowBlur=10;ctx.shadowOffsetY=4;ctx.fillStyle='#aecaca';ctx.fillRect(slot.x,slot.y,slot.w,slot.h);ctx.shadowColor='transparent';ctx.strokeStyle='rgba(20,40,70,.10)';ctx.strokeRect(slot.x,slot.y,slot.w,slot.h);
   const img=(state.photos?.length?state.photos[idx%state.photos.length]:state.processed);
   if(img){ctx.beginPath();ctx.rect(slot.x,slot.y,slot.w,slot.h);ctx.clip();const sc=Math.max(slot.w/img.width,slot.h/img.height);const dw=img.width*sc,dh=img.height*sc;ctx.drawImage(img,slot.x+(slot.w-dw)/2,slot.y+(slot.h-dh)/2,dw,dh);}
   ctx.restore();
 });
 // Photobooth-style red stamp copied from the reference layouts
 ctx.save();ctx.translate(it.x+it.w/2,it.y+it.h-(layout==='1'?0.32*DPI:stampH*.55));ctx.rotate(-0.22);ctx.fillStyle='#e14b44';ctx.beginPath();ctx.moveTo(-0.38*DPI,-0.12*DPI);ctx.lineTo(0.52*DPI,-0.27*DPI);ctx.lineTo(0.63*DPI,0.20*DPI);ctx.lineTo(-0.20*DPI,0.32*DPI);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 23px system-ui';ctx.textAlign='center';ctx.fillText('PHOTOBOOTH',0.05*DPI,-0.04*DPI);ctx.font='bold 26px system-ui';ctx.fillText('DETROIT.COM',0.18*DPI,0.18*DPI);ctx.restore();
 ctx.restore();
}
function drawPhoto(it){
 const isInstax=currentMode==='polaroid'&&it.photoW&&it.photoH;
 if(isInstax&&state.sizes[0]?.name==='FilmStrip'){drawFilmstrip(it);return;}
 const photo={x:it.x,y:it.y,w:it.w,h:it.h};
 if(isInstax){ctx.save();const designs={classic:'#fff',pastel:'#eaf6ff',cream:'#fff6df',dark:'#20242c',custom:'#fff'};ctx.fillStyle=designs[state.design||'classic']||'#fff';ctx.fillRect(it.x,it.y,it.w,it.h);if(state.design==='custom'&&state.bgImage){ctx.save();ctx.beginPath();ctx.rect(it.x,it.y,it.w,it.h);ctx.clip();ctx.globalAlpha=.95;const sc=Math.max(it.w/state.bgImage.width,it.h/state.bgImage.height);const bw=state.bgImage.width*sc,bh=state.bgImage.height*sc;ctx.drawImage(state.bgImage,it.x+(it.w-bw)/2,it.y+(it.h-bh)/2,bw,bh);ctx.restore()}if(state.design==='pastel'){ctx.fillStyle='rgba(39,131,222,.10)';ctx.fillRect(it.x,it.y,it.w,it.h)}if(state.design==='cream'){ctx.fillStyle='rgba(213,128,59,.08)';ctx.fillRect(it.x,it.y,it.w,it.h)}ctx.strokeStyle=state.design==='dark'?'rgba(255,255,255,.18)':'rgba(20,40,70,.45)';ctx.lineWidth=3;ctx.strokeRect(it.x,it.y,it.w,it.h);photo.w=it.photoW;photo.h=it.photoH;photo.x=it.x+(it.w-photo.w)/2;photo.y=it.y+Math.max(0.16*DPI,(it.h-photo.h)*0.22);ctx.shadowColor='rgba(17,34,51,.28)';ctx.shadowBlur=18;ctx.shadowOffsetX=0;ctx.shadowOffsetY=10;ctx.fillStyle='rgba(255,255,255,.98)';ctx.fillRect(photo.x,photo.y,photo.w,photo.h);ctx.shadowColor='transparent';ctx.strokeStyle='rgba(20,40,70,.10)';ctx.lineWidth=2;ctx.strokeRect(photo.x,photo.y,photo.w,photo.h);ctx.restore()}
 ctx.save();ctx.beginPath();ctx.rect(photo.x,photo.y,photo.w,photo.h);ctx.clip();ctx.filter=`brightness(${state.brightness}%) contrast(${state.contrast}%)`;
 const sourceImg=currentMode==='id-xerox'?(it.photoIndex%2===0?state.xeroxFront:state.xeroxBack):((currentMode==='polaroid'&&state.photos?.length)?state.photos[it.photoIndex%state.photos.length]:state.processed);
 if(!sourceImg){drawPlaceholder(photo.x,photo.y,photo.w,photo.h);ctx.restore();return}
 const img=sourceImg; if(currentMode==='id-xerox'&&state.xeroxMode==='bw')ctx.filter='grayscale(100%) contrast(110%)'; ctx.translate(photo.x+photo.w/2,photo.y+photo.h/2); ctx.rotate(state.rotation*Math.PI/180); ctx.scale(state.flip?-1:1,1); const scale=Math.max(photo.w/img.width,photo.h/img.height)*state.zoom; const dw=img.width*scale,dh=img.height*scale; ctx.drawImage(img,-dw/2,-dh/2,dw,dh); ctx.restore();
 if(isInstax&&state.labels){ctx.save();ctx.fillStyle=state.design==='dark'?'rgba(255,255,255,.82)':'rgba(0,0,0,.72)';ctx.font='bold 24px system-ui';ctx.textAlign='center';ctx.fillText(it.label.split(' ')[0],it.x+it.w/2,it.y+it.h-0.22*DPI);ctx.restore()}
}

function render(){updateOutputs();fitDpi();ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height); const {items,pages,overflow}=pageLayout(); items.forEach(drawPhoto); if(state.guides){ctx.save();ctx.strokeStyle='rgba(39,131,222,.10)';ctx.setLineDash([12,8]);ctx.lineWidth=2;items.forEach(i=>ctx.strokeRect(i.x,i.y,i.w,i.h));ctx.restore()} if(state.labels){ctx.fillStyle='rgba(0,0,0,.62)';ctx.font='26px system-ui';items.forEach(i=>ctx.fillText(i.label.trim(),i.x+10,i.y+i.h-14))} const total=(currentMode==='polaroid'&&state.photos?.length)?state.photos.length:state.sizes.reduce((a,s)=>a+s.qty,0);$('stats').textContent=`Page 1 of ${pages}${overflow?' (more photos do not fit)':''} · ${total} photos`;}
function renderPhotoGallery(){const g=$('photoGallery'); if(!g)return; g.innerHTML=(state.photos||[]).map((img,i)=>`<button class="photo-tile" data-crop-photo="${i}"><img src="${img.src}" alt="Photo ${i+1}"><small>Crop ${i+1}</small></button>`).join('');}
function loadFile(fileList){const files=[...(fileList?.length!==undefined?fileList:[fileList])].filter(Boolean); if(!files.length)return; if(files.some(f=>!/^image\/(png|jpeg)$/.test(f.type)))return alert('Please upload JPG or PNG images only.'); const urls=files.map(f=>URL.createObjectURL(f)); const loaded=[]; urls.forEach((url,idx)=>{const img=new Image(); img.onload=()=>{loaded[idx]=img; if(loaded.filter(Boolean).length===urls.length){state.image=loaded[0];state.processed=loaded[0];state.photos=currentMode==='polaroid'?loaded:[];state.imageUrl=urls[0];$('thumb').src=urls[0];$('thumb').hidden=false;$('openCrop').disabled=false;$('uploadCropBtn').disabled=false;$('cropImage').src=urls[0]; if(currentMode==='polaroid'&&state.sizes[0]){state.sizes[0].qty=loaded.length;state.sizes[0].cols=+$('cols').value||state.sizes[0].cols;state.sizes[0].rows=Math.ceil(loaded.length/(state.sizes[0].cols||1));$('rows').value=state.sizes[0].rows;refreshSizeList();updateFormula();} renderPhotoGallery(); render();}}; img.src=url;});}
function downloadCanvas(name){const a=document.createElement('a');a.download=name;a.href=canvas.toDataURL('image/png');a.click()}
renderButtons();refreshSizeList();updateFormula();render();setTimeout(fitPreview,0);window.addEventListener('resize',fitPreview);
$('paperToggle').addEventListener('click',()=>{const body=$('paperPanelBody');const collapsed=body.hidden=!body.hidden;$('paperToggle').setAttribute('aria-expanded',String(!collapsed));$('paperToggle').classList.toggle('collapsed',collapsed);setTimeout(fitPreview,0);});
function syncControlsFromState(){ const first=state.sizes[0]||{w:1,h:1,unit:'inch',qty:1}; $('photoW').value=first.w; $('photoH').value=first.h; $('unit').value=first.unit; const cols=Math.max(1,Math.round(Math.sqrt(first.qty||1))); $('cols').value=first.cols||cols; $('rows').value=first.rows||Math.ceil((first.qty||1)/cols); $('thumb').hidden=!state.imageUrl; if(state.imageUrl){$('thumb').src=state.imageUrl;$('cropImage').src=state.imageUrl;$('openCrop').disabled=false}else{$('thumb').removeAttribute('src');$('openCrop').disabled=true;$('uploadCropBtn').disabled=true} updateFormula(); refreshSizeList(); renderPhotoGallery(); renderButtons(); if($('paperSelect')) $('paperSelect').value=state.paper; if($('paperButtons')) document.querySelectorAll('[data-paper]').forEach(b=>b.classList.toggle('active',b.dataset.paper===state.paper)); render(); fitPreview();}
$('polaroidDesign').addEventListener('change',e=>{state.design=e.target.value;if(e.target.value==='custom'){$('customBgLabel').hidden=false;$('customBgLabel').style.display='block';}else{$('customBgLabel').style.display='none';}render();});
$('filmstripLayout').addEventListener('change',e=>{state.filmstripLayout=e.target.value;render();});
$('customBgInput').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;if(!/^image\/(png|jpeg)$/.test(f.type))return alert('Please upload a JPG or PNG background.');const url=URL.createObjectURL(f);const img=new Image();img.onload=()=>{state.bgImage=img;state.bgUrl=url;state.design='custom';updateDesignControls();render()};img.src=url;});

function loadXeroxSide(side,file){if(!file)return;if(!/^image\/(png|jpeg)$/.test(file.type))return alert('Please upload a JPG or PNG image.');const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{if(side==='front'){state.xeroxFront=img;state.xeroxFrontUrl=url}else{state.xeroxBack=img;state.xeroxBackUrl=url}updateDesignControls();render()};img.src=url;}
$('xeroxFrontInput').addEventListener('change',e=>loadXeroxSide('front',e.target.files[0]));
$('xeroxBackInput').addEventListener('change',e=>loadXeroxSide('back',e.target.files[0]));
document.querySelectorAll('[data-xerox-mode]').forEach(b=>b.addEventListener('click',()=>{state.xeroxMode=b.dataset.xeroxMode;document.querySelectorAll('[data-xerox-mode]').forEach(x=>{x.classList.toggle('primary',x===b);x.classList.toggle('secondary',x!==b)});render();}));
$('photoGallery').addEventListener('click',e=>{const btn=e.target.closest('[data-crop-photo]');if(!btn)return;const idx=+btn.dataset.cropPhoto;if(!state.photos[idx])return;state.cropIndex=idx;$('cropImage').src=state.photos[idx].src;document.querySelector('#cropDialog .modal-head h2').textContent='Crop Polaroid photo';$('cropDialog').classList.add('polaroid-crop');$('cropDialog').show();let cropTimer=null;setTimeout(()=>{state.cropper?.destroy();state.cropper=new Cropper($('cropImage'),{viewMode:1,autoCropArea:.9,background:false,crop(){clearTimeout(cropTimer);cropTimer=setTimeout(()=>{if(currentMode==='polaroid'&&state.cropIndex!==undefined&&state.cropper){const c=state.cropper.getCroppedCanvas({imageSmoothingQuality:'high'});const img=new Image();img.onload=()=>{state.photos[state.cropIndex]=img;if(state.cropIndex===0){state.processed=img;state.image=img}renderPhotoGallery();render()};img.src=c.toDataURL('image/png');}},180)}});},50);});

function wireXeroxDrop(id,side){const el=$(id); if(!el)return; ['dragenter','dragover'].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();el.classList.add('drag')})); ['dragleave','drop'].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();el.classList.remove('drag')})); el.addEventListener('drop',e=>loadXeroxSide(side,e.dataTransfer.files[0]));}
wireXeroxDrop('xeroxFrontDrop','front');wireXeroxDrop('xeroxBackDrop','back');
$('editFront').addEventListener('click',()=>{if(state.xeroxFrontUrl){document.querySelector('#cropDialog .modal-head h2').textContent='Crop front ID'; if($('cropRotateSlider')){$('cropRotateSlider').value=0;$('cropRotateOut').textContent='0°';}$('cropImage').src=state.xeroxFrontUrl;state.cropXerox='front';$('cropDialog').classList.add('polaroid-crop');$('cropDialog').show();let cropTimer=null;setTimeout(()=>{state.cropper?.destroy();state.cropper=new Cropper($('cropImage'),{viewMode:1,autoCropArea:.9,background:false,crop(){clearTimeout(cropTimer);cropTimer=setTimeout(()=>{if(currentMode==='id-xerox'&&state.cropXerox==='front'&&state.cropper){const c=state.cropper.getCroppedCanvas({imageSmoothingQuality:'high'});const img=new Image();img.onload=()=>{state.xeroxFront=img;state.xeroxFrontUrl=img.src;updateDesignControls();render()};img.src=c.toDataURL('image/png');}},180)}});},50)}});
$('editBack').addEventListener('click',()=>{if(state.xeroxBackUrl){document.querySelector('#cropDialog .modal-head h2').textContent='Crop back ID'; if($('cropRotateSlider')){$('cropRotateSlider').value=0;$('cropRotateOut').textContent='0°';}$('cropImage').src=state.xeroxBackUrl;state.cropXerox='back';$('cropDialog').classList.add('polaroid-crop');$('cropDialog').show();let cropTimer=null;setTimeout(()=>{state.cropper?.destroy();state.cropper=new Cropper($('cropImage'),{viewMode:1,autoCropArea:.9,background:false,crop(){clearTimeout(cropTimer);cropTimer=setTimeout(()=>{if(currentMode==='id-xerox'&&state.cropXerox==='back'&&state.cropper){const c=state.cropper.getCroppedCanvas({imageSmoothingQuality:'high'});const img=new Image();img.onload=()=>{state.xeroxBack=img;state.xeroxBackUrl=img.src;updateDesignControls();render()};img.src=c.toDataURL('image/png');}},180)}});},50)}});
if($('xeroxMargin')) $('xeroxMargin').addEventListener('input',()=>{state.margin=+$('xeroxMargin').value;$('margin').value=$('xeroxMargin').value;$('xeroxMarginOut').textContent=(+$('xeroxMargin').value).toFixed(2)+' in';render()});
if($('xeroxSpacing')) $('xeroxSpacing').addEventListener('input',()=>{state.spacing=+$('xeroxSpacing').value;$('spacing').value=$('xeroxSpacing').value;$('xeroxSpacingOut').textContent=(+$('xeroxSpacing').value).toFixed(2)+' in';render()});
$('modeSelect').addEventListener('change',e=>{currentMode=e.target.value;state=tabStates[currentMode];const names={'id-photo':'ID Photo Layout','polaroid':'Polaroid Layout','id-xerox':'ID Xerox Layout'};document.querySelector('.brand h1').textContent=names[currentMode]||'ID Photo Layout';syncControlsFromState();});
document.addEventListener('input',e=>{if(['cols','rows'].includes(e.target.id))updateFormula(); if(e.target.id==='zoom')state.zoom=+e.target.value; if(e.target.id==='brightness')state.brightness=+e.target.value; if(e.target.id==='contrast')state.contrast=+e.target.value; if(e.target.id==='margin')state.margin=+e.target.value; if(e.target.id==='spacing')state.spacing=+e.target.value; render();});
document.addEventListener('change',e=>{if(['landscape','guides','labels'].includes(e.target.id)){state[e.target.id]=e.target.checked;render();}});
$('fileInput').addEventListener('change',e=>loadFile(e.target.files));

let cameraStream=null,cameraTarget='general';
async function stopCamera(){if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}}
async function listCameras(){
 if(!navigator.mediaDevices?.enumerateDevices){$('cameraStatus').textContent='Camera API is not available in this browser.';return[];}
 try{try{const s=await navigator.mediaDevices.getUserMedia({video:true});s.getTracks().forEach(t=>t.stop());}catch(e){}
 const devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');
 $('cameraSelect').innerHTML=devices.map((d,i)=>`<option value="${d.deviceId}">${d.label||`Camera ${i+1}`}</option>`).join('');
 $('cameraStatus').textContent=devices.length?`${devices.length} camera(s) detected.`:'No cameras detected.';return devices;
 }catch(err){$('cameraStatus').textContent='Unable to detect cameras: '+err.message;return[];}
}
async function startCamera(deviceId){
 await stopCamera();
 const constraints={video:deviceId?{deviceId:{exact:deviceId}}:{facingMode:'environment'}};
 try{cameraStream=await navigator.mediaDevices.getUserMedia(constraints);$('cameraVideo').srcObject=cameraStream;$('cameraStatus').textContent='Camera ready.';}
 catch(err){$('cameraStatus').textContent='Unable to start camera: '+err.message;}
}
async function openCamera(target){
 cameraTarget=target;if($('idCameraGuide')) $('idCameraGuide').hidden=!(target==='front'||target==='back');$('cameraDialog').showModal();const devices=await listCameras();await startCamera(devices[0]?.deviceId);
}
$('cameraSelect').addEventListener('change',e=>startCamera(e.target.value));
$('refreshCameras').addEventListener('click',async()=>{const devices=await listCameras();await startCamera(devices[0]?.deviceId);});
$('closeCamera').addEventListener('click',async()=>{await stopCamera();$('cameraDialog').close();});
$('captureCamera').addEventListener('click',async()=>{
 const video=$('cameraVideo');if(!video.videoWidth)return;
 const c=$('cameraCanvas'),ctx2=c.getContext('2d');
 if(cameraTarget==='front'||cameraTarget==='back'){
   // Auto-crop exactly to the visible standard-ID guideline rectangle.
   const videoRect=video.getBoundingClientRect();
   const guideRect=$('idCameraGuide').getBoundingClientRect();
   const scaleX=video.videoWidth/videoRect.width, scaleY=video.videoHeight/videoRect.height;
   const sx=Math.max(0,(guideRect.left-videoRect.left)*scaleX);
   const sy=Math.max(0,(guideRect.top-videoRect.top)*scaleY);
   const sw=Math.min(video.videoWidth-sx,guideRect.width*scaleX);
   const sh=Math.min(video.videoHeight-sy,guideRect.height*scaleY);
   c.width=Math.round(sw); c.height=Math.round(sh);
   ctx2.drawImage(video,sx,sy,sw,sh,0,0,c.width,c.height);
 }else{
   c.width=video.videoWidth;c.height=video.videoHeight;ctx2.drawImage(video,0,0,c.width,c.height);
 }
 c.toBlob(async blob=>{const file=new File([blob],`camera-${Date.now()}.png`,{type:'image/png'});if(cameraTarget==='front')loadXeroxSide('front',file);else if(cameraTarget==='back')loadXeroxSide('back',file);else loadFile([file]);await stopCamera();$('cameraDialog').close();},'image/png');
});

$('browsePhotoBtn').addEventListener('click',e=>{e.preventDefault();$('fileInput').click();});
$('cameraPhotoBtn').addEventListener('click',e=>{e.preventDefault();openCamera('general');});
$('cameraInput').addEventListener('change',e=>loadFile(e.target.files));
$('browseFrontBtn').addEventListener('click',e=>{e.preventDefault();$('xeroxFrontInput').click();});
$('cameraFrontBtn').addEventListener('click',e=>{e.preventDefault();openCamera('front');});
$('browseBackBtn').addEventListener('click',e=>{e.preventDefault();$('xeroxBackInput').click();});
$('cameraBackBtn').addEventListener('click',e=>{e.preventDefault();openCamera('back');});
$('xeroxFrontCamera').addEventListener('change',e=>loadXeroxSide('front',e.target.files[0]));
$('xeroxBackCamera').addEventListener('change',e=>loadXeroxSide('back',e.target.files[0]));

$('uploadCropBtn').addEventListener('click',()=>$('openCrop').click()); ['dragenter','dragover'].forEach(ev=>$('dropZone').addEventListener(ev,e=>{e.preventDefault();$('dropZone').classList.add('drag')})); ['dragleave','drop'].forEach(ev=>$('dropZone').addEventListener(ev,e=>{e.preventDefault();$('dropZone').classList.remove('drag')})); $('dropZone').addEventListener('drop',e=>loadFile(e.dataTransfer.files));
function applyPreset(k){document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('active',b.dataset.preset===k)); const p=presetSets[currentMode].items[k]; $('photoW').value=p.w;$('photoH').value=p.h;$('unit').value=p.unit;$('cols').value=p.cols;$('rows').value=p.rows; state.sizes=[{name:k,w:p.w,h:p.h,unit:p.unit,photoW:p.photoW,photoH:p.photoH,qty:(currentMode==='polaroid'&&state.photos?.length)?state.photos.length:p.cols*p.rows,cols:p.cols,rows:(currentMode==='polaroid'&&state.photos?.length)?Math.ceil(state.photos.length/p.cols):p.rows}]; updateFormula();refreshSizeList();render();}
$('presetButtons').onclick=e=>{const k=e.target.dataset.preset;if(!k)return;applyPreset(k);};
$('paperButtons').onclick=e=>{if(!e.target.dataset.paper)return;state.paper=e.target.dataset.paper;document.querySelectorAll('[data-paper]').forEach(b=>b.classList.toggle('active',b.dataset.paper===state.paper));render();};
if($('xeroxPaperButtons')) $('xeroxPaperButtons').onclick=e=>{if(!e.target.dataset.xeroxPaper)return;state.paper=e.target.dataset.xeroxPaper;document.querySelectorAll('[data-xerox-paper]').forEach(b=>b.classList.toggle('active',b.dataset.xeroxPaper===state.paper));render();};
$('addSize').onclick=()=>{state.sizes.push({name:'Custom',w:+$('photoW').value,h:+$('photoH').value,unit:$('unit').value,qty:(+$('cols').value||1)*(+$('rows').value||1),cols:+$('cols').value||1,rows:+$('rows').value||1});refreshSizeList();render();};
$('sizeList').onclick=e=>{if(e.target.dataset.del!==undefined){state.sizes.splice(+e.target.dataset.del,1); if(!state.sizes.length)state.sizes.push(structuredClone(defaultStates[currentMode].sizes[0]));refreshSizeList();render();}};
$('rotL').onclick=()=>{state.rotation-=90;render()};$('rotR').onclick=()=>{state.rotation+=90;render()};$('flip').onclick=()=>{state.flip=!state.flip;render()};

$('downloadPng').onclick=()=>downloadCanvas('id-photo-layout-300dpi.png');
$('downloadPdf').onclick=()=>{const {jsPDF}=window.jspdf;let p={...papers[state.paper]};if($('landscape').checked&&p.h>p.w)[p.w,p.h]=[p.h,p.w];const pdf=new jsPDF({orientation:p.w>p.h?'l':'p',unit:'in',format:[p.w,p.h]});pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,p.w,p.h);pdf.save('id-photo-layout.pdf')};
$('printBtn').onclick=()=>{const w=window.open('');w.document.write(`<img src="${canvas.toDataURL()}" style="width:100%;height:auto">`);w.document.close();w.print()};
$('openCrop').onclick=()=>{document.querySelector('#cropDialog .modal-head h2').textContent=currentMode==='id-photo'?'Crop ID photo':'Crop image'; if($('cropRotateSlider')){$('cropRotateSlider').value=0;$('cropRotateOut').textContent='0°';}if(!state.image)return;if(currentMode==='id-photo'){$('cropDialog').classList.add('polaroid-crop');$('cropDialog').show();let cropTimer=null;setTimeout(()=>{state.cropper?.destroy();state.cropper=new Cropper($('cropImage'),{viewMode:1,autoCropArea:.9,background:false,crop(){clearTimeout(cropTimer);cropTimer=setTimeout(()=>{if(currentMode==='id-photo'&&state.cropper){const c=state.cropper.getCroppedCanvas({imageSmoothingQuality:'high'});const img=new Image();img.onload=()=>{state.processed=img;render()};img.src=c.toDataURL('image/png');}},180)}});},50)}else{$('cropDialog').showModal();setTimeout(()=>{state.cropper?.destroy();state.cropper=new Cropper($('cropImage'),{viewMode:1,autoCropArea:.9,background:false});},50)}};

$('cropRotateSlider').addEventListener('input',e=>{if(!state.cropper)return;const deg=+e.target.value;$('cropRotateOut').textContent=deg+'°';state.cropper.rotateTo(deg);if(currentMode==='id-xerox'){clearTimeout(state.cropRotateTimer);state.cropRotateTimer=setTimeout(()=>{const c=state.cropper.getCroppedCanvas({imageSmoothingQuality:'high'});const img=new Image();img.onload=()=>{if(state.cropXerox==='front'){state.xeroxFront=img;state.xeroxFrontUrl=img.src}else if(state.cropXerox==='back'){state.xeroxBack=img;state.xeroxBackUrl=img.src}updateDesignControls();render()};img.src=c.toDataURL('image/png');},160)}});
$('cropRotateBtn').addEventListener('click',()=>{if(state.cropper){state.cropper.rotate(90); if(currentMode==='id-xerox'||currentMode==='id-photo'||currentMode==='polaroid'){setTimeout(()=>{const c=state.cropper.getCroppedCanvas({imageSmoothingQuality:'high'});const img=new Image();img.onload=()=>{if(currentMode==='id-xerox'&&state.cropXerox){if(state.cropXerox==='front'){state.xeroxFront=img;state.xeroxFrontUrl=img.src}else{state.xeroxBack=img;state.xeroxBackUrl=img.src}updateDesignControls();}else if(currentMode==='polaroid'&&state.cropIndex!==undefined){state.photos[state.cropIndex]=img;if(state.cropIndex===0){state.processed=img;state.image=img}renderPhotoGallery();}else if(currentMode==='id-photo'){state.processed=img;}render()};img.src=c.toDataURL('image/png');},120)}}});
$('closeCrop').onclick=()=>{state.cropper?.destroy();state.cropper=null;$('cropDialog').classList.remove('polaroid-crop');$('cropDialog').close();};$('resetCrop').onclick=()=>state.cropper?.reset();$('applyCrop').onclick=()=>{const c=state.cropper.getCroppedCanvas({imageSmoothingQuality:'high'});const img=new Image();img.onload=()=>{if(currentMode==='id-xerox'&&state.cropXerox){if(state.cropXerox==='front'){state.xeroxFront=img;state.xeroxFrontUrl=img.src}else{state.xeroxBack=img;state.xeroxBackUrl=img.src}delete state.cropXerox;updateDesignControls();}
else if(currentMode==='polaroid'&&state.cropIndex!==undefined){state.photos[state.cropIndex]=img; if(state.cropIndex===0){state.processed=img;state.image=img} renderPhotoGallery(); delete state.cropIndex;}else{state.processed=img;}render()};img.src=c.toDataURL('image/png');$('cropDialog').classList.remove('polaroid-crop');$('cropDialog').close();};