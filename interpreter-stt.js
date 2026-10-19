/* Cloud Speech-to-Text capture for Burmese (my-MM). */
let interpreterMyanmarCapture=null;
function stopMyanmarCloudRecognition(){
  const c=interpreterMyanmarCapture; interpreterMyanmarCapture=null;
  if(!c)return; c.active=false;
  if(c.processor){c.processor.onaudioprocess=null;try{c.processor.disconnect()}catch(e){}}
  if(c.source){try{c.source.disconnect()}catch(e){}}
  if(c.gain){try{c.gain.disconnect()}catch(e){}}
  if(c.stream)c.stream.getTracks().forEach(t=>t.stop());
  if(c.ctx&&c.ctx.state!=='closed')c.ctx.close().catch(()=>{});
}
function encodeSpeechWav16k(samples,rate){
  const size=Math.max(1,Math.round(samples.length*16000/rate)),pcm=new Int16Array(size),ratio=rate/16000;
  for(let i=0;i<size;i++){const p=i*ratio,a=Math.floor(p),f=p-a,x=(samples[a]||0)*(1-f)+(samples[Math.min(a+1,samples.length-1)]||0)*f,v=Math.max(-1,Math.min(1,x));pcm[i]=v<0?v*32768:v*32767;}
  const b=new ArrayBuffer(44+size*2),v=new DataView(b),s=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i));};
  s(0,'RIFF');v.setUint32(4,36+size*2,true);s(8,'WAVE');s(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);s(36,'data');v.setUint32(40,size*2,true);
  for(let i=0;i<size;i++)v.setInt16(44+i*2,pcm[i],true);
  const bytes=new Uint8Array(b);let raw='';for(let i=0;i<bytes.length;i+=32768)raw+=String.fromCharCode(...bytes.subarray(i,Math.min(i+32768,bytes.length)));return btoa(raw);
}
function postMyanmarSpeech(audio){
  const endpoint=String(window.HEAL_TRANSLATOR_APPS_SCRIPT_URL||'').trim();if(!endpoint)return Promise.reject(new Error('Apps Script URL is missing'));
  const id='my_'+Date.now()+'_'+Math.random().toString(36).slice(2,9),name='heal_stt_'+id;
  return new Promise((resolve,reject)=>{
    const frame=document.createElement('iframe'),form=document.createElement('form');frame.name=name;frame.title='Burmese speech recognition';frame.style.cssText='position:fixed;width:1px;height:1px;left:-10px;bottom:0;border:0;opacity:0;pointer-events:none';
    form.method='POST';form.action=endpoint;form.target=name;form.style.display='none';
    for(const [k,val] of Object.entries({action:'interpreter-stt',requestId:id,lang:'my-MM',audio})){const i=document.createElement('input');i.type='hidden';i.name=k;i.value=val;form.appendChild(i);}
    let done=false,timer;const cleanup=()=>{window.removeEventListener('message',receive);clearTimeout(timer);form.remove();frame.remove();};
    const finish=(ok,val)=>{if(done)return;done=true;cleanup();ok?resolve(val):reject(val instanceof Error?val:new Error(String(val)));};
    const receive=e=>{const d=e.data;if(e.source!==frame.contentWindow||!d||d.type!=='heal-interpreter-stt'||d.requestId!==id)return;d.result?.ok&&d.result.transcript?finish(true,String(d.result.transcript).trim()):finish(false,new Error(d.result?.error||'No Burmese speech recognized'));};
    window.addEventListener('message',receive);timer=setTimeout(()=>finish(false,new Error('Speech-to-Text timed out')),12000);document.body.append(frame,form);form.submit();
  });
}
async function startMyanmarCloudRecognition(){
  if(!interpreterActive||interpreterBusy||document.hidden||interpreterMyanmarCapture)return;
  const token=interpreterSessionToken,status=document.getElementById('interpreterStatus');
  if(!navigator.mediaDevices?.getUserMedia){status.textContent='อุปกรณ์นี้ไม่อนุญาตให้เปิดไมโครโฟนสำหรับรู้จำเสียงพม่า';return;}
  try{
    status.textContent='กำลังเปิดไมโครโฟนรู้จำเสียงพม่า…';const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    if(!interpreterActive||token!==interpreterSessionToken||interpreterNextLang!=='my'){stream.getTracks().forEach(t=>t.stop());return;}
    const C=window.AudioContext||window.webkitAudioContext;if(!C)throw new Error('Web Audio unavailable');let ctx;try{ctx=new C({sampleRate:16000})}catch(e){ctx=new C()};if(ctx.state==='suspended')await ctx.resume();
    const source=ctx.createMediaStreamSource(stream),processor=ctx.createScriptProcessor(4096,1,1),gain=ctx.createGain();gain.gain.value=0;source.connect(processor);processor.connect(gain);gain.connect(ctx.destination);
    const c={active:true,stream,ctx,source,processor,gain,rate:ctx.sampleRate,pre:[],frames:[],speaking:false,silence:0,sending:false,token};interpreterMyanmarCapture=c;
    status.textContent='กำลังฟังภาษาพม่า… พูดทีละประโยค';const threshold=.012,silenceLimit=ctx.sampleRate*.48,maxLength=ctx.sampleRate*12;
    const finish=async()=>{
      if(!c.active||c.sending||!c.frames.length)return;c.active=false;c.sending=true;const total=c.frames.reduce((n,f)=>n+f.length,0)-c.silence;if(total<ctx.sampleRate*.22){stopMyanmarCloudRecognition();if(interpreterActive&&token===interpreterSessionToken)scheduleInterpreterRecognition(120);return;}
      const samples=new Float32Array(total);let pos=0;for(const f of c.frames){const n=Math.min(f.length,total-pos);if(n<=0)break;samples.set(f.subarray(0,n),pos);pos+=n;}const audio=encodeSpeechWav16k(samples,c.rate);stopMyanmarCloudRecognition();
      if(!interpreterActive||token!==interpreterSessionToken)return;document.getElementById('interpreterStatus').textContent='กำลังรู้จำเสียงพม่า…';
      try{const text=await postMyanmarSpeech(audio);if(interpreterActive&&token===interpreterSessionToken&&interpreterNextLang==='my')await handleInterpreterUtterance(text,'my');}
      catch(e){if(interpreterActive&&token===interpreterSessionToken){document.getElementById('interpreterStatus').textContent='รู้จำเสียงพม่าไม่ได้: '+e.message;scheduleInterpreterRecognition(600);}}
    };
    processor.onaudioprocess=e=>{
      if(!c.active||c.sending||!interpreterActive||token!==interpreterSessionToken||interpreterBusy)return;const input=e.inputBuffer.getChannelData(0),frame=new Float32Array(input),rms=Math.sqrt(input.reduce((s,x)=>s+x*x,0)/input.length);
      if(!c.speaking){c.pre.push(frame);if(c.pre.length>4)c.pre.shift();if(rms>=threshold){c.speaking=true;c.frames=c.pre.slice();c.pre=[];}return;}
      c.frames.push(frame);c.silence=rms>=threshold?0:c.silence+frame.length;const length=c.frames.reduce((n,f)=>n+f.length,0);if(c.silence>=silenceLimit||length>=maxLength)finish();
    };
  }catch(e){if(interpreterActive&&token===interpreterSessionToken)status.textContent='เปิดไมโครโฟนพม่าไม่ได้: '+e.message;}
}

