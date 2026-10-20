/* Structa Global — animated favicon (works in all browsers; Firefox can also use favicon-animated.svg directly).
   Usage: <script src="animated-favicon.js" defer></script>  → plays on load and when the tab regains focus. */
(function(){
  var S=64, cv=document.createElement('canvas'); cv.width=cv.height=S; var c=cv.getContext('2d');
  var link=document.querySelector('link[rel~="icon"]'); if(!link){link=document.createElement('link');link.rel='icon';document.head.appendChild(link);}
  var original=link.href, raf=null, t0=0, D=1400;
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function frame(now){ var t=Math.min(1,(now-t0)/D), k=S/100;
    c.clearRect(0,0,S,S); c.fillStyle='#202326'; var r=18*k; c.beginPath(); c.moveTo(r,0); c.arcTo(S,0,S,S,r); c.arcTo(S,S,0,S,r); c.arcTo(0,S,0,0,r); c.arcTo(0,0,S,0,r); c.fill();
    c.save(); c.translate(14*k,14*k); c.scale(.72*k,.72*k);
    var p=ease(Math.min(1,t/0.75)), len=177.3; c.setLineDash([len,len]); c.lineDashOffset=len*(1-p);
    c.strokeStyle='#F7F7F5'; c.lineWidth=8; c.lineJoin='miter'; c.beginPath(); c.moveTo(14.5,84); c.lineTo(50,15); c.lineTo(85.5,84); c.stroke();
    var b=ease(Math.max(0,Math.min(1,(t-0.45)/0.55))); c.fillStyle='#B9BEC1'; c.fillRect(10,90,80*b,4); c.restore();
    link.href=cv.toDataURL('image/png');
    if(t<1) raf=requestAnimationFrame(frame); else { raf=null; if(original) link.href=original; }
  }
  function play(){ if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return; if(raf) cancelAnimationFrame(raf); t0=performance.now(); raf=requestAnimationFrame(frame); }
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) play(); });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',play); else play();
  window.StructaFavicon={play:play};
})();