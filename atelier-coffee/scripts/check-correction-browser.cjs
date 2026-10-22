#!/usr/bin/env node
/**
 * Browser acceptance test; start the complete production site before running.
 *
 * BASE_URL=http://127.0.0.1:3004 node scripts/check-correction-browser.cjs
 * node scripts/check-correction-browser.cjs --smoke  # offline Chromium + video dependency check
 *
 * Optional configuration (no application runtime dependency is added):
 * PLAYWRIGHT_MODULE: package name or absolute path to an existing Playwright install.
 * CHROMIUM_EXECUTABLE: existing browser binary; otherwise use system/bundled Chromium.
 * FFMPEG_EXECUTABLE: existing FFmpeg binary if Playwright's encoder is unavailable.
 * REPORT_DIR: artifact directory (default reports/live-action/browser).
 * ATELIER_VIDEO=0 / ATELIER_SLOW=0: omit those explicitly reported test cases.
 *
 * This cloud workspace also has Playwright under /opt/codex/.../node_modules.
 * That known install is an explicit fallback after a normal local package lookup.
 * The recorder uses actual mouse.wheel events. Only the separately labelled slow
 * network case intercepts image requests; the main checks and video use real files.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const {execFileSync} = require('child_process');
const crypto = require('crypto');
const projectRoot = path.resolve(__dirname,'..');
function resolvePlaywright(){
  const cloud='/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
  for(const candidate of [process.env.PLAYWRIGHT_MODULE,'playwright',cloud].filter(Boolean)){
    try{return require.resolve(candidate);}catch{}
  }
  throw new Error('Playwright is required for this acceptance test. Set PLAYWRIGHT_MODULE to an existing installation or install Playwright as a development tool.');
}
function executable(name){try{return execFileSync(process.platform==='win32'?'where':'which',[name],{encoding:'utf8'}).trim().split(/\r?\n/)[0];}catch{return null;}}
let playwrightEntry,videoEncoder,chromium,chromiumExecutable;
function ensureVideoEncoder(){
  if(process.env.ATELIER_VIDEO==='0'&&!process.argv.includes('--smoke'))return null;
  const coreRoot=path.dirname(require.resolve('playwright-core/package.json',{paths:[path.dirname(playwrightEntry)]}));
  const revision=JSON.parse(fs.readFileSync(path.join(coreRoot,'browsers.json'),'utf8')).browsers.find(browser=>browser.name==='ffmpeg').revision;
  const encoderName=process.platform==='win32'?'ffmpeg-win64.exe':process.platform==='darwin'?'ffmpeg-mac':'ffmpeg-linux';
  const defaultCache=process.platform==='darwin'?path.join(os.homedir(),'Library/Caches/ms-playwright'):process.platform==='win32'?path.join(process.env.LOCALAPPDATA||os.tmpdir(),'ms-playwright'):path.join(process.env.XDG_CACHE_HOME||path.join(os.homedir(),'.cache'),'ms-playwright');
  const configuredCache=process.env.PLAYWRIGHT_BROWSERS_PATH==='0'?path.join(coreRoot,'.local-browsers'):process.env.PLAYWRIGHT_BROWSERS_PATH;
  const installedEncoder=path.join(configuredCache||defaultCache,`ffmpeg-${revision}`,encoderName);
  if(fs.existsSync(installedEncoder))return installedEncoder;
  const systemEncoder=process.env.FFMPEG_EXECUTABLE||executable('ffmpeg');
  if(!systemEncoder)throw new Error('Video capture requires Playwright FFmpeg or FFMPEG_EXECUTABLE. Set ATELIER_VIDEO=0 to explicitly skip recording.');
  const cache=configuredCache||path.join(os.tmpdir(),'atelier-playwright-browsers');
  const encoder=path.join(cache,`ffmpeg-${revision}`,encoderName);
  fs.mkdirSync(path.dirname(encoder),{recursive:true});
  if(!fs.existsSync(encoder))fs.symlinkSync(systemEncoder,encoder);
  process.env.PLAYWRIGHT_BROWSERS_PATH=cache;
  return encoder;
}
function initializeRuntime(){
  playwrightEntry=resolvePlaywright();
  videoEncoder=ensureVideoEncoder();
  ({chromium}=require(playwrightEntry));
  chromiumExecutable=process.env.CHROMIUM_EXECUTABLE||executable('chromium')||executable('chromium-browser')||chromium.executablePath();
}
const url=process.env.BASE_URL||process.env.ATELIER_URL||'http://127.0.0.1:3004';
const outputDir=path.resolve(process.env.REPORT_DIR||process.env.ATELIER_REPORT_DIR||path.join(projectRoot,'reports/live-action/browser'));
fs.mkdirSync(outputDir,{recursive:true});
const artifact=name=>path.join(outputDir,name);
const stageSelector=process.env.ATELIER_STAGE||'[data-testid="coffee-sequence"]';
const assert = (condition, message) => { if (!condition) throw new Error(message); };
async function state(page) {
  return page.evaluate(selector => {
    const stage = document.querySelector(selector);
    const canvas = stage?.querySelector('canvas') || document.querySelector('canvas');
    if (!stage || !canvas) return null;
    const d = {...stage.dataset,...canvas.dataset};
    const find = (...names) => {for(const name of names)if(d[name]!==undefined)return Number(d[name]);return null;};
    let pixels = null, image = null;
    try {
      const copy=document.createElement('canvas');copy.width=48;copy.height=27;
      const ctx=copy.getContext('2d',{willReadFrequently:true});ctx.drawImage(canvas,0,0,48,27);
      const values=ctx.getImageData(0,0,48,27).data;
      let min=255,max=0,sum=0;
      for(let i=0;i<values.length;i+=4){const value=(values[i]+values[i+1]+values[i+2])/3;min=Math.min(min,value);max=Math.max(max,value);sum+=value;}
      pixels={min,max,range:max-min,average:sum/(48*27)};
      image=copy.toDataURL();
    } catch (error) { pixels={error:String(error)}; }
    return {frame:find('currentFrame','frame','renderedFrame','frameIndex','drawnFrame'),target:find('requestedFrame','targetFrame'),count:find('frameCount','totalFrames'),progress:Number(stage.dataset.progress),drawnProgress:Number(canvas.dataset.progress),variant:canvas.dataset.variant,decodedCount:Number(canvas.dataset.decodedCount),loaded:find('loadedFrames','loaded'),width:canvas.width,height:canvas.height,motion:stage.closest('.story-shell,.coffee-story,.sequence-story')?.className || stage.className,datasets:d,pixels,image};
  },stageSelector);
}
async function scrollBounds(page) {
  return page.evaluate(selector=>{
    const stage=document.querySelector(selector);const spacer=stage.closest('.pin-spacer');
    const parent=stage.closest('.story-shell,.sequence-story,.coffee-story,.cinematic-sequence') || stage.parentElement;
    const actualStart=Number(stage.dataset.scrollStart),actualEnd=Number(stage.dataset.scrollEnd);
    const actualRange=Number.isFinite(actualStart)&&Number.isFinite(actualEnd)&&actualEnd>actualStart;
    let start=actualRange?actualStart:(spacer||parent).getBoundingClientRect().top+scrollY;
    let distance=actualRange?actualEnd-actualStart:spacer ? spacer.offsetHeight-stage.offsetHeight : parent.offsetHeight-innerHeight;
    if(distance<=0)distance=innerHeight*(Number(parent.dataset.scrollScreens)||5);
    return {start,distance};
  },stageSelector);
}
async function seek(page,p,bounds) {
  // Let React's preceding keyboard update and native scroll anchoring settle
  // before issuing the next user-equivalent scroll command.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.evaluate(({top})=>scrollTo({top,behavior:'instant'}),{top:bounds.start+p*bounds.distance});
  try { await page.waitForFunction(({selector,p})=>{
    const stage=document.querySelector(selector),canvas=stage?.querySelector('canvas');
    if(!stage||!canvas)return false;const d={...stage.dataset,...canvas.dataset};
    const progress=Number(stage.dataset.progress??d.sequenceProgress);
    const actual=Number(d.currentFrame??d.frame??d.renderedFrame??d.frameIndex??d.drawnFrame);
    const count=Number(d.frameCount??d.totalFrames??160);
    const requested=Number(d.requestedFrame??d.targetFrame??actual);
    return Math.abs(progress-p)<.012 && actual===Math.round(p*(count-1)) && actual===requested;
  },{selector:stageSelector,p},{timeout:30000}); }
  catch(error) {
    const diagnostic=await page.evaluate(selector=>({scrollY,active:document.activeElement?.id,stage:{...document.querySelector(selector)?.dataset},canvas:{...document.querySelector(`${selector} canvas`)?.dataset}}),stageSelector);
    await page.screenshot({path:artifact('seek-failure.png')});
    throw new Error(`Seek ${p} failed: ${JSON.stringify(diagnostic)}; ${error.message}`);
  }
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  return state(page);
}
function stripImage(value){const {image,...rest}=value;return {...rest,imageHash:image?crypto.createHash('sha256').update(image).digest('hex'):null};}
function decodedBudget(value,expectedVariant){
  assert(value.variant===expectedVariant,`Expected ${expectedVariant} assets, received ${value.variant}`);
  assert(Number.isInteger(value.decodedCount)&&value.decodedCount>0&&value.decodedCount<=(expectedVariant==='mobile'?24:32),`Decoded image cache exceeds its ${expectedVariant} limit: ${value.decodedCount}`);
}
async function pinCount(page){
  return page.locator('.story-stage').evaluate(stage=>{let count=0;for(let node=stage.parentElement;node;node=node.parentElement)if(node.classList.contains('pin-spacer'))count++;return count;});
}
function localAssets(){
  const folder=path.join(projectRoot,'public/espresso-frames');
  const manifestBytes=fs.readFileSync(path.join(folder,'manifest.json'));
  const manifest=JSON.parse(manifestBytes.toString('utf8'));
  assert(manifest.count===160&&manifest.ext==='webp','Local manifest must describe the complete 160-frame WebP sequence');
  execFileSync(process.execPath,[path.join(projectRoot,'scripts/check-assets.mjs')],{stdio:'pipe'});
  return {manifestCount:manifest.count,variants:2,realFilesValidated:322,source:manifest.source??null,manifest,manifestSha256:crypto.createHash('sha256').update(manifestBytes).digest('hex')};
}
function observe(page,report){
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',message=>{if(message.type()==='error')(report.consoleErrors??=[]).push(message.text());});
  page.on('requestfailed',r=>{
    const entry={url:r.url(),failure:r.failure()?.errorText};
    if(entry.failure==='net::ERR_ABORTED')(report.abortedRequests??=[]).push(entry);
    else report.requestsFailed.push(entry);
  });
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))report.badResponses.push({url:r.url(),status:r.status()});});
}
async function installPaintCounter(page){
  await page.addInitScript(()=>{
    window.__coffeePaintCount=0;
    const original=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(...args){
      if(this.canvas.matches('.story-stage canvas'))window.__coffeePaintCount++;
      return original.apply(this,args);
    };
  });
}
async function stablePause(page,duration=1200){
  await page.waitForTimeout(100);
  const before=stripImage(await state(page));const count=await page.evaluate(()=>window.__coffeePaintCount);
  await page.waitForTimeout(duration);
  const after=stripImage(await state(page));const finalCount=await page.evaluate(()=>window.__coffeePaintCount);
  assert(before.frame===after.frame&&before.imageHash===after.imageHash,'Autoplay/changed frame while scroll stopped');
  assert(count===finalCount,'Renderer keeps painting the same frame while scroll is stopped');
  return {duration,frame:after.frame,imageHash:after.imageHash,paintsDuringPause:finalCount-count};
}
async function videoSmoke(){
  const browser=await chromium.launch({headless:true,executablePath:chromiumExecutable,args:['--no-sandbox']});
  try{
    const context=await browser.newContext({viewport:{width:640,height:360},recordVideo:{dir:path.join(os.tmpdir(),'atelier-video-smoke'),size:{width:640,height:360}}});
    const page=await context.newPage();
    await page.setContent('<html><body style="margin:0;background:#111;color:#d6ac67;font:24px sans-serif;padding:40px">Offline Playwright video check</body></html>');
    await page.waitForTimeout(700);const video=page.video();await context.close();
    const videoPath=await video.path();assert(fs.statSync(videoPath).size>0,'Offline video was empty');
    console.log(JSON.stringify({smoke:true,videoPath,bytes:fs.statSync(videoPath).size,siteRequests:0,encoder:videoEncoder}));
  }finally{await browser.close();}
}
async function recordedScroll(browser){
  console.log('VIDEO_START real mouse.wheel, forward/reverse and measured pauses');
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference',recordVideo:{dir:artifact('videos'),size:{width:1440,height:900}}});
  const page=await context.newPage();const video=page.video();
  const report={errors:[],requestsFailed:[],badResponses:[],forward:{},reverse:{}};
  observe(page,report);await installPaintCounter(page);
  try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('.sequence-canvas-wrapper')?.classList.contains('is-ready'),null,{timeout:30000});
    await page.evaluate(()=>document.fonts.ready);
    const bounds=await scrollBounds(page);await seek(page,0,bounds);
    await page.mouse.move(1120,660);await page.waitForTimeout(500);
    await page.evaluate(()=>{
      window.__coffeeVideoTrace=[];
      window.__coffeeVideoTimer=setInterval(()=>{
        const stage=document.querySelector('[data-testid="coffee-sequence"]');const canvas=stage?.querySelector('canvas');
        if(canvas)window.__coffeeVideoTrace.push({time:performance.now(),scroll:scrollY,progress:Number(stage.dataset.progress),frame:Number(canvas.dataset.frame),target:Number(canvas.dataset.requestedFrame),variant:canvas.dataset.variant,decodedCount:Number(canvas.dataset.decodedCount)});
      },100);
    });
    async function wheelTo(p,duration){
      const target=bounds.start+p*bounds.distance;const start=await page.evaluate(()=>scrollY);const steps=24;
      for(let index=0;index<steps;index++){
        await page.mouse.wheel(0,(target-start)/steps);
        await page.waitForTimeout(duration/steps);
      }
      const actual=await page.evaluate(()=>scrollY);if(Math.abs(target-actual)>.1){await page.mouse.wheel(0,target-actual);await page.waitForTimeout(100);}
      await page.waitForFunction(({p})=>{
        const stage=document.querySelector('[data-testid="coffee-sequence"]'),canvas=stage?.querySelector('canvas');
        return canvas&&Math.abs(Number(stage.dataset.progress)-p)<.004&&Number(canvas.dataset.frame)===Math.round(p*159)&&Number(canvas.dataset.frame)===Number(canvas.dataset.requestedFrame);
      },{p},{timeout:30000});
      return stripImage(await state(page));
    }
    report.forward[0]=stripImage(await state(page));
    for(const p of [.25,.5,.75,1]){
      report.forward[p]=await wheelTo(p,1500);
      if(p===.5)report.pause=await stablePause(page,1500);
    }
    await page.waitForTimeout(500);
    for(const p of [.75,.5,.25,0]){
      report.reverse[p]=await wheelTo(p,1100);
      assert(report.reverse[p].imageHash===report.forward[p].imageHash,`Recorded wheel reverse differs at ${p}`);
    }
    report.finalPause=await stablePause(page,1000);
    report.trace=await page.evaluate(()=>{clearInterval(window.__coffeeVideoTimer);return window.__coffeeVideoTrace;});
    assert(report.trace.every(value=>value.variant==='desktop'&&value.decodedCount<=32),'Recorded scroll exceeded decoded cache limit');
    assert(!(report.consoleErrors??[]).length,'Recorded scroll console errors');
    assert(report.errors.length===0&&report.requestsFailed.length===0&&report.badResponses.length===0,'Recorded scroll JS/network errors');
    console.log('VIDEO_PASS',JSON.stringify({traceSamples:report.trace.length,pause:report.pause,finalPause:report.finalPause}));
    return report;
  }finally{
    await context.close();await video.saveAs(artifact('scroll-forward-reverse.webm'));await video.delete();
    report.path=artifact('scroll-forward-reverse.webm');report.bytes=fs.statSync(report.path).size;
    if(process.env.ATELIER_MP4!=='0'){
      execFileSync(process.env.FFMPEG_EXECUTABLE||'ffmpeg',['-y','-i',report.path,'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',artifact('scroll-forward-reverse.mp4')],{stdio:'pipe'});
      report.mp4=artifact('scroll-forward-reverse.mp4');
    }
    fs.writeFileSync(artifact('video-report.json'),JSON.stringify(report,null,2));
  }
}
async function slowNetwork(browser){
  console.log('SLOW_NETWORK_START explicitly intercepted latency/bandwidth test');
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
  const report={errors:[],requestsFailed:[],badResponses:[],completed:[],peakConcurrent:0};
  const activeRequests=new Set();
  await context.route(/\/espresso-frames\/(?:mobile\/)?frame-\d{4}\.webp(?:\?.*)?$/,async route=>{
    const request=route.request();activeRequests.add(request);
    report.peakConcurrent=Math.max(report.peakConcurrent,activeRequests.size);
    try{
      const response=await route.fetch();const body=await response.body();
      const initial=/frame-0001\.webp/.test(route.request().url());
      // 160 KiB/s per request, with latency and a deliberately slower first frame.
      await new Promise(resolve=>setTimeout(resolve,(initial?1400:300)+body.length/163840*1000));
      await route.fulfill({response,body});
      report.completed.push(route.request().url());
    }catch(error){
      if(!/closed|canceled|aborted|disposed/i.test(String(error)))report.errors.push(String(error));
    }finally{activeRequests.delete(request);}
  });
  const page=await context.newPage();observe(page,report);
  page.on('requestfailed',request=>activeRequests.delete(request));
  page.on('requestfinished',request=>activeRequests.delete(request));
  try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>{const p=document.querySelector('.sequence-poster');return p?.complete&&p.naturalWidth>0;},null,{timeout:30000});
    report.poster=await page.evaluate(()=>{
      const p=document.querySelector('.sequence-poster');
      return {loaded:p.complete&&p.naturalWidth>0,opacity:getComputedStyle(p).opacity,firstFrame:Number(document.querySelector('canvas')?.dataset.frame??-1),sceneReady:document.querySelector('.story-stage')?.classList.contains('scene-ready')};
    });
    assert(report.poster.loaded,'Slow connection poster missing');
    assert(report.poster.firstFrame>=0 || (Number(report.poster.opacity)>0&&!report.poster.sceneReady),'Poster hidden before first frame');
    await page.evaluate(()=>{
      window.__sequenceTrace=[];
      window.__sequenceTraceTimer=setInterval(()=>{
        const canvas=document.querySelector('.story-stage canvas');if(!canvas)return;
        const frame=Number(canvas.dataset.frame??-1);if(frame<0)return;
        const copy=document.createElement('canvas');copy.width=16;copy.height=9;
        const ctx=copy.getContext('2d');ctx.drawImage(canvas,0,0,16,9);
        const data=ctx.getImageData(0,0,16,9).data;let min=255,max=0;
        for(let i=0;i<data.length;i+=4){const v=(data[i]+data[i+1]+data[i+2])/3;min=Math.min(min,v);max=Math.max(max,v);}
        window.__sequenceTrace.push({time:performance.now(),frame,requested:Number(canvas.dataset.requestedFrame??frame),range:max-min});
      },60);
    });
    await page.waitForFunction(()=>Number(document.querySelector('.story-stage canvas')?.dataset.frame??-1)>=0,null,{timeout:30000});
    const bounds=await scrollBounds(page);report.before=stripImage(await seek(page,0,bounds));
    await page.evaluate(top=>scrollTo({top,behavior:'instant'}),bounds.start+bounds.distance*.75);
    await page.waitForFunction(()=>Number(document.querySelector('.story-stage canvas')?.dataset.requestedFrame)>100,null,{timeout:10000});
    report.waiting=stripImage(await state(page));
    assert(report.waiting.pixels.range>5,'Canvas becomes blank while exact frame loads');
    await page.screenshot({path:artifact('network-slow-waiting.png')});
    report.after=stripImage(await seek(page,.75,bounds));
    assert(report.before.imageHash!==report.after.imageHash,'Slow connection did not change actual pixels');
    await page.screenshot({path:artifact('network-slow-ready.png')});
    await page.waitForFunction(()=>Number(document.querySelector('.story-stage canvas')?.dataset.frame)>=0,null,{timeout:30000});
    // Each compressed frame must exist, including frames not requested by these seeks.
    const waitUntil=Date.now()+120000;
    while(new Set(report.completed).size<160&&Date.now()<waitUntil)await page.waitForTimeout(250);
    report.trace=await page.evaluate(()=>{clearInterval(window.__sequenceTraceTimer);return window.__sequenceTrace;});
    assert(new Set(report.completed).size===160,'Slow connection did not fetch all 160 valid frames');
    assert(report.trace.length>0&&report.trace.every(v=>v.range>5),'A rendered frame became blank during slow loading');
    assert(report.peakConcurrent<=4,`More than four concurrent frame requests: ${report.peakConcurrent}`);
    assert(!(report.consoleErrors??[]).length&&report.errors.length===0&&report.requestsFailed.length===0&&report.badResponses.length===0,'Slow HTTP errors: '+JSON.stringify({console:report.consoleErrors,errors:report.errors,requests:report.requestsFailed,responses:report.badResponses}));
    report.completedCount=new Set(report.completed).size;delete report.completed;
    console.log('SLOW_NETWORK_PASS',JSON.stringify({frames:report.completedCount,peakConcurrent:report.peakConcurrent,renderSamples:report.trace.length}));
    return report;
  }finally{fs.writeFileSync(artifact('slow-network-report.json'),JSON.stringify(report,null,2));await context.close();}
}
(async()=>{
 if(process.argv.includes('--smoke')){initializeRuntime();await videoSmoke();return;}
 let browser;
 const report={sourceStatus:'Sequence provenance not read yet. Browser tests validate rendered scroll behavior; camera origin, licensing and visible filling require separate source review.',url,startedAt:new Date().toISOString(),passed:false,normalImagesIntercepted:false,assets:null,configuration:{},skipped:[],desktop:{},mobile:{},errors:[],requestsFailed:[],badResponses:[]};
 fs.writeFileSync(artifact('browser-report.json'),JSON.stringify(report,null,2));
 try{
  initializeRuntime();report.configuration={playwrightEntry,chromiumExecutable,videoEncoder};
  report.assets=localAssets();
  report.sourceStatus=`Declared source: ${report.assets.source??'not specified in the manifest'}; source kind: ${report.assets.manifest.sourceKind??'unspecified'}. Browser tests validate scroll behavior; source origin, licensing and visible filling are reviewed separately.`;
  browser=await chromium.launch({headless:true,executablePath:chromiumExecutable,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
  observe(page,report);
  await installPaintCounter(page);
  const started=Date.now();await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(selector=>{const stage=document.querySelector(selector),canvas=stage?.querySelector('canvas');if(!canvas||canvas.width<=0)return false;const d={...stage.dataset,...canvas.dataset};return Number(d.frame??d.renderedFrame??d.frameIndex??d.drawnFrame??-1)>=0;},stageSelector,{timeout:30000});
  report.firstDrawableMs=Date.now()-started;
  await page.evaluate(()=>document.fonts.ready);report.fontsReadyMs=Date.now()-started;
  const bounds=await scrollBounds(page);report.bounds=bounds;
  assert(Math.abs(bounds.distance/innerHeightSafe(page)-5)<.02,'Pinned sequence should span five viewport heights plus its visible stage');
  await seek(page,0,bounds);report.initialPause=await stablePause(page);
  report.initialPinCount=await page.locator('.story-stage').evaluate(stage=>{let count=0;for(let node=stage.parentElement;node;node=node.parentElement)if(node.classList.contains('pin-spacer'))count++;return count;});
  assert(report.initialPinCount===1,'Duplicate or missing pin spacer');
  for(const p of [0,.25,.5,.75,1]){
    const value=await seek(page,p,bounds);
    assert(value.count===160,'Expected 160 sequence frames');
    decodedBudget(value,'desktop');
    assert(value.width>0&&value.height>0,'Canvas has no dimensions');
    assert(value.pixels&&!value.pixels.error&&value.pixels.range>5,`Blank or tainted canvas at${p}`);
    report.desktop[p]=stripImage(value);
    await page.screenshot({path:artifact(`desktop-${String(Math.round(p*100)).padStart(3,'0')}.png`)});
    console.log('FRAME',p,stripImage(value));
  }
  const hashes=Object.values(report.desktop).map(v=>v.imageHash);assert(new Set(hashes).size>=4,'Sequence appears static across requested progresses');
  for(const p of [.75,.5,.25,0]){
    const value=stripImage(await seek(page,p,bounds));
    assert(value.imageHash===report.desktop[p].imageHash,`Reverse render differs at${p}`);
    (report.desktopReverse??={})[p]=value;
    await page.screenshot({path:artifact(`desktop-reverse-${String(Math.round(p*100)).padStart(3,'0')}.png`)});
  }
  await seek(page,.5,bounds);report.midPause=await stablePause(page);
  report.reverse=true;report.stop=true;
  console.log('REVERSE_PAUSE_PASS',JSON.stringify({initialPause:report.initialPause,midPause:report.midPause}));
  const defaultState=report.desktop[0];assert(!/reduced|static|motion-off|disabled/.test(defaultState.motion),'Animations are disabled by default');
  assert(await page.locator('.experience-activate').count()===0,'Activation must not be required without system reduction');
  assert(defaultState.datasets.motionMode==='animated'&&defaultState.datasets.motionPreference==='system','Default movement must be animated and follow the system');
  report.defaultMotion={system:await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),pinCount:await pinCount(page),requiresActivation:false};
  await page.locator('.header-link').click();
  await page.waitForFunction(()=>location.hash==='#story'&&document.getElementById('story')?.getBoundingClientRect().top<innerHeight*.75,null,{timeout:15000});
  report.editorialNavigation=true;
  await page.screenshot({path:artifact('editorial-section.png')});
  await page.locator('.brand-wordmark').click();
  await page.waitForFunction(()=>location.hash==='#process'&&scrollY<=1&&document.querySelector('.story-stage canvas')?.dataset.frame==='0',null,{timeout:15000});
  await page.locator('.motion-toggle').click();
  await page.waitForFunction(()=>document.querySelector('.story-shell')?.classList.contains('motion-reduced')&&!document.querySelector('.story-stage')?.closest('.pin-spacer')&&Number(document.querySelector('.story-stage canvas')?.dataset.frame)===159,null,{timeout:30000});
  await page.locator('.experience-activate').click();
  await page.waitForFunction(()=>document.querySelector('.story-shell')?.classList.contains('motion-active')&&!!document.querySelector('.story-stage')?.closest('.pin-spacer'),null,{timeout:20000});
  report.motionTogglePinCount=await pinCount(page);
  assert(report.motionTogglePinCount===1,'Duplicate pin after motion disable/re-enable');
  for(const width of [390,768]){
    const mobile=await browser.newPage({viewport:{width,height:width===390?844:1024},isMobile:width===390,hasTouch:width===390,reducedMotion:'no-preference'});
    observe(mobile,report);
    await installPaintCounter(mobile);
    await mobile.goto(url,{waitUntil:'domcontentloaded'});await mobile.waitForFunction(selector=>{const s=document.querySelector(selector);const c=s?.querySelector('canvas');if(!c)return false;const d={...s.dataset,...c.dataset};return Number(d.frame??d.renderedFrame??d.frameIndex??d.drawnFrame??-1)>=0;},stageSelector,{timeout:30000});
    const dimensions=await mobile.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(dimensions.scroll<=dimensions.width,`Horizontal overflow${width}`);
    const mobileBounds=await scrollBounds(mobile);const states={};
    for(const p of [0,.25,.5,.75,1]){states[p]=stripImage(await seek(mobile,p,mobileBounds));decodedBudget(states[p],width<=760?'mobile':'desktop');await mobile.screenshot({path:artifact(`mobile-${width}-${String(Math.round(p*100)).padStart(3,'0')}.png`)});}
    assert(states[0].imageHash!==states[.5].imageHash&&states[.5].imageHash!==states[1].imageHash,'Mobile sequence is static');
    assert(!/reduced|static|motion-off|disabled/.test(states[0].motion),'Touchscreen animations disabled by default');
    for(const p of [.75,.5,.25,0])assert(stripImage(await seek(mobile,p,mobileBounds)).imageHash===states[p].imageHash,`Mobile reverse differs at ${width}px / ${p}`);
    await seek(mobile,.5,mobileBounds);const pause=await stablePause(mobile);
    report.mobile[width]={dimensions,states,pause,reverse:true};console.log('MOBILE_PASS',JSON.stringify({width,dimensions,frames:Object.values(states).map(value=>value.frame),pause}));await mobile.close();
  }
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>{
    const stage=document.querySelector('.story-stage'),canvas=stage?.querySelector('canvas');
    return document.documentElement.scrollWidth<=innerWidth&&canvas?.dataset.variant==='mobile'&&Number(canvas.dataset.decodedCount)<=24&&Math.abs((Number(stage.dataset.scrollEnd)-Number(stage.dataset.scrollStart))/innerHeight-5)<.02;
  },null,{timeout:30000});
  await page.evaluate(()=>document.fonts.ready);
  const resizedBounds=await scrollBounds(page);const resizedState=stripImage(await seek(page,.5,resizedBounds));
  decodedBudget(resizedState,'mobile');
  report.resizedToMobile={state:resizedState,pinCount:await pinCount(page),dimensions:await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}))};
  assert(report.resizedToMobile.pinCount===1,'Duplicate pin after resizing to mobile');
  assert(resizedState.pixels.range>5,'Resize produced a blank frame');
  await page.screenshot({path:artifact('desktop-resized-mobile.png')});
  await page.setViewportSize({width:1440,height:900});
  await page.waitForFunction(()=>{
    const stage=document.querySelector('.story-stage'),canvas=stage?.querySelector('canvas');
    return canvas?.dataset.variant==='desktop'&&Number(canvas.dataset.decodedCount)<=32&&Math.abs((Number(stage.dataset.scrollEnd)-Number(stage.dataset.scrollStart))/innerHeight-5)<.02;
  },null,{timeout:30000});
  report.resizedBackDesktop={state:stripImage(await seek(page,.5,await scrollBounds(page))),pinCount:await pinCount(page)};
  decodedBudget(report.resizedBackDesktop.state,'desktop');assert(report.resizedBackDesktop.pinCount===1,'Duplicate pin after resizing back to desktop');
  await page.close();
  const systemPage=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
  observe(systemPage,report);
  await systemPage.goto(url,{waitUntil:'domcontentloaded'});
  await systemPage.waitForFunction(()=>document.querySelector('.story-stage canvas')?.dataset.frame==='0'&&document.querySelector('.story-stage')?.dataset.motionPreference==='system',null,{timeout:30000});
  report.dynamicSystemPreference=[];
  for(const preference of ['reduce','no-preference']){
    await systemPage.emulateMedia({reducedMotion:preference});
    await systemPage.waitForFunction(({preference})=>{
      const stage=document.querySelector('.story-stage'),canvas=stage?.querySelector('canvas');
      return stage?.dataset.motionPreference==='system'&&stage.dataset.motionMode===(preference==='reduce'?'reduced':'animated')&&canvas?.dataset.frame===(preference==='reduce'?'159':'0')&&Boolean(stage.closest('.pin-spacer'))===(preference!=='reduce');
    },{preference},{timeout:30000});
    const pins=await pinCount(systemPage);assert(pins===(preference==='reduce'?0:1),'Dynamic system preference created a wrong pin count');
    report.dynamicSystemPreference.push({preference,pinCount:pins,state:stripImage(await state(systemPage))});
  }
  await systemPage.close();
  const reducedPage=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  observe(reducedPage,report);await installPaintCounter(reducedPage);
  const reducedRequests=[];
  reducedPage.on('request',request=>{if(/\/espresso-frames\/(?:mobile\/)?frame-\d{4}\.webp(?:\?.*)?$/.test(request.url()))reducedRequests.push(request.url());});
  await reducedPage.goto(url,{waitUntil:'domcontentloaded'});
  await reducedPage.waitForFunction(()=>document.querySelector('.story-shell')?.classList.contains('motion-reduced')&&Number(document.querySelector('.story-stage canvas')?.dataset.frame)===159,null,{timeout:30000});
  const reducedState=await state(reducedPage);report.reduced=reducedState?stripImage(reducedState):{canvas:false};
  report.reducedUnpinned=await reducedPage.locator('.story-stage').evaluate(stage=>!stage.closest('.pin-spacer'));
  assert(report.reducedUnpinned,'Reduced-motion scene remains pinned');
  assert(report.reduced.datasets.motionMode==='reduced'&&report.reduced.datasets.motionPreference==='system','Reduced motion must follow the system before explicit activation');
  assert(await reducedPage.locator('.experience-activate').isVisible(),'Reduced-motion activation is not visible');
  report.activationGeometry=await reducedPage.locator('.experience-activate').evaluate(button=>{const rect=button.getBoundingClientRect();return {x:rect.x,y:rect.y,width:rect.width,height:rect.height,visible:rect.top>=0&&rect.bottom<=innerHeight&&rect.left>=0&&rect.right<=innerWidth,description:button.getAttribute('aria-describedby')};});
  assert(report.activationGeometry.visible&&report.activationGeometry.height>=44,'Activation must be visible and at least 44px high');
  assert(report.activationGeometry.description,'Activation should explain why movement is currently disabled');
  report.reducedPause=await stablePause(reducedPage);
  report.reducedFrameRequests=[...new Set(reducedRequests)];
  assert(report.reducedFrameRequests.length===1&&/frame-0160\.webp(?:\?.*)?$/.test(report.reducedFrameRequests[0]),'Reduced motion should load only its final frame');
  await reducedPage.screenshot({path:artifact('reduced-motion.png')});
  await reducedPage.locator('.experience-activate').focus();
  await reducedPage.keyboard.press('Enter');
  await reducedPage.waitForFunction(()=>matchMedia('(prefers-reduced-motion: reduce)').matches&&document.querySelector('.story-shell')?.classList.contains('motion-active')&&!!document.querySelector('.story-stage')?.closest('.pin-spacer')&&Number(document.querySelector('.story-stage canvas')?.dataset.frame)===0,null,{timeout:30000});
  report.reducedExplicitReactivation={state:stripImage(await state(reducedPage)),pinCount:await pinCount(reducedPage),requestedFrameCount:new Set(reducedRequests).size};
  assert(report.reducedExplicitReactivation.state.datasets.motionPreference==='explicit','Activation must record an explicit choice');
  assert(report.reducedExplicitReactivation.pinCount===1,'Explicit motion reactivation failed under reduced-motion system preference');
  const explicitBounds=await scrollBounds(reducedPage);
  report.reducedExplicitMidpoint=stripImage(await seek(reducedPage,.5,explicitBounds));
  await reducedPage.screenshot({path:artifact('reduced-explicit-activation-050.png')});
  report.explicitChoiceAcrossSystemChanges=[];
  for(const preference of ['no-preference','reduce']){
    await reducedPage.emulateMedia({reducedMotion:preference});
    await reducedPage.waitForFunction(()=>document.querySelector('.story-shell')?.classList.contains('motion-active')&&!!document.querySelector('.story-stage')?.closest('.pin-spacer'),null,{timeout:10000});
    await reducedPage.waitForTimeout(250);
    const count=await pinCount(reducedPage);assert(count===1,'Explicit choice lost or duplicate pin after system preference change');
    report.explicitChoiceAcrossSystemChanges.push({preference,pinCount:count,motionActive:true});
  }
  await seek(reducedPage,0,await scrollBounds(reducedPage));
  await reducedPage.locator('.motion-toggle').click();
  await reducedPage.waitForFunction(()=>document.querySelector('.story-shell')?.classList.contains('motion-reduced')&&!document.querySelector('.story-stage')?.closest('.pin-spacer')&&document.querySelector('.story-stage canvas')?.dataset.frame==='159',null,{timeout:30000});
  await reducedPage.emulateMedia({reducedMotion:'no-preference'});
  await reducedPage.waitForTimeout(300);
  assert(await pinCount(reducedPage)===0,'Explicit reduction was lost when the system preference changed');
  report.explicitReductionAcrossSystemChange={pinCount:0,state:stripImage(await state(reducedPage))};
  console.log('REDUCED_PASS',JSON.stringify({initialFrameRequests:report.reducedFrameRequests.length,reactivatedFrame:report.reducedExplicitReactivation.state.frame,pinCount:report.reducedExplicitReactivation.pinCount}));
  await reducedPage.close();
  const reducedMobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  observe(reducedMobile,report);
  await reducedMobile.goto(url,{waitUntil:'domcontentloaded'});
  await reducedMobile.waitForFunction(()=>document.querySelector('.story-shell')?.classList.contains('motion-reduced')&&document.querySelector('.story-stage canvas')?.dataset.frame==='159',null,{timeout:30000});
  report.reducedMobile={state:stripImage(await state(reducedMobile)),pinCount:await pinCount(reducedMobile),activation:await reducedMobile.locator('.experience-activate').evaluate(button=>{const r=button.getBoundingClientRect();return {height:r.height,visible:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth};})};
  assert(report.reducedMobile.pinCount===0&&report.reducedMobile.activation.visible&&report.reducedMobile.activation.height>=44,'Mobile reduced activation is not accessible');
  await reducedMobile.screenshot({path:artifact('reduced-motion-mobile.png')});
  await reducedMobile.locator('.experience-activate').click();
  await reducedMobile.waitForFunction(()=>document.querySelector('.story-shell')?.classList.contains('motion-active')&&document.querySelector('.story-stage canvas')?.dataset.frame==='0',null,{timeout:30000});
  assert(await pinCount(reducedMobile)===1,'Mobile explicit activation did not create exactly one pin');
  await reducedMobile.close();
  if(process.env.ATELIER_VIDEO!=='0')report.video=await recordedScroll(browser);else report.skipped.push('wheel video');
  if(process.env.ATELIER_SLOW!=='0')report.slow=await slowNetwork(browser);else report.skipped.push('slow network');
  assert(!(report.consoleErrors??[]).length,'Console errors:'+JSON.stringify(report.consoleErrors));assert(report.errors.length===0,'JavaScript errors:'+JSON.stringify(report.errors));assert(report.requestsFailed.length===0,'Failed requests:'+JSON.stringify(report.requestsFailed));assert(report.badResponses.length===0,'HTTP errors:'+JSON.stringify(report.badResponses));
  report.passed=true;
  fs.writeFileSync(artifact('browser-report.json'),JSON.stringify(report,null,2));
  console.log('SEQUENCE QA PASS',JSON.stringify({firstDrawableMs:report.firstDrawableMs,reverse:report.reverse,stop:report.stop,errors:report.errors,mobileWidths:Object.keys(report.mobile),slowConcurrent:report.slow?.peakConcurrent,slowFrames:report.slow?.completedCount}));
 }catch(error){report.failure=error.stack||String(error);throw error;}finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(artifact('browser-report.json'),JSON.stringify(report,null,2));if(browser)await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
function innerHeightSafe(page){return page.viewportSize()?.height||900;}
