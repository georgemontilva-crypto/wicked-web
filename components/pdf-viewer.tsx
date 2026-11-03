'use client';
import {useEffect,useRef,useState} from 'react';

// Draws every page of a PDF onto canvases, so it displays even in browsers without a built-in PDF viewer.
export function PdfViewer({src,title}:{src:string;title:string}){
 const host=useRef<HTMLDivElement>(null),[state,setState]=useState<'loading'|'ready'|'error'>('loading');
 useEffect(()=>{let cancelled=false;const el=host.current;if(!el)return;
  (async()=>{try{
   const pdfjs=await import('pdfjs-dist');
   pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString();
   const doc=await pdfjs.getDocument({url:src}).promise;
   el.replaceChildren();
   const ratio=Math.min(window.devicePixelRatio||1,2);
   for(let n=1;n<=doc.numPages&&!cancelled;n++){
    const page=await doc.getPage(n);const base=page.getViewport({scale:1});
    const width=Math.min(el.clientWidth||900,1100),viewport=page.getViewport({scale:width/base.width*ratio});
    const canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;canvas.className='pdf-page';canvas.setAttribute('aria-label',title+' — page '+n);
    el.appendChild(canvas);
    await page.render({canvas,canvasContext:canvas.getContext('2d')!,viewport}).promise;
    if(n===1&&!cancelled)setState('ready');
   }
  }catch{if(!cancelled)setState('error');}})();
  return()=>{cancelled=true;};
 },[src,title]);
 return <div className="pdf-viewer">{state==='loading'&&<p className="pdf-status">Loading document…</p>}{state==='error'&&<p className="pdf-status">The document could not be displayed. Use “Download PDF” to open it.</p>}<div ref={host} className="pdf-pages"/></div>;
}
