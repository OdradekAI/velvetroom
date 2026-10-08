window.installNativeControls=(f,token)=>{
 const box=$('#native');
 const run=async mode=>{
  const startButton=[...box.querySelectorAll('button')];startButton.forEach(b=>b.disabled=true);
  status('正在启动随包组件；原件不变。实际处理不显示模拟百分比。');
  try{
   let job=await invoke('start_probe',{id:f.id,mode});facts.native=job;renderFacts();
   const cancel=button('取消本次生成',async()=>{cancel.disabled=true;status('请求停止组件，等待进程结束…');try{const j=await invoke('cancel_probe');event('cancel_result',j.status)}catch(e){event('cancel_unknown',String(e))}});box.append(cancel);
   while(job.status==='running'){
    await new Promise(r=>setTimeout(r,120));job=await invoke('probe_status');
    if(token===sequence){facts.native=job;status(`组件处理中 · ${(job.elapsedMs/1000).toFixed(1)} 秒\n输出未核验前不能预览。`);renderFacts()}
   }
   cancel.remove();if(token!==sequence)return;facts.native=job;event('native_'+job.status,mode);
   if(job.status!=='ready'){status(job.status==='interrupted'?'组件已被终止；这是强制中断，未证明正常取消。输出保留隔离、不发布；原件保留，可重试。':'组件未成功完成；条目保留，诊断见当前状态。');return}
   const result=job.result,paths=result.paths.map(p=>fileURL(p));status(`组件完成 · ${Math.round(result.elapsedMs)}ms · ${result.backend}\n这是派生预览，原件保留。`);
   if(mode==='proxy'){
    const v=document.createElement('video');v.controls=true;v.src=paths[0];v.volume=.2;media?.pause?.();media=v;$('#viewer').replaceChildren(v);
    $('#controls').replaceChildren(button('播放代理',()=>v.play()),button('暂停代理',()=>v.pause()),button('定位代理中间',()=>{v.currentTime=v.duration/2}));
    ['loadeddata','play','pause','seeked','error'].forEach(type=>v.addEventListener(type,()=>{facts.proxyTime=v.currentTime;event('proxy_'+type)}));
    status(`预览代理 · SDR 输入样本 · 原件未改写\n生成 ${Math.round(result.elapsedMs)}ms；已检查输出视频轨和时长，色彩与完整帧仍须核对。`);
   }else{
    clearTimeout(animationTimer);let i=0,playing=false;const img=new Image();img.alt=mode==='pdf'?'PDF 页面预览':'组件派生预览';media=img;$('#viewer').replaceChildren(img);$('#controls').replaceChildren();
    img.onerror=()=>{status('派生文件已生成，但窗口加载失败；此项预览未通过。');event('derivative_error')};img.onload=()=>{facts.derivativeLoaded=true;facts.derivativeSize=[img.naturalWidth,img.naturalHeight];event('derivative_load',`${img.naturalWidth}×${img.naturalHeight}`)};
    const show=()=>{img.src=paths[i];facts.derivativeIndex=i;renderFacts();if(mode==='pdf')status(`PDF 第 ${i+1} / ${paths.length} 页 · 派生预览 · 原件保留`)};show();
    if(mode==='frames'){
     const tick=()=>{if(!playing||token!==sequence)return;i=(i+1)%paths.length;show();animationTimer=setTimeout(tick,1000*result.delays[i])};
     $('#controls').append(button('播放动图',()=>{if(playing)return;playing=true;status(`逐帧派生预览播放 · ${paths.length} 帧`);animationTimer=setTimeout(tick,1000*result.delays[i]);event('animation_play')}),button('暂停动图',()=>{playing=false;clearTimeout(animationTimer);status(`逐帧派生预览已暂停 · 第 ${i+1} 帧`);event('animation_pause',i)}));
    }
    if(mode==='pdf')$('#controls').append(button('上一页',()=>{i=Math.max(0,i-1);show()}),button('下一页',()=>{i=Math.min(paths.length-1,i+1);show()}));
    let zoom=1;$('#controls').append(button('放大预览',()=>{zoom=Math.min(4,zoom+.5);img.style.maxWidth='none';img.style.maxHeight='none';img.style.width=(img.naturalWidth*zoom)+'px';event('derivative_zoom',zoom)}),button('适应窗口',()=>{img.style='';zoom=1;event('derivative_fit')}));
   }
  }catch(e){if(token===sequence){status('组件调用失败：'+e);event('native_error',String(e))}}
  finally{startButton.forEach(b=>b.disabled=false)}
 };
 if(f.kind==='image'&&f.id!=='offline')box.append(button('生成图像预览',()=>run('image')));
 if(f.kind==='animation')box.append(button('生成可暂停的帧预览',()=>run('frames')));
 if(f.kind==='pdf')box.append(button('生成多页预览',()=>run('pdf')));
 if(f.kind==='video'){
  box.append(button('生成视频封面',()=>run('poster')));
  box.append(button('查看代理准备说明',()=>{const n=document.createElement('div');n.textContent='仅生成当前 SDR 样本的 H.264 预览代理；占用额外空间，确切大小未知，原件不变。可取消，失败输出不使用。';n.append(button('确认生成代理',()=>run('proxy')));box.append(n)}));
 }
};
