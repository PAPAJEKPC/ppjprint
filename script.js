const DPI=300;const presets={"1x1":[1,1,"inch",8],"1.5x1.5":[1.5,1.5,"inch",6],"2x2":[2,2,"inch",4],Passport:[35,45,"mm",8],Visa:[2,2,"inch",4],"Half Body":[3,4,"inch",2],Wallet:[2.5,3.5,"inch",4]};const papers={"3R":[3.5,5],"4R":[4,6],"5R":[5,7],A4:[8.27,11.69],Custom:[8.5,11]};let state={paper:"4R",sizes:[{w:2,h:2,unit:"inch",qty:4,label:"2 x 2"}],image:null,cropper:null,flip:1,rotation:0};const $=id=>document.getElementById(id);function toIn(v,u){v=+v||0;return u==='mm'?v/25.4:u==='cm'?v/2.54:v}function init(){Object.keys(presets).forEach(k=>{let b=document.createElement('button');b.textContent=k;b.onclick=()=>selectPreset(k);$('presetGrid').appendChild(b)});Object.keys(papers).forEach(k=>{let b=document.createElement('button');b.textContent=k;b.onclick=()=>{state.paper=k;renderButtons();draw()};$('paperGrid').appendChild(b)});$('applyCustomPaper').onclick=()=>{papers.Custom=[+$('customPaperWidth').value||8.5,+$('customPaperHeight').value||11];state.paper='Custom';renderButtons();draw()};['margin','spacing','brightness','contrast','zoom','landscape','guides','labels','borders','customPaperWidth','customPaperHeight'].forEach(id=>$(id).addEventListener('input',draw));$('zoom').oninput=e=>{if(state.cropper)state.cropper.zoomTo(e.target.value/100);$('zoomValue').textContent=e.target.value+'%';draw()};$('brightness').oninput=e=>$('brightnessValue').textContent=e.target.value+'%';$('contrast').oninput=e=>$('contrastValue').textContent=e.target.value+'%';$('margin').oninput=e=>$('marginValue').textContent=(+e.target.value).toFixed(2)+' in';$('spacing').oninput=e=>$('spacingValue').textContent=(+e.target.value).toFixed(2)+' in';$('addSize').onclick=addSize;$('rotate').onclick=()=>{state.rotation=(state.rotation+90)%360;if(state.cropper)state.cropper.rotate(90);draw()};$('flip').onclick=()=>{state.flip*=-1;if(state.cropper)state.cropper.scaleX(state.flip);draw()};$('downloadPng').onclick=downloadPNG;$('downloadPdf').onclick=downloadPDF;$('printBtn').onclick=printCanvas;setupUpload();renderButtons();renderSizeList();draw()}function selectPreset(k){let p=presets[k];$('photoWidth').value=p[0];$('photoHeight').value=p[1];$('unit').value=p[2];$('quantity').value=p[3];state.sizes=[{w:p[0],h:p[1],unit:p[2],qty:p[3],label:k}];renderSizeList();renderButtons(k);draw()}function renderButtons(active){[...$('presetGrid').children].forEach(b=>b.classList.toggle('active',b.textContent===active));[...$('paperGrid').children].forEach(b=>b.classList.toggle('active',b.textContent===state.paper))}function addSize(){state.sizes.push({w:+$('photoWidth').value,h:+$('photoHeight').value,unit:$('unit').value,qty:+$('quantity').value,label:`${$('photoWidth').value} x ${$('photoHeight').value}`});renderSizeList();draw()}function renderSizeList(){$('sizeList').innerHTML='';state.sizes.forEach((s,i)=>{let d=document.createElement('div');d.className='size-item';d.innerHTML=`<div><b>${s.label}</b><br><small>${s.w} × ${s.h} ${s.unit} · ${s.qty} copies</small></div><button class="remove">×</button>`;d.querySelector('button').onclick=()=>{state.sizes.splice(i,1);renderSizeList();draw()};$('sizeList').appendChild(d)})}function setupUpload(){const dz=$('dropZone'),fi=$('fileInput');['dragenter','dragover'].forEach(e=>dz.addEventListener(e,ev=>{ev.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(e=>dz.addEventListener(e,ev=>{ev.preventDefault();dz.classList.remove('drag')}));dz.addEventListener('drop',e=>loadFile(e.dataTransfer.files[0]));fi.onchange=e=>loadFile(e.target.files[0]);dz.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')fi.click()}}function loadFile(f){if(!f||!/image\/(jpeg|png)/.test(f.type))return alert('Please upload a JPG or PNG.');let url=URL.createObjectURL(f);$('thumb').src=url;$('thumb').hidden=false;$('dropText').hidden=true;$('cropImage').src=url;$('cropImage').onload=()=>{if(state.cropper)state.cropper.destroy();state.cropper=new Cropper($('cropImage'),{viewMode:1,autoCropArea:1,background:false,responsive:true,crop:()=>draw(),ready:()=>draw()});state.image=url;draw()}}function layoutPhotos(pw,ph,margin,spacing){let items=[];state.sizes.forEach(s=>{for(let i=0;i<s.qty;i++)items.push({w:toIn(s.w,s.unit)*DPI,h:toIn(s.h,s.unit)*DPI,label:s.label})});let pages=[],page=[];let y=margin,x=margin,rowH=0,row=[];function flushRow(){if(!row.length)return;let rowW=row.reduce((a,it)=>a+it.w,0)+spacing*(row.length-1);let offset=(pw-rowW)/2;row.forEach((it,idx)=>{it.x=offset+row.slice(0,idx).reduce((a,r)=>a+r.w+spacing,0);it.y=y;page.push(it)});y+=rowH+spacing;x=margin;rowH=0;row=[]}items.forEach(it=>{if(x+it.w>pw-margin&&row.length){flushRow()}if(y+it.h>ph-margin&&page.length){flushRow();pages.push(page);page=[];y=margin}row.push(it);x+=it.w+spacing;rowH=Math.max(rowH,it.h)});flushRow();if(page.length)pages.push(page);return pages.length?pages:[[]]}function getCroppedCanvas(){if(!state.cropper)return null;return state.cropper.getCroppedCanvas({imageSmoothingQuality:'high'})}function draw(){let [wi,hi]=papers[state.paper];if($('landscape').checked)[wi,hi]=[hi,wi];const canvas=$('previewCanvas'),ctx=canvas.getContext('2d');canvas.width=Math.round(wi*DPI);canvas.height=Math.round(hi*DPI);let margin=+$('margin').value*DPI,spacing=+$('spacing').value*DPI;let pages=layoutPhotos(canvas.width,canvas.height,margin,spacing);let total=state.sizes.reduce((a,s)=>a+s.qty,0);$('pageCount').textContent=pages.length+' page'+(pages.length>1?'s':'');$('totalPhotos').textContent=total+' photo'+(total!==1?'s':'');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#d9d9d9';ctx.lineWidth=2;ctx.strokeRect(1,1,canvas.width-2,canvas.height-2);let img=getCroppedCanvas();pages[0].forEach(it=>{ctx.save();let bg=ctx.createLinearGradient(it.x,it.y,it.x+it.w,it.y+it.h);bg.addColorStop(0,'#eefbff');bg.addColorStop(1,'#fff1fe');ctx.fillStyle=bg;ctx.fillRect(it.x,it.y,it.w,it.h);if($('borders').checked){let grad=ctx.createLinearGradient(it.x,it.y,it.x+it.w,it.y+it.h);grad.addColorStop(0,'#00e5ff');grad.addColorStop(.55,'#7c3cff');grad.addColorStop(1,'#ff2bd6');ctx.strokeStyle=grad;ctx.lineWidth=5;ctx.shadowColor='rgba(0,229,255,.45)';ctx.shadowBlur=16;ctx.strokeRect(it.x,it.y,it.w,it.h);ctx.shadowBlur=0;}if(img){ctx.filter=`brightness(${$('brightness').value}%) contrast(${$('contrast').value}%)`;ctx.drawImage(img,it.x,it.y,it.w,it.h);ctx.filter='none'}else{ctx.fillStyle='#7d7a75';ctx.textAlign='center';ctx.font='48px Arial';ctx.fillText('Upload photo',it.x+it.w/2,it.y+it.h/2)}if($('guides').checked){ctx.strokeStyle='rgba(255,43,214,.65)';ctx.setLineDash([18,12]);ctx.strokeRect(it.x-8,it.y-8,it.w+16,it.h+16);ctx.setLineDash([])}if($('labels').checked){ctx.fillStyle='rgba(124,60,255,.95)';ctx.font='bold 34px Arial';ctx.textAlign='left';ctx.fillText(it.label,it.x+18,it.y+44)}ctx.restore()})}function downloadPNG(){draw();let a=document.createElement('a');a.download='id-photo-layout.png';a.href=$('previewCanvas').toDataURL('image/png');a.click()}function downloadPDF(){draw();const {jsPDF}=window.jspdf;let c=$('previewCanvas'),orientation=c.width>c.height?'landscape':'portrait',pdf=new jsPDF({orientation,unit:'in',format:[c.width/DPI,c.height/DPI]});pdf.addImage(c.toDataURL('image/png'),'PNG',0,0,c.width/DPI,c.height/DPI);pdf.save('id-photo-layout.pdf')}function printCanvas(){draw();let w=open('');w.document.write(`<img src="${$('previewCanvas').toDataURL()}" style="width:100%"><script>print();<\/script>`);w.document.close()}init();

// PAPAJEK PRINT: ID card front/back uploader with independent crop support
state.idCards = { front:null, back:null, cropper:null, active:null };
function setupIdCardPrint(){
  const bind=(side)=>{
    const input=$(side+'Input'), drop=$(side+'Drop');
    if(!input||!drop)return;
    input.onchange=e=>openIdCrop(side,e.target.files[0]);
    ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('drag')}));
    ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('drag')}));
    drop.addEventListener('drop',e=>openIdCrop(side,e.dataTransfer.files[0]));
  };
  bind('front');bind('back');
  $('cancelIdCrop').onclick=()=>closeIdCrop();
  $('saveIdCrop').onclick=saveIdCrop;
  $('addIdCards').onclick=addIdCardLayout;
  ['idCardWidth','idCardHeight','idCardCopies','idCardMode','idCardOutput','idMoveX','idMoveY'].forEach(id=>$(id).addEventListener('input',draw));
}
function openIdCrop(side,file){
  if(!file||!/image\/(jpeg|png)/.test(file.type))return alert('Please upload a JPG or PNG.');
  state.idCards.active=side;
  $('idCropTitle').textContent=(side==='front'?'Crop Front ID':'Crop Back ID');
  $('idCropImage').src=URL.createObjectURL(file);
  $('idCropModal').classList.add('open');
  setTimeout(()=>{ if(state.idCards.cropper)state.idCards.cropper.destroy(); state.idCards.cropper=new Cropper($('idCropImage'),{aspectRatio:+$('idCardWidth').value/+$('idCardHeight').value,viewMode:1,autoCropArea:1,background:false}); },60);
}
function closeIdCrop(){ if(state.idCards.cropper){state.idCards.cropper.destroy();state.idCards.cropper=null}$('idCropModal').classList.remove('open') }
function saveIdCrop(){
  if(!state.idCards.cropper)return;
  const side=state.idCards.active;
  const c=state.idCards.cropper.getCroppedCanvas({width:1011,height:639,imageSmoothingQuality:'high'});
  state.idCards[side]=c;
  $(side+'Thumb').src=c.toDataURL('image/png');$(side+'Thumb').hidden=false;$(side+'Text').hidden=true;
  closeIdCrop();draw();
}
function addIdCardLayout(){
  const w=+$('idCardWidth').value,h=+$('idCardHeight').value,copies=+$('idCardCopies').value,mode=$('idCardMode').value;
  let qty= mode==='pair'? copies*2: copies;
  state.sizes.push({w,h,unit:'inch',qty,label:mode==='pair'?'ID Front/Back':'ID Card',idCard:true,mode,copies,output:$('idCardOutput').value,moveX:+$('idMoveX').value,moveY:+$('idMoveY').value});
  renderSizeList();draw();
}
const oldLayoutPhotos=layoutPhotos;
layoutPhotos=function(pw,ph,margin,spacing){
  let normalItems=[], idGroups=[];
  state.sizes.forEach(s=>{
    if(s.idCard){ idGroups.push(s); }
    else{for(let i=0;i<s.qty;i++)normalItems.push({w:toIn(s.w,s.unit)*DPI,h:toIn(s.h,s.unit)*DPI,label:s.label})}
  });
  let items=[...normalItems];
  idGroups.forEach(s=>{
    const cw=toIn(s.w,s.unit)*DPI, ch=toIn(s.h,s.unit)*DPI;
    const output=s.output||$('idCardOutput')?.value||'topBottom';
    const currentMoveX = $('idMoveX') ? +$('idMoveX').value : 0;
    const currentMoveY = $('idMoveY') ? +$('idMoveY').value : 0;
    const moveX=((s.moveX ?? currentMoveX) || 0)*DPI, moveY=((s.moveY ?? currentMoveY) || 0)*DPI;
    for(let i=0;i<s.copies;i++){
      if(s.mode==='frontOnly'||s.mode==='backOnly'){
        const side=s.mode==='frontOnly'?'front':'back';
        items.push({w:cw,h:ch,label:side==='front'?'ID FRONT':'ID BACK',idSide:side,forceCenter:true,moveX,moveY});
      }else{
        const gap=spacing;
        const gw=output==='sideBySide'?cw*2+gap:cw;
        const gh=output==='sideBySide'?ch:ch*2+gap;
        items.push({w:gw,h:gh,label:'ID PAIR',idPair:true,output,cw,ch,gap,moveX,moveY});
      }
    }
  });
  let pages=[],page=[];let y=margin,x=margin,rowH=0,row=[];
  function pushCentered(it){
    if(page.length||row.length){flushRow(); if(page.length){pages.push(page);page=[];y=margin}}
    it.x=(pw-it.w)/2+(it.moveX||0); it.y=(ph-it.h)/2+(it.moveY||0);
    it.x=Math.max(margin,Math.min(pw-margin-it.w,it.x)); it.y=Math.max(margin,Math.min(ph-margin-it.h,it.y));
    page.push(it); pages.push(page); page=[]; y=margin; x=margin; rowH=0;
  }
  function flushRow(){if(!row.length)return;let rowW=row.reduce((a,it)=>a+it.w,0)+spacing*(row.length-1);let offset=(pw-rowW)/2;row.forEach((it,idx)=>{it.x=offset+row.slice(0,idx).reduce((a,r)=>a+r.w+spacing,0);it.y=y;page.push(it)});y+=rowH+spacing;x=margin;rowH=0;row=[]}
  items.forEach(it=>{if(it.idPair||it.forceCenter){pushCentered(it);return} if(x+it.w>pw-margin&&row.length)flushRow();if(y+it.h>ph-margin&&page.length){flushRow();pages.push(page);page=[];y=margin}row.push(it);x+=it.w+spacing;rowH=Math.max(rowH,it.h)});flushRow();if(page.length)pages.push(page);return pages.length?pages:[[]]
};
const oldGetCroppedCanvas=getCroppedCanvas;
getCroppedCanvas=function(){return oldGetCroppedCanvas()};
const oldDraw=draw;
draw=function(){
  oldDraw();
  // repaint ID card images over any ID placeholders on first page
  const canvas=$('previewCanvas'),ctx=canvas.getContext('2d');let [wi,hi]=papers[state.paper];if($('landscape').checked)[wi,hi]=[hi,wi];let margin=+$('margin').value*DPI,spacing=+$('spacing').value*DPI;let pages=layoutPhotos(canvas.width,canvas.height,margin,spacing);
  function paintId(side,x,y,w,h,label){let img=state.idCards[side];ctx.save();if(img)ctx.drawImage(img,x,y,w,h);if($('borders').checked){ctx.strokeStyle=side==='front'?'#00e5ff':'#9dff57';ctx.lineWidth=8;ctx.strokeRect(x,y,w,h);}ctx.fillStyle='rgba(8,12,31,.75)';ctx.fillRect(x+16,y+16,170,42);ctx.fillStyle='#fff';ctx.font='bold 26px Arial';ctx.fillText(label,x+28,y+46);ctx.restore();}
  pages[0].filter(it=>it.idSide||it.idPair).forEach(it=>{if(it.idPair){if(it.output==='sideBySide'){paintId('front',it.x,it.y,it.cw,it.ch,'ID FRONT');paintId('back',it.x+it.cw+it.gap,it.y,it.cw,it.ch,'ID BACK')}else{paintId('front',it.x,it.y,it.cw,it.ch,'ID FRONT');paintId('back',it.x,it.y+it.ch+it.gap,it.cw,it.ch,'ID BACK')}}else{paintId(it.idSide,it.x,it.y,it.w,it.h,it.label)}})
};
setupIdCardPrint();draw();
