// Playwright's normal target session enables focus emulation, which prevents
// Chrome's real freeze/resume events. Activity alone uses an owned headless
// Chrome with a noDefaults connection; the other browser gates are unchanged.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function chromeExecutable() {
  const candidates=process.platform==='win32'
    ? [process.env.PROGRAMFILES,process.env['PROGRAMFILES(X86)'],process.env.LOCALAPPDATA].filter(Boolean).map(root=>path.join(root,'Google','Chrome','Application','chrome.exe'))
    : process.platform==='darwin'?['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']:['/opt/google/chrome/chrome','/usr/bin/google-chrome'];
  const executable=candidates.find(candidate=>fs.existsSync(candidate));
  if(!executable)throw new Error('Activity lifecycle checks require the installed Google Chrome channel');
  return executable;
}

export async function openLifecycleBrowser(options) {
  const profilesRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../.local/gates');
  fs.mkdirSync(profilesRoot,{recursive:true});
  const profile=fs.mkdtempSync(path.join(profilesRoot,'lifecycle-profile-'));
  let browser,child,closed=false;
  async function close() {
    if(closed)return;closed=true;
    try {
      if(browser?.isConnected()){
        const session=await browser.newBrowserCDPSession();
        await session.send('Browser.close').catch(error=>{if(browser.isConnected())throw error;});
      }
    } finally {
      await browser?.close().catch(()=>{});
      // This is only the process created below, never another Chrome session.
      if(child&&child.exitCode===null&&child.signalCode===null){
        await Promise.race([new Promise(resolve=>child.once('exit',resolve)),new Promise(resolve=>setTimeout(resolve,2000))]);
        if(child.exitCode===null&&child.signalCode===null)child.kill();
      }
      // Delete only this helper's verified, disposable profile directory.
      if(path.dirname(profile)!==profilesRoot||!path.basename(profile).startsWith('lifecycle-profile-'))throw new Error('Unexpected lifecycle profile path');
      fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
    }
  }
  try {
    const {width,height}=options.viewport;
    child=spawn(chromeExecutable(),['--headless=new',`--window-size=${width},${height}`,'--remote-debugging-port=0',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist','about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
    const endpoint=await new Promise((resolve,reject)=>{
      let output='';const timeout=setTimeout(()=>reject(new Error('Activity Chrome startup timed out')),15000);
      const fail=error=>{clearTimeout(timeout);reject(error);};
      child.once('error',fail);child.once('exit',code=>fail(new Error(`Activity Chrome exited during startup (${code})`)));
      child.stderr.on('data',data=>{output+=data;const match=output.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timeout);resolve(match[1]);}});
    });
    browser=await chromium.connectOverCDP(endpoint,{noDefaults:true,timeout:15000});
    const context=browser.contexts()[0],page=context.pages()[0];
    await page.setViewportSize(options.viewport);
    const metrics=await context.newCDPSession(page);
    await metrics.send('Emulation.setDeviceMetricsOverride',{width,height,screenWidth:width,screenHeight:height,deviceScaleFactor:options.deviceScaleFactor||1,mobile:!!options.isMobile});
    await metrics.send('Emulation.setTouchEmulationEnabled',{enabled:!!options.hasTouch,maxTouchPoints:1});
    const other=await context.newPage();await other.goto('about:blank');
    // CDP unfreezes without necessarily making an already-active tab visible.
    // A real tab activation sequence restores WasShown without DOM overrides.
    const restoreVisibility=async()=>{await other.bringToFront();await page.bringToFront();};
    await restoreVisibility();
    return {browser,page,restoreVisibility,close};
  } catch(error) {await close();throw error;}
}
