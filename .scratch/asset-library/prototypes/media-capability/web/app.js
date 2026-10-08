/* Throwaway media probe. Actual runtime events, never simulated decoding. */
const $=s=>document.querySelector(s),invoke=window.__TAURI__?.core.invoke,fileURL=window.__TAURI__?.core.convertFileSrc;
let selected=null,media=null,sequence=0,animationTimer=null,runtime={},events=[],facts={};
function event(type,detail=''){events.push(`${new Date().toISOString()} ${type} ${detail}`);$('#events').textContent=events.slice(-18).join('\n');renderFacts()}
function renderFacts(){ $('#state').textContent=JSON.stringify({fixture:selected?.id,recordRetained:!!selected,original:'只读；应用不写样本文件',...facts,runtime,userAgent:navigator.userAgent},null,2) }
function status(s){$('#status').textContent=s}
function button(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=fn;return b}
function reset(){clearInterval(animationTimer);animationTimer=null;if(media?.pause)media.pause();media=null;$('#viewer').replaceChildren();$('#controls').replaceChildren();$('#native').replaceChildren();facts={};events=[];$('#events').textContent=''}
async function select(f){const token=++sequence;reset();selected=f;$('#title').textContent=f.name;$('#note').textContent=f.note;status('正在读取应用包内样本…');document.querySelectorAll('#samples button').forEach(b=>b.classList.toggle('selected',b.dataset.id===f.id));renderFacts();
 if(!invoke){status('实际媒体页需在 Tauri 实验应用内运行；可返回体验流程模拟。');return}
 let path;try{path=await invoke('fixture_path',{id:f.id});if(token!==sequence)return}catch(e){status('路径解析失败：'+e);event('path_error',String(e));return}
 const src=fileURL(path),start=performance.now();facts.path=path;facts.sourceBytes=f.bytes;facts.sha256=f.sha256;
 if(f.id==='offline'){status('原件路径缺失（离线场景样本）；条目保留，可重试。没有将其归为不支持格式。');$('#controls').append(button('重试读取',()=>select(f)));event('source_missing');return}
 if(['image','animation'].includes(f.kind)){
  const img=new Image();media=img;img.alt=f.name;img.onload=()=>{if(token!==sequence)return;facts={...facts,width:img.naturalWidth,height:img.naturalHeight,loadMs:Math.round(performance.now()-start),direct:'loaded'};status(f.kind==='animation'?'原生动图已加载；是否连续变化须观察。暂停功能由下方帧预览单独检查。':'原件图像已加载；缩放可操作，方向、色彩须对照样本。');event('image_load',`${img.naturalWidth}×${img.naturalHeight}`)};
  img.onerror=()=>{if(token!==sequence)return;facts.direct='failed';status('直接预览失败；条目与原件保留。可重试，或尝试受控解码组件。');event('image_error')};img.src=src;$('#viewer').append(img);
  let zoom=1;$('#controls').append(button('放大',()=>{zoom=Math.min(4,zoom+.5);img.style.maxWidth='none';img.style.maxHeight='none';img.style.width=(img.naturalWidth*zoom)+'px';event('zoom',zoom)}),button('适应窗口',()=>{img.style='';zoom=1;event('fit')}));
 }else if(['video','audio'].includes(f.kind)){
  const el=document.createElement(f.kind);media=el;el.controls=true;el.preload='metadata';el.volume=.2;el.src=src;el.playsInline=true;$('#viewer').append(el);
  for(const type of ['loadedmetadata','loadeddata','canplay','play','pause','seeked','ended','error'])el.addEventListener(type,()=>{if(token!==sequence)return;facts={...facts,duration:el.duration,currentTime:el.currentTime,paused:el.paused,readyState:el.readyState,error:el.error?.message,videoWidth:el.videoWidth,videoHeight:el.videoHeight};event(type,`t=${el.currentTime.toFixed(2)}`);status(type==='error'?'播放失败，保留原件与条目；可重试／按需生成代理。':`${f.kind==='audio'?'音频':'视频'}：${type} · ${el.currentTime.toFixed(2)} / ${Number.isFinite(el.duration)?el.duration.toFixed(2):'?'} 秒\n进度变化不代表已监听音频，也不代表画面和颜色已核对。`)});
  el.addEventListener('timeupdate',()=>{facts.currentTime=Number(el.currentTime.toFixed(2));renderFacts()});
  $('#controls').append(button('播放',()=>el.play().catch(e=>event('play_rejected',e.message))),button('暂停',()=>el.pause()),button('定位到中间',()=>{if(Number.isFinite(el.duration))el.currentTime=el.duration/2}),button('回到开头',()=>{el.currentTime=0}));
  const label=document.createElement('label');label.textContent='音量 ';const volume=document.createElement('input');volume.type='range';volume.min='0';volume.max='1';volume.step='.05';volume.value='.2';volume.setAttribute('aria-label','音量');volume.oninput=()=>{el.volume=Number(volume.value);event('volume',el.volume)};label.append(volume);$('#controls').append(label);
 }else{status('PDF 未交给 WebView 插件；使用下方随包组件逐页生成预览。');event('pdf_pending')}
 $('#controls').append(button('重新读取原件',()=>select(f)));
 if(window.installNativeControls)window.installNativeControls(f,token);
 renderFacts();
}
for(const f of FIXTURES){const b=button(f.name,()=>select(f));b.dataset.id=f.id;$('#samples').append(b)}
(async()=>{if(invoke)runtime=await invoke('runtime_info');await select(FIXTURES[0])})();
